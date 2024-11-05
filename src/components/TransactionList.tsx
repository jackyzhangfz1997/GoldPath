import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Row, Col, Space, Modal, App } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Transaction } from '../types';
import dayjs from 'dayjs';
import { useTransactionStore } from '../stores/transactionStore';
import { useNavigate, useLocation } from 'react-router-dom';
import SharedTransactionList from './shared/TransactionList';

interface TransactionListProps {
  type?: 'income' | 'expense';
}

const TransactionList: React.FC<TransactionListProps> = ({ type }) => {
  const { transactions, fetchTransactions, linkExpenseRecord } = useTransactionStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  
  const defaultStartDate = dayjs().subtract(6, 'month').startOf('day');
  const defaultEndDate = dayjs().endOf('day');

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  const linkRecord = location.state?.linkRecord as Transaction;

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter(transaction => {
        const transactionDate = dayjs(transaction.date);
        const matchesType = type ? transaction.type === type : true;
        const matchesDateRange = (transactionDate.isAfter(startDate, 'day') || transactionDate.isSame(startDate, 'day')) &&
                               (transactionDate.isBefore(endDate, 'day') || transactionDate.isSame(endDate, 'day'));
        return matchesType && matchesDateRange;
      });
      setFilteredTransactions(filtered);
    }
  }, [transactions, startDate, endDate, type]);

  const handleAdd = () => {
    navigate('/add-transaction', { state: { type } });
  };

  const handleExpenseSelect = async (expenseId: string) => {
    if (!linkRecord) return;
    
    try {
      await linkExpenseRecord(linkRecord.id, expenseId);
      message.success('关联成功');
      navigate('/income', { replace: true });
      fetchTransactions();
    } catch (error) {
      message.error('关联失败');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="space-y-4">
          <Row gutter={16} className="items-center">
            <Col>
              <DatePicker
                value={startDate}
                onChange={(date) => setStartDate(date?.startOf('day') || defaultStartDate)}
                placeholder="开始日期"
                className="w-44"
              />
            </Col>
            <Col>
              <span className="text-gray-400">至</span>
            </Col>
            <Col>
              <DatePicker
                value={endDate}
                onChange={(date) => setEndDate(date?.endOf('day') || defaultEndDate)}
                placeholder="结束日期"
                className="w-44"
              />
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => fetchTransactions()}
                >
                  查询记录
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  新增{type === 'income' ? '收入' : '支出'}
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      <SharedTransactionList 
        transactions={filteredTransactions}
        type={type}
        onExpenseSelect={type === 'expense' && linkRecord ? handleExpenseSelect : undefined}
        selectable={type === 'expense' && !!linkRecord}
      />

      {linkRecord && type === 'expense' && (
        <Modal
          title="选择要关联的支出记录"
          open={true}
          onCancel={() => navigate('/income', { replace: true })}
          footer={null}
          width={1000}
          styles={{
            body: {
              padding: '12px',
              maxHeight: '600px',
              overflow: 'auto'
            }
          }}
        >
          <SharedTransactionList 
            transactions={filteredTransactions.filter(t => !t.linkedIncomeId)}
            type="expense"
            showActions={false}
            onExpenseSelect={handleExpenseSelect}
            selectable={true}
          />
        </Modal>
      )}
    </div>
  );
};

export default TransactionList;