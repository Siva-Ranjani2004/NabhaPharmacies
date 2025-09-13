import React from 'react';
import { X, Phone, Mail, MessageCircle } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';

interface ContactModalProps {
  onClose: () => void;
}

export function ContactModal({ onClose }: ContactModalProps) {
  const { language } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {t('contact_queries', language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Support Phone</p>
              <a href="tel:+911672234567" className="text-blue-600 hover:underline">
                +91 1672 234567
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Support Email</p>
              <a href="mailto:support@nabha.gov.in" className="text-blue-600 hover:underline">
                support@nabha.gov.in
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Admin Contact</p>
              <p className="text-sm text-gray-600">Dr. Rajesh Singh, Chief Medical Officer</p>
              <a href="tel:+911672234568" className="text-blue-600 hover:underline">
                +91 1672 234568
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Frequently Asked Questions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Q:</strong> How do I reset my password?</p>
            <p><strong>A:</strong> Contact admin or use the "Forgot Password" link on login.</p>
            
            <p><strong>Q:</strong> What if the app works offline?</p>
            <p><strong>A:</strong> Yes! Updates are saved locally and sync when you're back online.</p>
            
            <p><strong>Q:</strong> How do I register a new pharmacy?</p>
            <p><strong>A:</strong> Use "Create Account" and admin will verify in-person.</p>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onClose} variant="primary" fullWidth>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}