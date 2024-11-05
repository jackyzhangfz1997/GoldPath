import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    role: 'admin',
  },
  {
    id: '2',
    username: 'guest',
    password: 'guest',
    role: 'user',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: defaultUsers,
      isAuthenticated: false,
      login: async (credentials) => {
        const { users } = get();
        const user = users.find(
          u => u.username === credentials.username && u.password === credentials.password
        );
        
        if (user) {
          set({ user, isAuthenticated: true });
        } else {
          throw new Error('Invalid credentials');
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateUser: async (updatedUser) => {
        const { users, user } = get();
        const newUsers = users.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        );
        set({ 
          users: newUsers,
          user: user?.id === updatedUser.id ? updatedUser : user
        });
      },
      addUser: async (newUser) => {
        const { users } = get();
        const id = (Math.max(...users.map(u => parseInt(u.id))) + 1).toString();
        const user = { ...newUser, id };
        set({ users: [...users, user] });
      },
      deleteUser: async (id) => {
        const { users, user } = get();
        if (id === '1' || id === '2') {
          throw new Error('Cannot delete default users');
        }
        if (id === user?.id) {
          throw new Error('Cannot delete current user');
        }
        set({ users: users.filter(u => u.id !== id) });
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => ({
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          data.state = {
            ...data.state,
            isAuthenticated: false,
            user: null
          };
          return data;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      }),
    }
  )
);