import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText } from 'lucide-react';
import { Report } from '../types';
import AlertMessage from './AlertMessage';

interface ReportViewProps {
  assistantId: string;
  onBack: () => void;
  apiToken: string;
}

const ReportView: React.FC<ReportViewProps> = ({ 
  assistantId,
  onBack,
  apiToken
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const REPORTS_API_URL = 'https://webhook.alphasales.com.br/webhook/1c2cbee1-246d-4eff-88a8-11d58f03c524';

  useEffect(() => {
    loadReports();
  }, [assistantId]);

  const loadReports = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${REPORTS_API_URL}?assistant_id=${assistantId}`, { 
        headers: { 'api_token': apiToken }
      });
      
      if (!res.ok) {
        throw new Error('Falha ao carregar relatórios');
      }
      
      const data = await res.json();
      const reportItems = Array.isArray(data) 
        ? (data[0]?.relatorios || []) 
        : (data.relatorios || []);
      
      setReports(reportItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="mr-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Relatórios do Assistente</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {error && <AlertMessage type="danger" message={error} />}

            <div className="mb-6 flex items-center">
              <FileText size={20} className="text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Detalhes dos Relatórios</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Nenhum relatório encontrado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-800">
                        Relatório {index + 1}
                      </h3>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(report).map(([key, value]) => (
                          <div key={key} className="mb-2">
                            <p className="text-sm font-medium text-gray-500">{key}</p>
                            <p className="text-gray-800 break-words">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportView;