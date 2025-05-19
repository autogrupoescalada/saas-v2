import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { UserSession } from '../types';

interface LoginProps {
  onLogin: (user: UserSession) => void;
  apiToken: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, apiToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const LOGIN_API_URL = 'https://webhook.alphasales.com.br/webhook/f4894c1d-d870-4bb9-94a5-d00f9eda8bdc';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'api_token': apiToken 
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await res.json();
      const userData = Array.isArray(data) ? data[0] : data;
      onLogin(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao efetuar login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="bg-blue-600 p-6 flex justify-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 text-white">
              <UserCheck size={28} />
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Acesso Administrativo
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm animate-fadeIn" role="alert">
                <span className="font-medium">Erro:</span> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Autenticando...
                  </span>
                ) : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;