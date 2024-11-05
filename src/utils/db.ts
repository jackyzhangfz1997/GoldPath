import { openDB } from 'idb';
import { Transaction } from '../types';
import { testTransactions } from './testData';

const DB_NAME = 'amazon-finance-db';
const DB_VERSION = 1;

export const initDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
      },
    });

    // 检查数据库是否为空，如果为空则添加测试数据
    const count = await db.count('transactions');
    if (count === 0) {
      console.log('Database is empty, adding test data...');
      for (const transaction of testTransactions) {
        await db.add('transactions', transaction);
      }
      console.log('Test data added successfully');
    }

    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const addTransaction = async (transaction: Transaction) => {
  const db = await initDB();
  return db.put('transactions', transaction);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const db = await initDB();
  return db.getAll('transactions');
};

export const updateTransaction = async (transaction: Transaction) => {
  return addTransaction(transaction);
};

export const deleteTransaction = async (id: string) => {
  const db = await initDB();
  return db.delete('transactions', id);
};