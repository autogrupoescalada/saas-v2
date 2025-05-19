import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { Assistant } from '../types';
import AlertMessage from './AlertMessage';

interface EditAssistantProps {
  assistantId: string;
  onBack: () => void;
  apiToken: string;
}

const EditAssistant: React.FC<EditAssistantProps> = ({ 
  assistantId, 
  onBack,
  apiToken 
}) => {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);

  const ASSISTANT_DETAIL_URL = 'https://webhook.alphasales.com.br/webhook/05e0054b-3ea1-4813-a045-dda2ee0511c7';
  const ASSISTANT_UPDATE_URL = 'https://webhook.alphasales.com.br/webhook/cb1af28b-370b-46db-93b6-7f0eccff353f';

  useEffect(() => {
    loadAssistantData();
  }, [assistantId]);

  const loadAssistantData = async () => {
    setIsLoading(true);
    
    try {
      const res = await fetch(`${ASSISTANT_DETAIL_URL}?id=${assistantId}`, {
        headers: { 'api_token': apiToken }
      });
      
      if (!res.ok) {
        throw new Error('Falha ao carregar dados do assistente');
      }
      
      const data = await res.json();
      const assistantData = Array.isArray(data) ? data[0] : data;
      
      if (!assistantData) {
        throw new Error('Assistente não encontrado');
      }
      
      setAssistant(assistantData);
      setName(assistantData.nome || '');
      setPrompt(assistantData.prompt || '');
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Erro ao carregar dados'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assistant) return;
    
    if (!name.trim()) {
      setAlert({ type: 'danger', message: 'Nome do assistente é obrigatório' });
      return;
    }
    
    if (!prompt.trim()) {
      setAlert({ type: 'danger', message: 'Prompt é obrigatório' });
      return;
    }
    
    setIsSaving(true);
    setAlert(null);
    
    try {
      const res = await fetch(ASSISTANT_UPDATE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api_token': apiToken
        },
        body: JSON.stringify({
          id: assistantId,
          nome: name,
          prompt: prompt,
          id_cliente: assistant.id_cliente
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Falha ao atualizar: ${errorText}`);
      }
      
      setAlert({ type: 'success', message: 'Assistente atualizado com sucesso!' });
      
      // Auto hide success message and redirect
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Erro ao atualizar assistente'
      });
    } finally {
      setIsSaving(false);
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
            <h1 className="text-xl font-semibold text-gray-800">Editar Assistente</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Carregando dados do assistente...</p>
              </div>
            ) : (
              <div className="p-6">
                {alert && (
                  <div className="mb-6">
                    <AlertMessage type={alert.type} message={alert.message} />
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Assistente
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nome do assistente"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                      Prompt
                    </label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Insira o prompt do assistente aqui..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={onBack}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          <span>Salvar Alterações</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditAssistant;