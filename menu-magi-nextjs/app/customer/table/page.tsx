'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function TableSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableFromQR = searchParams.get('table');
  const restaurantId = searchParams.get('restaurant'); // Get restaurant ID from QR code
  
  const [selectedTable, setSelectedTable] = useState<number | null>(
    tableFromQR ? parseInt(tableFromQR) : null
  );

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };

  const handleContinue = () => {
    if (selectedTable) {
      // Store table number and restaurant ID in sessionStorage
      sessionStorage.setItem('tableNumber', selectedTable.toString());
      
      // Store restaurant ID if available (from QR code)
      if (restaurantId) {
        sessionStorage.setItem('restaurantId', restaurantId);
      }
      
      // Navigate to menu
      router.push('/customer/menu');
    }
  };

  // Generate table numbers (1-20)
  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Select Your Table
            </h1>
            <p className="text-lg text-gray-600">
              {restaurantId 
                ? 'Welcome! Please select your table number to view the menu' 
                : tableFromQR 
                  ? `Scanned from QR code: Table ${tableFromQR}` 
                  : 'Please select your table number to continue'}
            </p>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 mb-8">
            {tables.map((tableNumber) => (
              <button
                key={tableNumber}
                onClick={() => handleTableSelect(tableNumber)}
                className={`
                  aspect-square rounded-2xl border-2 font-bold text-xl
                  transition-all duration-200 hover:scale-105
                  ${
                    selectedTable === tableNumber
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }
                `}
              >
                {tableNumber}
              </button>
            ))}
          </div>

          {/* Continue Button */}
          {selectedTable && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Continue to Menu (Table {selectedTable})
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TableSelectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TableSelectContent />
    </Suspense>
  );
}
