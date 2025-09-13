import { useState, useEffect } from 'react';
import { Header } from '../Layout/Header';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/translations';
import { 
  BarChart3, 
  LineChart, 
  Download, 
  FileText, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ReportsAnalyticsProps {
  onBack: () => void;
  onHomeClick?: () => void;
  onReportsClick?: () => void;
}

interface ReportData {
  totalPharmaciesUpdated: number;
  totalOutOfStockMedicines: number;
  mostRequestedMedicines: string[];
  outOfStockFrequency: { medicine: string; frequency: number }[];
  dailyUpdatesTrend: { date: string; count: number }[];
  detailedData: {
    pharmacyName: string;
    date: string;
    outOfStockCount: number;
    lastUpdateTime: string;
  }[];
}

export function ReportsAnalytics({ onBack, onHomeClick, onReportsClick }: ReportsAnalyticsProps) {
  const { language } = useLanguage();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data for demonstration
  const mockReportData: ReportData = {
    totalPharmaciesUpdated: 12,
    totalOutOfStockMedicines: 7,
    mostRequestedMedicines: ['Paracetamol', 'Amoxicillin', 'Metformin'],
    outOfStockFrequency: [
      { medicine: 'Paracetamol 500mg', frequency: 23 },
      { medicine: 'Amoxicillin 250mg', frequency: 18 },
      { medicine: 'Metformin 500mg', frequency: 15 },
      { medicine: 'Aspirin 75mg', frequency: 12 },
      { medicine: 'Lisinopril 5mg', frequency: 10 }
    ],
    dailyUpdatesTrend: [
      { date: '2024-01-01', count: 42 },
      { date: '2024-01-02', count: 38 },
      { date: '2024-01-03', count: 45 },
      { date: '2024-01-04', count: 41 },
      { date: '2024-01-05', count: 47 },
      { date: '2024-01-06', count: 43 },
      { date: '2024-01-07', count: 39 }
    ],
    detailedData: [
      { pharmacyName: 'City Medical Store', date: '2024-01-07', outOfStockCount: 5, lastUpdateTime: '14:30' },
      { pharmacyName: 'Health Plus Pharmacy', date: '2024-01-07', outOfStockCount: 3, lastUpdateTime: '13:45' },
      { pharmacyName: 'MediCare Center', date: '2024-01-07', outOfStockCount: 7, lastUpdateTime: '15:20' },
      { pharmacyName: 'Wellness Pharmacy', date: '2024-01-07', outOfStockCount: 2, lastUpdateTime: '12:15' },
      { pharmacyName: 'Family Health Store', date: '2024-01-07', outOfStockCount: 4, lastUpdateTime: '16:00' },
      { pharmacyName: 'Quick Med Pharmacy', date: '2024-01-06', outOfStockCount: 6, lastUpdateTime: '11:30' },
      { pharmacyName: 'Life Care Store', date: '2024-01-06', outOfStockCount: 3, lastUpdateTime: '14:45' },
      { pharmacyName: 'Health First', date: '2024-01-06', outOfStockCount: 5, lastUpdateTime: '10:20' },
      { pharmacyName: 'Medi Solutions', date: '2024-01-05', outOfStockCount: 4, lastUpdateTime: '13:15' },
      { pharmacyName: 'Care Plus Pharmacy', date: '2024-01-05', outOfStockCount: 2, lastUpdateTime: '13:15' },
      { pharmacyName: 'Wellness Center', date: '2024-01-05', outOfStockCount: 6, lastUpdateTime: '16:45' },
      { pharmacyName: 'Health Hub', date: '2024-01-04', outOfStockCount: 3, lastUpdateTime: '12:30' }
    ]
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReportData(mockReportData);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    
    // Create a simple HTML content for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Pharmacy Reports - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .card { border: 1px solid #ddd; padding: 15px; text-align: center; }
            .chart-section { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Reports & Analytics</h1>
            <p>Track medicine availability and pharmacy performance</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <div class="card">
              <h2>${reportData.totalPharmaciesUpdated}</h2>
              <p>Total Pharmacies Updated</p>
            </div>
            <div class="card">
              <h2>${reportData.totalOutOfStockMedicines}</h2>
              <p>Total Out-of-Stock Medicines</p>
            </div>
            <div class="card">
              <h2>Top 3</h2>
              <p>Most Requested Medicines</p>
              <ul style="text-align: left;">
                ${reportData.mostRequestedMedicines.map((medicine, index) => 
                  `<li>${index + 1}. ${medicine}</li>`
                ).join('')}
              </ul>
            </div>
          </div>
          
          <div class="chart-section">
            <h3>Most Common Out-of-Stock Medicines</h3>
            <table>
              <tr><th>Medicine</th><th>Frequency</th></tr>
              ${reportData.outOfStockFrequency.map(item => 
                `<tr><td>${item.medicine}</td><td>${item.frequency}</td></tr>`
              ).join('')}
            </table>
          </div>
          
          <div class="chart-section">
            <h3>Detailed Pharmacy Updates</h3>
            <table>
              <tr><th>Pharmacy Name</th><th>Date</th><th>Out-of-Stock Count</th><th>Last Update Time</th></tr>
              ${reportData.detailedData.map(row => 
                `<tr><td>${row.pharmacyName}</td><td>${row.date}</td><td>${row.outOfStockCount}</td><td>${row.lastUpdateTime}</td></tr>`
              ).join('')}
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666;">
            <p>Powered by Punjab Health Department – v1.0.0</p>
          </div>
        </body>
      </html>
    `;
    
    // Create and download PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmacy-reports-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    
    // Create CSV content
    const csvContent = [
      // Summary data
      ['Report Type', 'Value'],
      ['Total Pharmacies Updated', reportData.totalPharmaciesUpdated],
      ['Total Out-of-Stock Medicines', reportData.totalOutOfStockMedicines],
      ['Most Requested Medicines', reportData.mostRequestedMedicines.join(', ')],
      ['', ''], // Empty row
      
      // Out-of-stock frequency
      ['Medicine', 'Frequency'],
      ...reportData.outOfStockFrequency.map(item => [item.medicine, item.frequency]),
      ['', ''], // Empty row
      
      // Daily updates trend
      ['Date', 'Update Count'],
      ...reportData.dailyUpdatesTrend.map(item => [item.date, item.count]),
      ['', ''], // Empty row
      
      // Detailed data
      ['Pharmacy Name', 'Date', 'Out-of-Stock Count', 'Last Update Time'],
      ...reportData.detailedData.map(row => [row.pharmacyName, row.date, row.outOfStockCount, row.lastUpdateTime])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmacy-reports-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const paginatedData = reportData?.detailedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const totalPages = Math.ceil((reportData?.detailedData.length || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        title={`${t('reports_analytics', language)}`} 
        showBack 
        onBack={onBack}
        onHomeClick={onHomeClick}
        onReportsClick={onReportsClick}
      />
      
      <main className="w-full flex justify-center px-4 py-6 lg:py-12">
        <div className="w-full max-w-7xl">
          <div className="space-y-8 lg:space-y-12 flex flex-col items-center">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                📊 {t('reports_analytics', language)}
              </h1>
              <p className="text-lg text-gray-600">
                {t('track_medicine_availability', language)}
              </p>
            </div>

            {/* Filters Section */}
            <div className="w-full">
              <Card className="p-6 lg:p-8 bg-white shadow-lg border-0 w-full max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Report Filters</h3>
                <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('select_report_type', language)}
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                    >
                      <option value="daily">{t('daily', language)}</option>
                      <option value="weekly">{t('weekly', language)}</option>
                      <option value="monthly">{t('monthly', language)}</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('date_range', language)}
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                        placeholder="Start Date"
                        className="p-3 text-lg rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                      <Input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                        placeholder="End Date"
                        className="p-3 text-lg rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      onClick={generateReport}
                      variant="primary"
                      className="w-full lg:w-auto py-3 px-8 text-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : t('generate_report', language)}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {loading ? (
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl mx-auto">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-8 bg-white shadow-lg border-0">
                      <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : reportData ? (
              <>
                {/* Report Summary Cards */}
                <div className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl mx-auto">
                    <Card className="p-8 text-center bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-4">
                        {reportData.totalPharmaciesUpdated}
                      </div>
                      <div className="text-lg text-gray-600 font-semibold">
                        {t('total_pharmacies_updated', language)}
                      </div>
                    </Card>
                    
                    <Card className="p-8 text-center bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-4xl lg:text-5xl font-bold text-red-600 mb-4">
                        {reportData.totalOutOfStockMedicines}
                      </div>
                      <div className="text-lg text-gray-600 font-semibold">
                        {t('total_out_of_stock', language)}
                      </div>
                    </Card>
                    
                    <Card className="p-8 bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-center mb-6">
                        <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-3">
                          Top 3
                        </div>
                        <div className="text-lg text-gray-600 font-semibold">
                          {t('most_requested_medicines', language)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {reportData.mostRequestedMedicines.map((medicine, index) => (
                          <div key={index} className="text-sm lg:text-base text-gray-700 font-medium text-center">
                            {index + 1}. {medicine}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
                    {/* Bar Chart */}
                    <Card className="p-6 lg:p-8 bg-white shadow-lg border-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                        Most Common Out-of-Stock Medicines
                      </h3>
                      <div className="space-y-4">
                        {reportData.outOfStockFrequency.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-32 text-sm text-gray-600 truncate font-medium">
                              {item.medicine}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-5">
                              <div 
                                className="bg-blue-600 h-5 rounded-full transition-all duration-500"
                                style={{ width: `${(item.frequency / 25) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-12 text-sm text-gray-600 text-right font-bold">
                              {item.frequency}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Line Chart */}
                    <Card className="p-6 lg:p-8 bg-white shadow-lg border-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
                        <LineChart className="w-6 h-6 mr-3 text-green-600" />
                        Daily Updates Trend
                      </h3>
                      <div className="space-y-3">
                        {reportData.dailyUpdatesTrend.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-20 text-sm text-gray-600 font-medium">
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-green-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${(item.count / 50) * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-12 text-sm text-gray-600 text-right font-bold">
                              {item.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="w-full">
                  <Card className="p-6 lg:p-8 bg-white shadow-lg border-0 w-full max-w-6xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                      Detailed Pharmacy Updates
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-4 px-4 font-bold text-gray-700 text-base">Pharmacy Name</th>
                            <th className="text-left py-4 px-4 font-bold text-gray-700 text-base">Date</th>
                            <th className="text-left py-4 px-4 font-bold text-gray-700 text-base">Medicines Out-of-Stock</th>
                            <th className="text-left py-4 px-4 font-bold text-gray-700 text-base">Last Update Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((row, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                              <td className="py-4 px-4 text-gray-900 font-medium">{row.pharmacyName}</td>
                              <td className="py-4 px-4 text-gray-600">{row.date}</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800">
                                  {row.outOfStockCount}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-gray-600">{row.lastUpdateTime}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600 font-medium">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, reportData.detailedData.length)} of {reportData.detailedData.length} results
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            variant="ghost"
                            size="sm"
                            disabled={currentPage === 1}
                            className="px-4 py-2"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          <span className="px-4 py-2 text-sm text-gray-600 font-medium">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            variant="ghost"
                            size="sm"
                            disabled={currentPage === totalPages}
                            className="px-4 py-2"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Export Section */}
                <div className="w-full">
                  <Card className="p-6 lg:p-8 bg-white shadow-lg border-0 w-full max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('export_reports', language)}</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleExportPDF}
                        variant="primary"
                        className="flex items-center justify-center py-4 text-lg font-semibold"
                      >
                        <Download className="w-5 h-5 mr-3" />
                        {t('export_pdf', language)}
                      </Button>
                      <Button
                        onClick={handleExportCSV}
                        variant="secondary"
                        className="flex items-center justify-center py-4 text-lg font-semibold"
                      >
                        <FileText className="w-5 h-5 mr-3" />
                        {t('export_csv', language)}
                      </Button>
                    </div>
                  </Card>
                </div>
              </>
            ) : null}

            {/* Footer */}
            <div className="text-center py-8">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                <p className="text-gray-600 font-medium">
                  Powered by Punjab Health Department – v1.0.0
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Advanced Analytics & Reporting System
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
