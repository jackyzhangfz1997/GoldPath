import React, { useState } from 'react';
import { Empty } from 'antd';
import { Transaction } from '../../types';
import TransactionListItem from './TransactionListItem';

interface TransactionListProps {
  transactions: Transaction[];
  type?: 'income' | 'expense';
  showActions?: boolean;
  onExpenseSelect?: (expenseId: string) => void;
  selectable?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  type,
  showActions = true,
  onExpenseSelect,
  selectable = false
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredTransactions = type ? 
    transactions.filter(t => t.type === type) : 
    transactions;

  if (filteredTransactions.length === 0) {
    return <Empty description={`暂无${type === 'income' ? '收入' : '支出'}记录`} />;
  }

  return (
    <div className={`space-y-4 ${selectable ? 'cursor-pointer' : ''}`}>
      {filteredTransactions.map(record => (
        <TransactionListItem
          key={record.id}
          record={record}
          expanded={expandedIds.includes(record.id)}
          onToggleExpand={toggleExpand}
          showActions={showActions}
          onSelect={selectable ? onExpenseSelect : undefined}
          selectable={selectable}
        />
      ))}
    </div>
  );
};

export default TransactionList;