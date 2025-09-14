import React, { useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import { Header } from '../Layout/Header';
import { Toast } from '../UI/Toast';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';
import { api } from '../../utils/api';
import { Building, User, Mail, MapPin, FileText } from 'lucide-react';

interface RegisterPageProps {
  onBack: () => void;
  onHomeClick?: () => void;
}

export function RegisterPage({ onBack, onHomeClick }: RegisterPageProps) {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  const [formData, setFormData] = useState({
    pharmacy_name: '',
    owner_name: '',
    email: '',
    address: '',
    license_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.submitRegistrationRequest(formData);
      setSubmitted(true);
      setToast({
        message: 'Registration request submitted successfully!',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Failed to submit registration request',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header showBack onBack={onBack} title="Registration Submitted" onHomeClick={onHomeClick} />
        
        <main className="max-w-lg mx-auto px-4 py-8">
          <Card padding="lg" className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 text-white">✓</div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Request Submitted Successfully!
            </h1>
            
            <div className="space-y-4 text-left">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Your request is now visible to the admin</li>
                  <li>Admin will visit your pharmacy for verification</li>
                  <li>Once approved, admin will provide you with login credentials</li>
                  <li>You can then login and start updating your medicine stock daily</li>
                </ol>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Important Notes</h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Keep your pharmacy open during business hours for admin visit</li>
                  <li>Have your pharmacy license and documents ready</li>
                  <li>Admin may contact you to schedule the visit</li>
                  <li>After approval, contact admin to get your login credentials</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Button onClick={onBack} variant="primary" fullWidth>
                Back to Home
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header showBack onBack={onBack} title={t('create_account', language)} onHomeClick={onHomeClick} />
      
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <Card padding="lg" className="shadow-professional-lg">
            <div className="text-center space-y-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Building className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('create_account', language)}
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
                <p className="text-gray-600 text-lg">
                  {t('request_account', language)}
                </p>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Building className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 mt-6" />
                <Input
                  label={t('pharmacy_name', language)}
                  type="text"
                  value={formData.pharmacy_name}
                  onChange={(e) => handleInputChange('pharmacy_name', e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g., Nabha Medical Store"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 mt-6" />
                <Input
                  label={t('owner_name', language)}
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  fullWidth
                  required
                  placeholder="Full name of owner/manager"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 mt-6" />
                <Input
                  label={t('email', language)}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  fullWidth
                  required
                  placeholder="your.email@example.com"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-6 text-gray-400" />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('address', language)}
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  placeholder="Complete address with street, landmark, PIN code"
                  className="block w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base min-h-[88px] resize-none"
                  rows={3}
                />
              </div>

              <div className="relative">
                <FileText className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 mt-6" />
                <Input
                  label={t('license_id', language)}
                  type="text"
                  value={formData.license_id}
                  onChange={(e) => handleInputChange('license_id', e.target.value)}
                  fullWidth
                  placeholder="Optional - if available"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Verification Process</h3>
              <p className="text-sm text-green-800">
                After submitting, an admin from Nabha Civil Hospital will visit your pharmacy 
                to verify the details and approve your account. This ensures the authenticity 
                of all registered pharmacies.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {t('submit_request', language)}
            </Button>

            <div className="text-xs text-gray-500 text-center leading-relaxed">
              By submitting this request, you agree to Punjab Health Department's 
              terms and policies for pharmacy registration.
            </div>
          </form>
        </Card>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}