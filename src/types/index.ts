export interface UserSession {
  id: string;
  nome: string;
  email: string;
  [key: string]: any;
}

export interface Assistant {
  id: string;
  nome: string;
  prompt?: string;
  id_cliente: string;
  [key: string]: any;
}

export interface Report {
  nome?: string;
  email?: string;
  telefone?: string;
  status?: string;
  data?: string;
  [key: string]: any;
}

export interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}