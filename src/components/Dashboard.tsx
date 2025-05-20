import React, { useEffect, useState } from 'react';
import { UserCircle, Search, Settings, LogOut, ChevronLeft, ChevronRight, Calendar, Phone, Mail } from 'lucide-react';
import { Assistant, UserSession, Report } from '../types';
import AlertMessage from './AlertMessage';

interface DashboardProps {
  user: UserSession;
  onLogout: () => void;
  onEditAssistant: (id: string) => void;
  apiToken: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onEditAssistant,
  apiToken 
}) => {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  const ASSISTANTS_API_URL = 'https://webhook.alphasales.com.br/webhook/f83a9059-f33e-48ef-90bf-85af70ea1290';
  const REPORTS_API_URL = 'https://webhook.alphasales.com.br/webhook/1c2cbee1-246d-4eff-88a8-11d58f03c524';

  useEffect(() => {
    loadAssistantAndReports();
  }, [user.id]);

  useEffect(() => {
    const filtered = reports.filter(report => 
      Object.values(report).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [searchTerm, reports]);

  const loadAssistantAndReports = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Load assistant
      const assistantRes = await fetch(`${ASSISTANTS_API_URL}?user_id=${user.id}`, { 
        headers: { 'api_token': apiToken }
      });
      
      if (!assistantRes.ok) throw new Error('Falha ao buscar assistente');
      
      const assistantData = await assistantRes.json();
      const assistantItem = Array.isArray(assistantData) ? 
        (assistantData[0]?.data?.[0] || null) : 
        (assistantData.data?.[0] || null);

      if (!assistantItem) {
        throw new Error('Nenhum assistente encontrado');
      }

      setAssistant(assistantItem);

      // Load reports
      const reportsRes = await fetch(`${REPORTS_API_URL}?assistant_id=${assistantItem.id}`, { 
        headers: { 'api_token': apiToken }
      });
      
      if (!reportsRes.ok) throw new Error('Falha ao carregar relatórios');
      
      const reportsData = await reportsRes.json();
      const reportItems = Array.isArray(reportsData) ? 
        (reportsData[0]?.relatorios || []) : 
        (reportsData.relatorios || []);

      setReports(reportItems);
      setFilteredReports(reportItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-800">CRM Dashboard</h1>
              {assistant && (
                <button 
                  onClick={() => onEditAssistant(assistant.id)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Settings size={20} />
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-gray-700">
                <UserCircle size={20} />
                <span>{user.nome}</span>
              </div>
              
              <button 
                onClick={onLogout}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} className="mr-1" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        {error && <AlertMessage type="danger" message={error} />}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : currentReports.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Nenhum lead encontrado.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentReports.map((report, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.nome || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {report.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail size={14} className="mr-1" />
                                {report.email}
                              </div>
                            )}
                            {report.telefone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone size={14} className="mr-1" />
                                {report.telefone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {report.status || 'Novo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={14} className="mr-1" />
                            {new Date(report.data || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{indexOfFirstReport + 1}</span> até{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastReport, filteredReports.length)}
                      </span>{' '}
                      de <span className="font-medium">{filteredReports.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeft size={16} />
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Próximo</span>
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;