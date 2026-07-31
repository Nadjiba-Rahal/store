import { buildWhatsAppLink } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton({
  phone,
  message,
  label = 'Contacter sur WhatsApp',
  className,
}: {
  phone: string;
  message: string;
  label?: string;
  className?: string;
}) {
  const href = buildWhatsAppLink(phone, message);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <Button type="button" variant="stamp" size="lg" className="w-full">
        <MessageCircle size={18} />
        {label}
      </Button>
    </a>
  );
}
