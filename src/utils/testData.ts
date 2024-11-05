import { Transaction } from '../types';
import { addTransaction } from './db';
import dayjs from 'dayjs';

// 生成测试数据
export const testTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 1409738.66,
    date: '2024-11-01',
    category: '亚马逊销售款',
    description: '亚马逊销售款',
    userId: '1'
  },
  {
    id: '2',
    type: 'expense',
    amount: 1103706.80,
    date: '2024-06-02',
    category: '九家美国金品店',
    description: '亚马逊采购款',
    userId: '1'
  },
  {
    id: '3',
    type: 'income',
    amount: 986543.21,
    date: '2024-10-15',
    category: '亚马逊销售款',
    description: '10月份销售收入',
    userId: '1'
  },
  {
    id: '4',
    type: 'expense',
    amount: 876543.21,
    date: '2024-09-20',
    category: '九家美国金品店',
    description: '9月份采购支出',
    userId: '1'
  },
  {
    id: '5',
    type: 'income',
    amount: 765432.10,
    date: '2024-08-25',
    category: '亚马逊销售款',
    description: '8月份销售收入',
    userId: '1'
  },
  {
    id: '6',
    type: 'expense',
    amount: 654321.09,
    date: '2024-07-30',
    category: '九家美国金品店',
    description: '7月份采购支出',
    userId: '1'
  },
  {
    id: '7',
    type: 'income',
    amount: 543210.98,
    date: '2024-07-15',
    category: '亚马逊销售款',
    description: '7月份销售收入',
    userId: '1'
  },
  {
    id: '8',
    type: 'expense',
    amount: 432109.87,
    date: '2024-06-20',
    category: '九家美国金品店',
    description: '6月份采购支出',
    userId: '1'
  },
  {
    id: '9',
    type: 'income',
    amount: 321098.76,
    date: '2024-06-05',
    category: '亚马逊销售款',
    description: '6月份销售收入',
    userId: '1'
  },
  {
    id: '10',
    type: 'expense',
    amount: 210987.65,
    date: '2024-05-25',
    category: '九家美国金品店',
    description: '5月份采购支出',
    userId: '1'
  }
];

// 添加测试数据的函数
export const addTestData = async () => {
  try {
    console.log('Adding test data...');
    for (const transaction of testTransactions) {
      await addTransaction(transaction);
    }
    console.log('Test data added successfully');
  } catch (error) {
    console.error('Failed to add test data:', error);
    throw error;
  }
};