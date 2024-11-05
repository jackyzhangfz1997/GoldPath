import { create } from 'zustand';
import { Transaction } from '../types';
import { addTransaction, getTransactions, updateTransaction, deleteTransaction } from '../utils/db';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  linkExpenseRecord: (incomeId: string, expenseId: string) => Promise<void>;
  unlinkExpenseRecord: (incomeId: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const transactions = await getTransactions();
      set({ transactions, loading: false });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      set({ error: '获取交易记录失败', loading: false });
    }
  },
  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        userId: '1',
      };
      await addTransaction(newTransaction as Transaction);
      const transactions = await getTransactions();
      set({ transactions, loading: false });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      set({ error: '添加交易记录失败', loading: false });
      throw error;
    }
  },
  updateTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      await updateTransaction(transaction);
      const transactions = await getTransactions();
      set({ transactions, loading: false });
    } catch (error) {
      console.error('Failed to update transaction:', error);
      set({ error: '更新交易记录失败', loading: false });
      throw error;
    }
  },
  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteTransaction(id);
      const transactions = await getTransactions();
      set({ transactions, loading: false });
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      set({ error: '删除交易记录失败', loading: false });
      throw error;
    }
  },
  linkExpenseRecord: async (incomeId: string, expenseId: string) => {
    set({ loading: true, error: null });
    try {
      const { transactions } = get();
      const incomeTransaction = transactions.find(t => t.id === incomeId);
      
      if (!incomeTransaction) {
        throw new Error('收入记录不存在');
      }

      const updatedTransaction = {
        ...incomeTransaction,
        linkedExpenseId: expenseId,
      };

      await updateTransaction(updatedTransaction);
      const updatedTransactions = await getTransactions();
      set({ transactions: updatedTransactions, loading: false });
    } catch (error) {
      console.error('Failed to link expense record:', error);
      set({ error: '关联支出记录失败', loading: false });
      throw error;
    }
  },
  unlinkExpenseRecord: async (incomeId: string) => {
    set({ loading: true, error: null });
    try {
      const { transactions } = get();
      const incomeTransaction = transactions.find(t => t.id === incomeId);
      
      if (!incomeTransaction) {
        throw new Error('收入记录不存在');
      }

      const updatedTransaction = {
        ...incomeTransaction,
        linkedExpenseId: undefined,
      };

      await updateTransaction(updatedTransaction);
      const updatedTransactions = await getTransactions();
      set({ transactions: updatedTransactions, loading: false });
    } catch (error) {
      console.error('Failed to unlink expense record:', error);
      set({ error: '取消关联支出记录失败', loading: false });
      throw error;
    }
  },
}));