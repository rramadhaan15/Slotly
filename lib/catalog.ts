export type Venue = {
  id: string;
  name: string;
  category: string;
  area: string;
  city: string;
  distance: number;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  tag: string;
  description: string;
  facilities: string[];
  units: string[];
};
export const categories = [
  'Semua',
  'Olahraga',
  'Salon & Kecantikan',
  'Studio',
  'Hiburan',
  'Kesehatan',
];
export const venues: Venue[] = [
  {
    id: 'padel',
    name: 'The Padel Club',
    category: 'Olahraga',
    area: 'Kemang',
    city: 'Jakarta Selatan',
    distance: 1.2,
    price: 150000,
    rating: 4.9,
    reviews: 128,
    image: '/images/padel.jpg',
    tag: 'Paling populer',
    description:
      'Rally seru, suasana baru. Nikmati lapangan premium bersama teman-teman, dengan fasilitas lengkap dan area bersantai yang nyaman.',
    facilities: ['Parkir gratis', 'Ruang ganti', 'Kafe', 'Sewa peralatan'],
    units: ['Court A', 'Court B', 'Court C'],
  },
  {
    id: 'barber',
    name: 'Kala Barbershop',
    category: 'Salon & Kecantikan',
    area: 'Cipete',
    city: 'Jakarta Selatan',
    distance: 2.4,
    price: 85000,
    rating: 4.8,
    reviews: 96,
    image: '/images/barber.jpg',
    tag: 'Pilihan Slotly',
    description:
      'Potongan yang pas, hari yang lebih percaya diri. Barber berpengalaman dengan konsultasi gaya dalam ruang yang hangat.',
    facilities: ['AC', 'Wi-Fi', 'Minuman gratis', 'Parkir'],
    units: ['Haircut & styling', 'Haircut + wash'],
  },
  {
    id: 'studio',
    name: 'Ruang Cerita Studio',
    category: 'Studio',
    area: 'Bangka',
    city: 'Jakarta Selatan',
    distance: 3.1,
    price: 200000,
    rating: 4.9,
    reviews: 84,
    image: '/images/studio.jpg',
    tag: '',
    description:
      'Ruang untuk setiap ide kreatif. Studio foto dengan pilihan backdrop dan perlengkapan dasar untuk sesi produktifmu.',
    facilities: ['Lighting', 'AC', 'Wi-Fi', 'Ruang makeup'],
    units: ['Daylight room', 'White room'],
  },
  {
    id: 'badminton',
    name: 'Arena Badminton',
    category: 'Olahraga',
    area: 'Pancoran',
    city: 'Jakarta Selatan',
    distance: 4.2,
    price: 65000,
    rating: 4.7,
    reviews: 112,
    image: '/images/badminton.jpg',
    tag: 'Harga bersahabat',
    description:
      'Saatnya main bareng. Lapangan indoor dengan lantai nyaman, pencahayaan merata, dan ruang istirahat untuk komunitasmu.',
    facilities: ['Indoor', 'Parkir', 'Ruang ganti', 'Kantin'],
    units: ['Lapangan 1', 'Lapangan 2', 'Lapangan 3'],
  },
  {
    id: 'salon',
    name: 'Bloom Beauty House',
    category: 'Salon & Kecantikan',
    area: 'Senopati',
    city: 'Jakarta Selatan',
    distance: 3.5,
    price: 120000,
    rating: 4.8,
    reviews: 76,
    image: '/images/salon.jpg',
    tag: '',
    description:
      'Luangkan waktu untuk diri sendiri. Perawatan rambut dan kecantikan dalam suasana tenang bersama terapis berpengalaman.',
    facilities: ['AC', 'Wi-Fi', 'Private room', 'Minuman'],
    units: ['Hair treatment', 'Nail studio'],
  },
  {
    id: 'music',
    name: 'Sela Music Studio',
    category: 'Studio',
    area: 'Tebet',
    city: 'Jakarta Selatan',
    distance: 5.2,
    price: 100000,
    rating: 4.8,
    reviews: 59,
    image: '/images/music.jpg',
    tag: '',
    description:
      'Temukan ritmemu di studio kedap suara dengan peralatan musik lengkap. Cocok untuk latihan band dan eksplorasi musik.',
    facilities: ['AC', 'Drum kit', 'Amplifier', 'Sound system'],
    units: ['Studio A', 'Studio B'],
  },
];
export const money = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const dateLabel = (date: string) =>
  new Date(date + 'T12:00:00+07:00').toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
