import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Plus, Trash2 } from 'lucide-react';
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
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const ASSISTANT_DETAIL_URL = 'https://webhook.alphasales.com.br/webhook/05e0054b-3ea1-4813-a045-dda2ee0511c7';
  const ASSISTANT_UPDATE_URL = 'https://webhook.alphasales.com.br/webhook/cb1af28b-370b-46db-93b6-7f0eccff353f';
  const COLUMNS_API_URL = 'https://webhook.alphasales.com.br/webhook/a795088a-975d-4d7a-8618-335303c3899c';

  useEffect(() => {
    loadAssistantData();
  }, [assistantId]);

  const loadAssistantData = async () => {
    setIsLoading(true);
    setAlert(null);
    try {
      // Fetch assistant details
      const res = await fetch(`${ASSISTANT_DETAIL_URL}?id=${assistantId}`, {
        headers: { api_token: apiToken }
      });
      if (!res.ok) throw new Error('Falha ao carregar dados do assistente');
      const data = await res.json();
      const assistantData = Array.isArray(data) ? data[0] : data;
      if (!assistantData) throw new Error('Assistente não encontrado');
      setAssistant(assistantData);
      setName(assistantData.nome || '');
      setPrompt(assistantData.prompt || '');

      // Fetch columns
      const colRes = await fetch(`${COLUMNS_API_URL}?assistant_id=${assistantId}`, {
        headers: { api_token: apiToken }
      });
      if (!colRes.ok) throw new Error('Falha ao carregar colunas');
      const colData = await colRes.json();
      const fetched = Array.isArray(colData) ? colData[0]?.colunas ?? [] : colData.colunas ?? [];
      setColumns(fetched);
    } catch (err) {
      setAlert({ type: 'danger', message: err instanceof Error ? err.message : 'Erro no carregamento' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleColumnChange = (index: number, value: string) => {
    setColumns(cols => cols.map((col, i) => (i === index ? value : col)));
  };

  const handleAddColumn = () => {
    setColumns(cols => [...cols, '']);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(cols => cols.filter((_, i) => i !== index));
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
    if (columns.some(col => !col.trim())) {
      setAlert({ type: 'danger', message: 'Todas as colunas devem ter nome' });
      return;
    }
    setIsSaving(true);
    setAlert(null);
    try {
      const res = await fetch(ASSISTANT_UPDATE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', api_token: apiToken },
        body: JSON.stringify({
          id: assistantId,
          nome: name,
          prompt: prompt,
          id_cliente: assistant.id_cliente,
          colunas: columns
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Falha ao atualizar: ${errText}`);
      }
      setAlert({ type: 'success', message: 'Assistente e colunas atualizados com sucesso!' });
      setTimeout(() => onBack(), 2000);
    } catch (err) {
      setAlert({ type: 'danger', message: err instanceof Error ? err.message : 'Erro ao salvar alterações' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <button onClick={onBack} className="mr-4 p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Editar Assistente</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-600">Carregando dados do assistente...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {alert && <AlertMessage type={alert.type} message={alert.message} />}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Assistente</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do assistente"
                />
              </div>

              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Insira o prompt aqui"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colunas</label>
                <div className="space-y-2">
                  {columns.map((col, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={col}
                        onChange={e => handleColumnChange(idx, e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Coluna ${idx + 1}`}
                      />
                      <button type="button" onClick={() => handleRemoveColumn(idx)} className="p-1 rounded-lg hover:bg-gray-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddColumn} className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Plus size={16} className="mr-1" /> Adicionar Coluna
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >Cancelar</button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Save size={18} className="mr-2" />
                  )}
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditAssistant;