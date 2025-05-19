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
  [key: string]: any;
}

export interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}