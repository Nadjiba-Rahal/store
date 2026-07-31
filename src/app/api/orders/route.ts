import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import ShippingCompany from '@/models/ShippingCompany';
import Shop from '@/models/Shop';
import { getWilayaByCode } from '@/data/wilayas';

export const dynamic = 'force-dynamic';

// GET /api/orders?status=pending — owner-only order list
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ orders });
}

// POST /api/orders — public checkout submission (cash on delivery)
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const {
    items,
    deliveryType,
    customerName,
    customerPhone,
    wilayaCode,
    commune,
    address,
    note,
    courierName,
    paymentMethod = 'cod',
  } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Le panier est vide.' }, { status: 400 });
  }
  if (!customerName || !customerPhone || !wilayaCode || !commune) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  }
  if (deliveryType !== 'home' && deliveryType !== 'desk') {
    return NextResponse.json({ error: 'Mode de livraison invalide.' }, { status: 400 });
  }
  if (paymentMethod !== 'cod' && paymentMethod !== 'chargily') {
    return NextResponse.json({ error: 'Mode de paiement invalide.' }, { status: 400 });
  }

  const phoneRegex = /^(05|06|07)[0-9]{8}$/;
  if (!phoneRegex.test(String(customerPhone).replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Numero de telephone algerien invalide.' }, { status: 400 });
  }

  const store = await Shop.findOne();
  if (!store) {
    return NextResponse.json({ error: "La boutique n'est pas encore configurée." }, { status: 503 });
  }

  // Re-fetch products server-side so prices/stock can't be tampered with client-side.
  const orderItems = [];
  let subtotal = 0;
  for (const raw of items) {
    const product = await Product.findById(raw.productId);
    if (!product || !product.isAvailable) {
      return NextResponse.json(
        { error: `"${raw.name ?? 'Produit'}" n'est plus disponible.` },
        { status: 409 }
      );
    }
    const quantity = Math.max(1, Number(raw.quantity) || 1);
    const colorVariant = Array.isArray(product.variants)
      ? product.variants.find(
          (variant: { colorName?: string }) => (variant.colorName || '') === (raw.variant?.color || '')
        )
      : null;
    const sizeVariant = colorVariant
      ? colorVariant.sizes?.find((sz: { size?: string }) => (sz.size || '') === (raw.variant?.size || ''))
      : null;

    if (product.variants?.length && (!colorVariant || !sizeVariant)) {
      return NextResponse.json(
        { error: `Option indisponible pour "${product.name}".` },
        { status: 409 }
      );
    }

    const availableStock = sizeVariant ? sizeVariant.stock : product.stock;
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: `Stock insuffisant pour "${product.name}".` },
        { status: 409 }
      );
    }
    const unitPrice = sizeVariant?.priceOverride ?? product.price;
    orderItems.push({
      product: product._id,
      name: product.name,
      price: unitPrice,
      quantity,
      image: colorVariant?.image || product.images?.[0] || '',
      variant: {
        color: raw.variant?.color ?? '',
        size: raw.variant?.size ?? '',
      },
    });
    subtotal += unitPrice * quantity;
    if (sizeVariant) {
      sizeVariant.stock -= quantity;
    } else {
      product.stock -= quantity;
    }
    await product.save();
  }

  const freeThreshold = store.freeDeliveryThreshold || 0;
  const wilaya = getWilayaByCode(wilayaCode);
  const company = courierName ? await ShippingCompany.findOne({ name: courierName, isActive: true }).lean() : null;
  const shippingRate =
    (company as { rates: { wilayaCode: number; homeFee: number; deskFee: number }[] } | null)?.rates.find(
      (r) => Number(r.wilayaCode) === Number(wilayaCode)
    ) || null;
  const baseFee = shippingRate
    ? deliveryType === 'home'
      ? shippingRate.homeFee
      : shippingRate.deskFee
    : deliveryType === 'home'
      ? store.deliveryFeeHome
      : store.deliveryFeeDesk;
  const deliveryFee = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : baseFee;
  const total = subtotal + deliveryFee;

  const order = await Order.create({
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    deliveryType,
    courierName: courierName ?? '',
    customerName,
    customerPhone,
    wilayaCode,
    wilayaName: wilaya?.name ?? '',
    commune,
    address: address ?? '',
    note: note ?? '',
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    status: 'pending',
  });

  return NextResponse.json({ order }, { status: 201 });
}
