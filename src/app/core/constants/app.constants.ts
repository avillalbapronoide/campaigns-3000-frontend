// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN' as const,
  USER: 'USER' as const,
};

// Campaign statuses
export const CAMPAIGN_STATUS = {
  ENVIADA: 'enviada' as const,
  PROGRAMADA: 'programada' as const,
  BORRADOR: 'borrador' as const,
};

// Subscriber statuses
export const SUBSCRIBER_STATUS = {
  SUSCRITO: 'suscrito' as const,
  PENDIENTE: 'pendiente' as const,
  BAJA: 'baja' as const,
};

// Valid categories
export const VALID_CATEGORIES = [
  'tecnología',
  'programación',
  'ia',
  'negocios',
  'marketing',
  'diseño',
  'blockchain',
  'datos',
] as const;
