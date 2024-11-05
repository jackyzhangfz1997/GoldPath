export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string;
  description: string;
  attachments?: string[];
  linkedExpenseId?: string;
  userId: string;
  excelData?: any[];
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}