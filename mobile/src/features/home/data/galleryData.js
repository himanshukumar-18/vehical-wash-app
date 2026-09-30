/**
 * The Black Wash — Gallery Data Structure
 *
 * This file contains all photo gallery entries displayed on the Home screen.
 * You can periodically add your own real clicked photos by adding new entries here.
 *
 * Supported image formats:
 * - Local assets: require('@/assets/images/your-photo.jpg')
 * - Remote URLs: 'https://images.unsplash.com/photo-...'
 */

export const GALLERY_CATEGORIES = ['All', 'Foam Wash', 'Exterior', 'Detailing', 'Shine'];

export const GALLERY_ITEMS = [
  {
    id: 'wash-001',
    title: 'The Black Wash Studio',
    category: 'Detailing',
    tag: 'Studio Setup',
    description: 'Our dedicated doorstep & studio detailing unit with high-pressure snow foam rigs.',
    image: require('@/assets/images/login-register.png'),
    location: 'Hazaribagh',
  },
  {
    id: 'wash-002',
    title: 'Snow Foam Blanket',
    category: 'Foam Wash',
    tag: 'High Pressure',
    description: 'Thick pH-neutral snow foam breaking down tough road grime and dirt safely.',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop&q=80',
    location: 'Doorstep Service',
  },
  {
    id: 'wash-003',
    title: 'Mirror Gloss Reflection',
    category: 'Shine',
    tag: 'Ceramic Finish',
    description: 'Ultra-hydrophobic ceramic wax coating delivering showroom deep gloss reflections.',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80',
    location: 'Doorstep Service',
  },
  {
    id: 'wash-004',
    title: 'Wheel & Tyre Rejuvenation',
    category: 'Exterior',
    tag: 'Brake Dust Clean',
    description: 'Deep rim decontamination and satin black non-sling tyre dressing application.',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80',
    location: 'Doorstep Service',
  },
  {
    id: 'wash-005',
    title: 'Interior Deep Extraction',
    category: 'Detailing',
    tag: 'Upholstery Care',
    description: 'Complete cabin sanitization, leather conditioning, and AC duct deodorizing.',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80',
    location: 'Doorstep Service',
  },
  {
    id: 'wash-006',
    title: 'Hydrophobic Water Beading',
    category: 'Shine',
    tag: 'Paint Shield',
    description: 'Rain and dirt repellent paint sealant leaving super-slick water beading.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
    location: 'Doorstep Service',
  },
];

export default GALLERY_ITEMS;
