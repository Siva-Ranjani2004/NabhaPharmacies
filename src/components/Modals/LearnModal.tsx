import React from 'react';
import { X, Smartphone, Wifi, Shield, Users } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';

interface LearnModalProps {
  onClose: () => void;
}

export function LearnModal({ onClose }: LearnModalProps) {
  const { language } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {t('learn_how', language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h3>
            <p className="text-gray-600 leading-relaxed">
              Nabha Pharmacies is a digital platform that helps rural pharmacies update their medicine stock daily, 
              making it easier for patients and doctors to find available medicines in the area.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">For Pharmacies</h4>
                <p className="text-sm text-gray-600">
                  Register your pharmacy, get admin approval, then update your medicine stock daily. 
                  Patients and doctors can see what's available.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Mobile-First Design</h4>
                <p className="text-sm text-gray-600">
                  Designed for mobile phones with large buttons and simple navigation. 
                  Works on any smartphone or tablet.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Wifi className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Works Offline</h4>
                <p className="text-sm text-gray-600">
                  Update stock even without internet. Changes are saved locally and sync 
                  automatically when you're back online.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Admin Oversight</h4>
                <p className="text-sm text-gray-600">
                  All pharmacies are verified by Nabha Civil Hospital admin. 
                  Stock updates are monitored for accuracy.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Getting Started</h4>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Click "Create Account" to register your pharmacy</li>
              <li>Fill in pharmacy details and submit request</li>
              <li>Admin will visit and verify your pharmacy</li>
              <li>Once approved, you'll receive login credentials</li>
              <li>Start updating your medicine stock daily</li>
            </ol>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onClose} variant="primary" fullWidth>
            Got It!
          </Button>
        </div>
      </Card>
    </div>
  );
}