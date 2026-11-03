export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  store?: {
    id: string;
    name: string;
  } | null;
  assignedStoreRatingAverage?: number | null;
}

export interface Store {
  id: string;
  name: string;
  email?: string;
  address: string;
  overallRating: number;
  totalRatings?: number;
  ratingCount?: number;
  userRating?: number | null;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface OwnerDashboardData {
  store: {
    id: string;
    name: string;
    email: string;
    address: string;
    averageRating: number;
    totalRatings: number;
  };
  ratings: Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number;
    createdAt: string;
  }>;
}

