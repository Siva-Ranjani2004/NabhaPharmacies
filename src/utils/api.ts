import { storage } from './storage';
import type { User, Pharmacy, Stock, ActivityLog, RegistrationRequest } from '../types';

// Mock API base URL - would be replaced with real backend
const API_BASE = '/api';

class ApiManager {
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingUpdates();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isOnline) {
      throw new Error('OFFLINE');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Mock implementation - returns demo users
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    if (email === 'admin@nabha.gov.in' && password === 'admin123') {
      return {
        user: {
          id: 'admin-1',
          name: 'Dr. Rajesh Singh',
          email: 'admin@nabha.gov.in',
          role: 'admin',
          preferred_language: 'en'
        },
        token: 'mock-admin-token'
      };
    } else if (email === 'pharmacy@nabhamedical.com' && password === 'pharmacy123') {
      return {
        user: {
          id: 'pharmacy-1',
          name: 'Nabha Medical Store',
          email: 'pharmacy@nabhamedical.com',
          role: 'pharmacy',
          pharmacy_id: 'pharmacy-1',
          preferred_language: 'en'
        },
        token: 'mock-pharmacy-token'
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  // Registration
  async submitRegistrationRequest(data: Omit<RegistrationRequest, 'id' | 'status' | 'submitted_at'>): Promise<{ request_id: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const request: RegistrationRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'pending',
      submitted_at: new Date()
    };
    
    // Store in local storage for demo
    const existingRequests = JSON.parse(localStorage.getItem('registration-requests') || '[]');
    existingRequests.push(request);
    localStorage.setItem('registration-requests', JSON.stringify(existingRequests));
    
    return { request_id: request.id };
  }

  // Stock Management
  async getStock(pharmacyId: string): Promise<Stock[]> {
    if (!this.isOnline) {
      // Return cached stock from IndexedDB
      return await storage.getAll('stock');
    }

    // Mock stock data
    const mockStock: Stock[] = [
      {
        id: 'stock-1',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-1',
        medicine_name: 'Paracetamol 500mg',
        quantity: 20,
        unit: 'tablets',
        out_of_stock: false,
        last_updated_by: 'Staff',
        last_updated_at: new Date(),
        version: 1
      },
      {
        id: 'stock-2',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-2',
        medicine_name: 'Amoxicillin 250mg',
        quantity: 0,
        unit: 'capsules',
        out_of_stock: true,
        last_updated_by: 'Staff',
        last_updated_at: new Date(),
        version: 1
      },
      {
        id: 'stock-3',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-3',
        medicine_name: 'ORS Sachets',
        quantity: 10,
        unit: 'sachets',
        out_of_stock: false,
        last_updated_by: 'Staff',
        last_updated_at: new Date(),
        version: 1
      },
      {
        id: 'stock-4',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-4',
        medicine_name: 'Crocin Advance',
        quantity: 15,
        unit: 'tablets',
        out_of_stock: false,
        last_updated_by: 'Staff',
        last_updated_at: new Date(),
        version: 1
      },
      {
        id: 'stock-5',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-5',
        medicine_name: 'Cetirizine 10mg',
        quantity: 0,
        unit: 'tablets',
        out_of_stock: true,
        last_updated_by: 'Staff',
        last_updated_at: new Date(),
        version: 1
      }
    ];

    // Cache stock data
    for (const stock of mockStock) {
      await storage.put('stock', stock);
    }

    return mockStock;
  }

  async updateStock(stock: Partial<Stock>): Promise<Stock> {
    const updatedStock: Stock = {
      ...stock as Stock,
      last_updated_at: new Date(),
      version: (stock.version || 0) + 1
    };

    if (!this.isOnline) {
      // Save to pending updates
      await storage.addPendingUpdate(updatedStock);
      throw new Error('OFFLINE_SAVED');
    }

    // Mock successful update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update local cache
    await storage.put('stock', updatedStock);
    
    return updatedStock;
  }

  async syncPendingUpdates(): Promise<void> {
    if (!this.isOnline) return;

    const pendingUpdates = await storage.getPendingUpdates();
    
    for (const update of pendingUpdates) {
      try {
        await this.updateStock(update);
        await storage.delete('pendingUpdates', update.id);
      } catch (error) {
        console.error('Failed to sync update:', error);
        // Continue with next update
      }
    }
  }

  // Activity Log
  async getActivityLog(pharmacyId: string): Promise<ActivityLog[]> {
    // Mock activity data
    return [
      {
        id: 'activity-1',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-1',
        medicine_name: 'Paracetamol 500mg',
        old_quantity: 15,
        new_quantity: 20,
        updated_by: 'Staff',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: 'activity-2',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-2',
        medicine_name: 'Amoxicillin 250mg',
        old_quantity: 5,
        new_quantity: 0,
        updated_by: 'Staff',
        timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      },
      {
        id: 'activity-3',
        pharmacy_id: pharmacyId,
        medicine_id: 'med-3',
        medicine_name: 'ORS Sachets',
        old_quantity: 8,
        new_quantity: 10,
        updated_by: 'Staff',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    ];
  }

  // Registration Requests (Admin)
  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    const requests = JSON.parse(localStorage.getItem('registration-requests') || '[]');
    return requests.map((req: any) => ({
      ...req,
      submitted_at: new Date(req.submitted_at)
    }));
  }

  async approveRegistrationRequest(requestId: string, adminNotes?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requests = JSON.parse(localStorage.getItem('registration-requests') || '[]');
    const updatedRequests = requests.map((req: any) => 
      req.id === requestId 
        ? { ...req, status: 'approved', admin_notes: adminNotes }
        : req
    );
    localStorage.setItem('registration-requests', JSON.stringify(updatedRequests));
  }

  async rejectRegistrationRequest(requestId: string, reason: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const requests = JSON.parse(localStorage.getItem('registration-requests') || '[]');
    const updatedRequests = requests.map((req: any) => 
      req.id === requestId 
        ? { ...req, status: 'rejected', admin_notes: reason }
        : req
    );
    localStorage.setItem('registration-requests', JSON.stringify(updatedRequests));
  }

  // Admin - Get all pharmacies
  async getPharmacies(): Promise<Pharmacy[]> {
    return [
      {
        id: 'pharmacy-1',
        name: 'Nabha Medical Store',
        owner_name: 'Harpreet Singh',
        email: 'pharmacy@nabhamedical.com',
        address: 'Main Bazaar, Nabha, Punjab',
        status: 'approved',
        last_update: new Date(),
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        license_id: 'PB-NAB-001'
      },
      {
        id: 'pharmacy-2',
        name: 'Guru Nanak Medical Store',
        owner_name: 'Jasbir Kaur',
        email: 'gurunanak@medical.com',
        address: 'Civil Lines, Nabha, Punjab',
        status: 'approved',
        last_update: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      }
    ];
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export const api = new ApiManager();