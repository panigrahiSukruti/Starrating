export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  STORE_OWNER = 'STORE_OWNER'
}

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-antigravity-store-rating-2026';
export const PORT = Number(process.env.PORT) || 5000;

