/**
 * Fallback Wash Services
 *
 * Used when backend service catalog is loading, offline, or in dev preview mode.
 * Matches the actual services defined in Django backend.
 */

export const FALLBACK_SERVICES = [
  {
    id: 1,
    name: 'Express Foam Wash',
    slug: 'express-foam-wash',
    short_description: 'Exterior high-pressure foam wash, tire dressing & glass cleaning at your doorstep.',
    description: 'High-pressure water rinse, thick snow foam soak, hand mitt wash, tire dressing, exterior glass cleaning and microfiber drying.',
    price: 519,
    duration_minutes: 45,
    is_active: true,
  }
];
