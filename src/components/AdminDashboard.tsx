import React, { useEffect, useState } from 'react';
import { UserCircle, Plus, ChevronDown, LogOut, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { Assistant, UserSession } from '../types';
import AlertMessage from './AlertMessage';

interface AdminDashboardProps {
  user: UserSession;
  onLogout: () => void;
  onEdit: (id: string) => void;
  onViewReport: (id: string) => void;
  apiToken: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  onLogout, 
  onEdit, 
  onViewReport,
  apiToken 
}) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const ASSISTANTS_API_URL = 'https://webhook.alphasales.com.br/webhook/f83a9059-f33e-48ef-90bf-85af70ea1290';

  useEffect(() => {
    loadAssistants();
  }, [user.id]);

  const loadAssistants = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${ASSISTANTS_API_URL}?user_id=${user.id}`, { 
        headers: { 'api_token': apiToken }
      });
      
      if (!res.ok) {
        throw new Error('Falha ao buscar assistentes');
      }
      
      const resp = await res.json();
      const items = Array.isArray(resp) ? (resp[0]?.data || []) : (resp.data || []);
      setAssistants(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar assistentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssistant = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este assistente?')) {
      console.log('Excluindo assistente', id);
      // Actual delete logic would go here
    }
    setOpenDropdown(null);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Close dropdown when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-2">
              <UserCircle size={20} />
              <span>{user.nome}</span>
            </div>
            
            <button 
              onClick={onLogout}
              className="inline-flex items-center px-3 py-1.5 border border-white/30 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              <LogOut size={16} className="mr-1" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Bem-vindo, <span className="text-blue-600">{user.nome}</span>
              </h2>
              <p className="text-gray-600">Gerencie seus assistentes virtuais</p>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={18} className="mr-1" />
              <span>Novo Assistente</span>
            </button>
          </div>

          {error && <AlertMessage type="danger" message={error} />}

          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2 text-blue-600" />
            Assistentes
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : assistants.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Nenhum assistente encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assistants.map((assistant) => (
                <div 
                  key={assistant.id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div 
                    className="p-5 cursor-pointer relative"
                    onClick={() => onViewReport(assistant.id)}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2 pr-8">
                      {assistant.nome}
                    </h4>
                    
                    {/* Action dropdown */}
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(assistant.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronDown size={18} />
                      </button>
                      
                      {openDropdown === assistant.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200 overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={() => {
                              onEdit(assistant.id);
                              setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Edit2 size={16} className="mr-2" />
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteAssistant(assistant.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-5 py-3 flex justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(assistant.id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;