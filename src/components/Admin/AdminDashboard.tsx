import { useState, useEffect } from 'react';
import { Header } from '../Layout/Header';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';
import { api } from '../../utils/api';
import { emailService } from '../../services/email-service';
import type { Pharmacy, RegistrationRequest } from '../../types';
import { 
  Search, 
  Building, 
  Clock, 
  FileText,
  Eye,
  Check,
  X,
  TestTube
} from 'lucide-react';

interface AdminDashboardProps {
  onPharmacyDetail: (pharmacy: Pharmacy) => void;
  onReports: () => void;
  onHomeClick?: () => void;
}

export function AdminDashboard({ onPharmacyDetail, onReports, onHomeClick }: AdminDashboardProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pharmaciesData, requestsData] = await Promise.all([
        api.getPharmacies(),
        api.getRegistrationRequests()
      ]);
      setPharmacies(pharmaciesData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const result = await api.approveRegistrationRequest(requestId, 'Approved after verification', user || undefined);
      
      // Find the request to get pharmacy name
      const request = requests.find(req => req.id === requestId);
      
      // Show success message
      if (result.emailSent) {
        alert(`Pharmacy "${request?.pharmacy_name || 'Unknown'}" approved successfully! Credentials have been sent via email.\n\nThe pharmacy owner must verify their email before they can log in.`);
      } else {
        alert(`Pharmacy "${request?.pharmacy_name || 'Unknown'}" approved successfully! Please contact the pharmacy owner to provide their login credentials.\n\nThe pharmacy owner must verify their email before they can log in.`);
      }
      
      await loadData();
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await api.rejectRegistrationRequest(requestId, reason);
      await loadData();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const testEmailService = async () => {
    setTestingEmail(true);
    try {
      const result = await emailService.testEmailJS();
      if (result.success) {
        alert('EmailJS test successful! Check console for details.');
      } else {
        alert(`EmailJS test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Email test error:', error);
      alert('Email test failed. Check console for details.');
    } finally {
      setTestingEmail(false);
    }
  };

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const totalPharmacies = 12;
  const activePharmacies = 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        title={`${t('admin_dashboard', language)} - ${user?.name}`} 
        onHomeClick={onHomeClick}
        onReportsClick={onReports}
      />
      
      <main className="w-full flex justify-center px-4 py-6 lg:py-12">
        <div className="w-full max-w-7xl">
          <div className="space-y-8 lg:space-y-12 flex flex-col items-center">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {t('admin_dashboard', language)}
              </h1>
              <p className="text-lg text-gray-600">
                Manage pharmacy registrations and monitor system activity
              </p>
            </div>
            {/* Stats Overview */}
            <div className="w-full">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full max-w-6xl mx-auto">
                <Card className="text-center p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border-0">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-3">{activePharmacies}</div>
                  <div className="text-sm lg:text-base text-gray-600 font-medium">Active Pharmacies</div>
              </Card>
                <Card className="text-center p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border-0">
                  <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-3">{pendingRequests.length}</div>
                  <div className="text-sm lg:text-base text-gray-600 font-medium">{t('pending_requests', language)}</div>
              </Card>
                <Card className="text-center p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border-0 hidden lg:block">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-3">{totalPharmacies}</div>
                  <div className="text-sm lg:text-base text-gray-600 font-medium">Total Pharmacies</div>
              </Card>
                <Card className="text-center p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border-0 hidden lg:block">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-3">
                  {Math.round((activePharmacies / Math.max(totalPharmacies, 1)) * 100)}%
                </div>
                  <div className="text-sm lg:text-base text-gray-600 font-medium">Approval Rate</div>
              </Card>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="w-full">
              <div className="flex bg-white rounded-xl p-1 shadow-lg w-full max-w-2xl mx-auto">
              <button
                onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-4 px-6 rounded-lg text-sm lg:text-base font-semibold transition-all duration-300 min-h-[48px] ${
                  activeTab === 'overview'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('pharmacy_overview', language)}
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                  className={`flex-1 py-4 px-6 rounded-lg text-sm lg:text-base font-semibold transition-all duration-300 min-h-[48px] relative ${
                  activeTab === 'requests'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('pending_requests', language)}
                {pendingRequests.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Search */}
                <div className="w-full">
                  <div className="relative w-full max-w-2xl mx-auto">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search pharmacies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    fullWidth
                  />
                  </div>
                </div>

                {/* Pharmacies List */}
                <div className="w-full">
                  <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 w-full max-w-6xl mx-auto">
                  {loading ? (
                    <Card className="p-8 lg:col-span-2">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    </Card>
                  ) : filteredPharmacies.length === 0 ? (
                    <Card className="text-center py-12 lg:col-span-2 bg-white shadow-lg">
                      <Building className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {searchTerm ? 'No pharmacies found' : 'No pharmacies registered yet'}
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms' : 'Pharmacies will appear here once they register'}
                      </p>
                    </Card>
                  ) : (
                    filteredPharmacies.map((pharmacy) => (
                      <Card
                        key={pharmacy.id}
                        className="hover:shadow-xl transition-all duration-300 cursor-pointer p-6 lg:p-8 bg-white shadow-lg border-0 group"
                        onClick={() => onPharmacyDetail(pharmacy)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-3 text-lg lg:text-xl group-hover:text-green-600 transition-colors">
                              {pharmacy.name}
                            </h3>
                            <p className="text-sm lg:text-base text-gray-600 mb-4 font-medium">
                              {pharmacy.owner_name} • {pharmacy.email}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={`px-3 py-1 rounded-full font-semibold ${
                                pharmacy.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {pharmacy.status}
                              </span>
                              {pharmacy.last_update && (
                                <span className="text-gray-500 text-sm">
                                  Updated: {new Date(pharmacy.last_update).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPharmacyDetail(pharmacy);
                            }}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'requests' && (
              <div className="w-full">
                <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 w-full max-w-6xl mx-auto">
                {loading ? (
                  <Card className="p-8 lg:col-span-2">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </Card>
                ) : pendingRequests.length === 0 ? (
                  <Card className="text-center py-12 lg:col-span-2 bg-white shadow-lg">
                    <FileText className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending registration requests</h3>
                    <p className="text-gray-500">All registration requests have been processed</p>
                  </Card>
                ) : (
                  pendingRequests.map((request) => (
                    <Card key={request.id} className="p-6 lg:p-8 space-y-6 bg-white shadow-lg border-0">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 text-lg lg:text-xl">
                          {request.pharmacy_name}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-600 mb-3 font-medium">
                          {request.owner_name} • {request.email}
                        </p>
                        <p className="text-sm lg:text-base text-gray-600 mb-3">
                          {request.address}
                        </p>
                        {request.license_id && (
                          <p className="text-sm text-gray-500 font-medium">
                            License: {request.license_id}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4">
                          <Clock className="w-4 h-4" />
                          <span>Submitted: {new Date(request.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button
                          onClick={() => handleApproveRequest(request.id)}
                          variant="primary"
                          size="sm"
                          className="flex-1 py-3 font-semibold"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          variant="danger"
                          size="sm"
                          className="flex-1 py-3 font-semibold"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="w-full">
              <Card className="p-6 lg:p-8 bg-white shadow-lg border-0 w-full max-w-2xl mx-auto">
                <h3 className="font-bold text-gray-900 mb-6 text-center text-lg lg:text-xl">Quick Actions</h3>
                <div className="space-y-3">
                <Button
                  onClick={onReports}
                  variant="secondary"
                  fullWidth
                    className="justify-center py-4 text-lg font-semibold"
                >
                    <FileText className="w-5 h-5 mr-3" />
                  {t('reports', language)}
                </Button>
                
                <Button
                  onClick={testEmailService}
                  variant="ghost"
                  fullWidth
                  className="justify-center py-4 text-lg font-semibold"
                  loading={testingEmail}
                >
                    <TestTube className="w-5 h-5 mr-3" />
                  Test Email Service
                </Button>
              </div>
            </Card>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}