export type DeliveryType = 'domicile' | 'stopdesk';

export interface Wilaya {
  code: string;
  name: string;
  communes: string[];
}

export const ALGERIA_WILAYAS: Wilaya[] = [
  { code: '01', name: 'Adrar', communes: ['Adrar', 'Reggane', 'Aoulef', 'Timimoun'] },
  { code: '02', name: 'Chlef', communes: ['Chlef', 'Tenes', 'Oued Fodda', 'El Karimia'] },
  { code: '03', name: 'Laghouat', communes: ['Laghouat', 'Aflou', 'Ksar El Hirane', 'Hassi Rmel'] },
  { code: '04', name: 'Oum El Bouaghi', communes: ['Oum El Bouaghi', 'Ain Beida', 'Ain Mlila', 'Meskiana'] },
  { code: '05', name: 'Batna', communes: ['Batna', 'Barika', 'Arris', 'Merouana'] },
  { code: '06', name: 'Bejaia', communes: ['Bejaia', 'Akbou', 'Amizour', 'Sidi Aich'] },
  { code: '07', name: 'Biskra', communes: ['Biskra', 'Tolga', 'Sidi Okba', 'Ouled Djellal'] },
  { code: '08', name: 'Bechar', communes: ['Bechar', 'Taghit', 'Abadla', 'Beni Abbes'] },
  { code: '09', name: 'Blida', communes: ['Blida', 'Boufarik', 'Mouzaia', 'El Affroun'] },
  { code: '10', name: 'Bouira', communes: ['Bouira', 'Sour El Ghozlane', 'Lakhdaria', 'Ain Bessem'] },
  { code: '11', name: 'Tamanrasset', communes: ['Tamanrasset', 'In Salah', 'In Guezzam', 'Abalessa'] },
  { code: '12', name: 'Tebessa', communes: ['Tebessa', 'Bir El Ater', 'Cheria', 'El Kouif'] },
  { code: '13', name: 'Tlemcen', communes: ['Tlemcen', 'Maghnia', 'Ghazaouet', 'Remchi'] },
  { code: '14', name: 'Tiaret', communes: ['Tiaret', 'Sougueur', 'Frenda', 'Mahdia'] },
  { code: '15', name: 'Tizi Ouzou', communes: ['Tizi Ouzou', 'Azazga', 'Draa Ben Khedda', 'Larbaa Nath Irathen'] },
  { code: '16', name: 'Alger', communes: ['Alger Centre', 'Bab Ezzouar', 'Bir Mourad Rais', 'Kouba', 'El Harrach'] },
  { code: '17', name: 'Djelfa', communes: ['Djelfa', 'Ain Oussera', 'Messaad', 'Hassi Bahbah'] },
  { code: '18', name: 'Jijel', communes: ['Jijel', 'Taher', 'El Milia', 'Chekfa'] },
  { code: '19', name: 'Setif', communes: ['Setif', 'El Eulma', 'Ain Oulmene', 'Bougaa'] },
  { code: '20', name: 'Saida', communes: ['Saida', 'Ain El Hadjar', 'Youb', 'Sidi Boubekeur'] },
  { code: '21', name: 'Skikda', communes: ['Skikda', 'Azzaba', 'Collo', 'El Harrouch'] },
  { code: '22', name: 'Sidi Bel Abbes', communes: ['Sidi Bel Abbes', 'Telagh', 'Sfisef', 'Ben Badis'] },
  { code: '23', name: 'Annaba', communes: ['Annaba', 'El Bouni', 'Berrahal', 'Seraidi'] },
  { code: '24', name: 'Guelma', communes: ['Guelma', 'Oued Zenati', 'Boumahra Ahmed', 'Hammam Debagh'] },
  { code: '25', name: 'Constantine', communes: ['Constantine', 'El Khroub', 'Ain Smara', 'Hamma Bouziane'] },
  { code: '26', name: 'Medea', communes: ['Medea', 'Berrouaghia', 'Ksar El Boukhari', 'Tablat'] },
  { code: '27', name: 'Mostaganem', communes: ['Mostaganem', 'Ain Tedles', 'Sidi Ali', 'Bouguirat'] },
  { code: '28', name: "M'Sila", communes: ["M'Sila", 'Bousaada', 'Sidi Aissa', 'Ain El Melh'] },
  { code: '29', name: 'Mascara', communes: ['Mascara', 'Sig', 'Mohammadia', 'Tighennif'] },
  { code: '30', name: 'Ouargla', communes: ['Ouargla', 'Touggourt', 'Hassi Messaoud', "N'Goussa"] },
  { code: '31', name: 'Oran', communes: ['Oran', 'Bir El Djir', 'Es Senia', 'Arzew'] },
  { code: '32', name: 'El Bayadh', communes: ['El Bayadh', 'Brezina', 'Bougtob', 'El Abiodh Sidi Cheikh'] },
  { code: '33', name: 'Illizi', communes: ['Illizi', 'Djanet', 'Bordj Omar Driss', 'Debdeb'] },
  { code: '34', name: 'Bordj Bou Arreridj', communes: ['Bordj Bou Arreridj', 'Ras El Oued', 'Mansoura', 'Bordj Zemoura'] },
  { code: '35', name: 'Boumerdes', communes: ['Boumerdes', 'Boudouaou', 'Thenia', 'Dellys'] },
  { code: '36', name: 'El Tarf', communes: ['El Tarf', 'El Kala', 'Besbes', 'Dréan'] },
  { code: '37', name: 'Tindouf', communes: ['Tindouf', 'Oum El Assel'] },
  { code: '38', name: 'Tissemsilt', communes: ['Tissemsilt', 'Theniet El Had', 'Lardjem', 'Bordj Bounaama'] },
  { code: '39', name: 'El Oued', communes: ['El Oued', 'Guemar', 'Debila', 'Mih Ouensa'] },
  { code: '40', name: 'Khenchela', communes: ['Khenchela', 'Kais', 'El Hamma', 'Chechar'] },
  { code: '41', name: 'Souk Ahras', communes: ['Souk Ahras', 'Sedrata', 'Mdaourouch', 'Taoura'] },
  { code: '42', name: 'Tipaza', communes: ['Tipaza', 'Cherchell', 'Kolea', 'Bou Ismail'] },
  { code: '43', name: 'Mila', communes: ['Mila', 'Chelghoum Laid', 'Telerghma', 'Ferdjioua'] },
  { code: '44', name: 'Ain Defla', communes: ['Ain Defla', 'Khemis Miliana', 'Miliana', 'El Attaf'] },
  { code: '45', name: 'Naama', communes: ['Naama', 'Mecheria', 'Ain Sefra', 'Sfissifa'] },
  { code: '46', name: 'Ain Temouchent', communes: ['Ain Temouchent', 'Hammam Bou Hadjar', 'Beni Saf', 'El Malah'] },
  { code: '47', name: 'Ghardaia', communes: ['Ghardaia', 'Berriane', 'Metlili', 'El Meniaa'] },
  { code: '48', name: 'Relizane', communes: ['Relizane', 'Oued Rhiou', 'Mazouna', 'Ammi Moussa'] },
  { code: '49', name: 'Timimoun', communes: ['Timimoun', 'Charouine', 'Tinerkouk', 'Aougrout'] },
  { code: '50', name: 'Bordj Badji Mokhtar', communes: ['Bordj Badji Mokhtar', 'Timiaouine'] },
  { code: '51', name: 'Ouled Djellal', communes: ['Ouled Djellal', 'Sidi Khaled', 'Doucen', 'Ras El Miad'] },
  { code: '52', name: 'Beni Abbes', communes: ['Beni Abbes', 'Kerzaz', 'Igli', 'Ouled Khoudir'] },
  { code: '53', name: 'In Salah', communes: ['In Salah', 'Foggaret Ezzoua', 'In Ghar'] },
  { code: '54', name: 'In Guezzam', communes: ['In Guezzam', 'Tin Zaouatine'] },
  { code: '55', name: 'Touggourt', communes: ['Touggourt', 'Nezla', 'Temacine', 'Megarine'] },
  { code: '56', name: 'Djanet', communes: ['Djanet', 'Bordj El Haouas'] },
  { code: '57', name: "El M'Ghair", communes: ["El M'Ghair", 'Djamaa', 'Sidi Amrane', 'Still'] },
  { code: '58', name: 'El Meniaa', communes: ['El Meniaa', 'Hassi Gara', 'Hassi Fehal'] },
  { code: '59', name: 'Aflou', communes: ['Aflou', 'Sidi Makhlouf', 'El Ghicha'] },
  { code: '60', name: 'Barika', communes: ['Barika', 'Ras El Aioun', 'N\u2019Gaous'] },
  { code: '61', name: 'Ksar Chellala', communes: ['Ksar Chellala', 'Ain Bouchekif', 'Faidja'] },
  { code: '62', name: 'Messaad', communes: ['Messaad', 'Charef', 'Sidi Baizid'] },
  { code: '63', name: 'Ain Oussera', communes: ['Ain Oussera', 'Birine', 'Zaafrane'] },
  { code: '64', name: 'Boussaada', communes: ['Boussaada', 'Ouled Sidi Brahim', 'Sidi Ameur'] },
  { code: '65', name: 'El Abiodh Sidi Cheikh', communes: ['El Abiodh Sidi Cheikh', 'Boualem', 'Brezina'] },
  { code: '66', name: 'El Kantara', communes: ['El Kantara', 'Ain Touta', 'Djemourah'] },
  { code: '67', name: 'Bir El Ater', communes: ['Bir El Ater', 'El Ogla', 'Stah Guentis'] },
  { code: '68', name: 'Ksar El Boukhari', communes: ['Ksar El Boukhari', 'Ain Boucif', 'Ouled Bouachra'] },
  { code: '69', name: 'El Aricha', communes: ['El Aricha', 'Sebdou', 'Sidi Djillali'] },
];

export const COURIERS = ['Yalidine', 'ZrExpress', 'Maystro Delivery', 'Noest Express'] as const;

export type CourierName = (typeof COURIERS)[number];

export function getWilayaByCode(code: string) {
  return ALGERIA_WILAYAS.find((wilaya) => wilaya.code === code);
}

export function getWilayaLabel(code: string) {
  const wilaya = getWilayaByCode(code);
  return wilaya ? `${wilaya.code} - ${wilaya.name}` : code;
}
