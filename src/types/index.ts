export interface User {
  id: string;
  name: string;
  email: string;
  role: 'pharmacy' | 'admin';
  pharmacy_id?: string;
  preferred_language: 'en' | 'hi' | 'pa';
}

export interface Pharmacy {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  last_update?: Date;
  created_at: Date;
  license_id?: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  unit: string;
  pack_size?: string;
}

export interface Stock {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  medicine_name: string;
  generic_name?: string;
  quantity: number;
  unit: string;
  pack_size?: string;
  category?: string;
  out_of_stock: boolean;
  last_updated_by: string;
  last_updated_at: Date;
  version: number;
  created_at?: Date;
}

export interface ActivityLog {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  medicine_name: string;
  old_quantity: number;
  new_quantity: number;
  updated_by: string;
  timestamp: Date;
}

export interface RegistrationRequest {
  id: string;
  pharmacy_name: string;
  owner_name: string;
  email: string;
  address: string;
  license_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: Date;
}

export interface AppState {
  user: User | null;
  isOnline: boolean;
  currentLanguage: 'en' | 'hi' | 'pa';
  pendingUpdates: Stock[];
}