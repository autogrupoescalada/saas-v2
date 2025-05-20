import React, { useEffect, useState } from 'react';
import { UserCircle, Search, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [columns, setColumns] = useState<string[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  const ASSISTANTS_API_URL = 'https://webhook.alphasales.com.br/webhook/f83a9059-f33e-48ef-90bf-85af70ea1290';
  const REPORTS_API_URL = 'https://webhook.alphasales.com.br/webhook/1c2cbee1-246d-4eff-88a8-11d58f03c524';
  const COLUMNS_API_URL = 'https://webhook.alphasales.com.br/webhook/a795088a-975d-4d7a-8618-335303c3899c';

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch assistant
      const assistantRes = await fetch(`${ASSISTANTS_API_URL}?user_id=${user.id}`, {
        headers: { 'api_token': apiToken }
      });
      if (!assistantRes.ok) throw new Error('Falha ao buscar assistente');

      const assistantData = await assistantRes.json();
      const assistantItem = Array.isArray(assistantData)
        ? assistantData[0]?.data?.[0] ?? null
        : assistantData.data?.[0] ?? null;
      if (!assistantItem) throw new Error('Nenhum assistente encontrado');
      setAssistant(assistantItem);

      // Fetch columns
      const colsRes = await fetch(`${COLUMNS_API_URL}?assistant_id=${assistantItem.id}`, {
        headers: { 'api_token': apiToken }
      });
      if (!colsRes.ok) throw new Error('Falha ao carregar colunas');
      const colsData = await colsRes.json();
      const fetchedCols = Array.isArray(colsData)
        ? colsData[0]?.colunas ?? []
        : colsData.colunas ?? [];
      setColumns(fetchedCols);

      // Fetch reports
      const reportsRes = await fetch(`${REPORTS_API_URL}?assistant_id=${assistantItem.id}`, {
        headers: { 'api_token': apiToken }
      });
      if (!reportsRes.ok) throw new Error('Falha ao carregar relatórios');
      const reportsData = await reportsRes.json();
      const reportItems = Array.isArray(reportsData)
        ? reportsData[0]?.relatorios ?? []
        : reportsData.relatorios ?? [];
      setReports(reportItems);
      setFilteredReports(reportItems);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">CRM AlphaSales</h1>
            {assistant && (
              <button onClick={() => onEditAssistant(assistant.id)} className="text-gray-600 hover:text-gray-800">
                <Settings size={20} />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-gray-700">
              <UserCircle size={20} />
              <span>{user.nome}</span>
            </div>
            <button onClick={onLogout} className="inline-flex items-center px-3 py-1.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-100">
              <LogOut size={16} className="mr-1" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        {error && <AlertMessage type="danger" message={error} />}

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : currentReports.length === 0 ? (
            <div className="text-center py-10 text-gray-600">Nenhum lead encontrado.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentReports.map((report, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {columns.map((col) => (
                          <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report[col] ?? 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 flex items-center justify-between border-t sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstReport + 1}</span> até <span className="font-medium">{Math.min(indexOfLastReport, filteredReports.length)}</span> de <span className="font-medium">{filteredReports.length}</span> resultados
                  </p>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border bg-white text-sm">
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => paginate(i + 1)} className={`${currentPage === i+1 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500'} relative inline-flex items-center px-4 py-2 border text-sm`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border bg-white text-sm">
                      <ChevronRight size={16} />
                    </button>
                  </nav>
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
