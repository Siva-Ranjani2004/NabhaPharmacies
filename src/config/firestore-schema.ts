// Firestore Database Schema for Nabha Pharmacies
// This file defines the structure and security rules for our Firestore collections

export interface FirestoreUser {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'pharmacy';
  pharmacy_id?: string;
  preferred_language: 'en' | 'hi' | 'pa';
  account_status?: 'pending_verification' | 'active' | 'disabled';
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface FirestorePharmacy {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  license_id?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
  last_update?: Date;
  admin_notes?: string;
}

export interface FirestoreMedicine {
  id: string;
  name: string;
  generic_name?: string;
  unit: string;
  pack_size?: string;
  category?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FirestoreStock {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  medicine_name: string;
  generic_name?: string;
  unit: string;
  pack_size?: string;
  category?: string;
  quantity: number;
  out_of_stock: boolean;
  last_updated_by: string;
  last_updated_at: Date;
  version: number;
  min_quantity?: number;
  max_quantity?: number;
  created_at: Date;
}

export interface FirestoreActivityLog {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  medicine_name: string;
  old_quantity: number;
  new_quantity: number;
  updated_by: string;
  timestamp: Date;
  action: 'update' | 'add' | 'remove';
  notes?: string;
}

export interface FirestoreRegistrationRequest {
  id: string;
  pharmacy_name: string;
  owner_name: string;
  email: string;
  address: string;
  license_id?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

// Collection paths
export const COLLECTIONS = {
  USERS: 'users',
  PHARMACIES: 'pharmacies',
  MEDICINES: 'medicines',
  STOCK: 'stock',
  ACTIVITY_LOGS: 'activity-logs',
  REGISTRATION_REQUESTS: 'registration-requests'
} as const;

// Subcollection paths
export const SUBCOLLECTIONS = {
  PHARMACY_MEDICINES: (pharmacyId: string) => `pharmacies/${pharmacyId}/medicines`,
  PHARMACY_STOCK: (pharmacyId: string) => `pharmacies/${pharmacyId}/stock`,
  PHARMACY_ACTIVITY: (pharmacyId: string) => `pharmacies/${pharmacyId}/activity-logs`
} as const;

