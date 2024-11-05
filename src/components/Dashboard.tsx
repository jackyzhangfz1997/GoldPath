import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Button, Row, Col, Space } from 'antd';
import { 
  SearchOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  PercentageOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Transaction } from '../types';
import dayjs from 'dayjs';
import { useTransactionStore } from '../stores/transactionStore';
import TransactionList from './shared/TransactionList';

const Dashboard: React.FC = () => {
  const { transactions, fetchTransactions } = useTransactionStore();
  
  const defaultStartDate = dayjs().subtract(6, 'month').startOf('day');
  const defaultEndDate = dayjs().endOf('day');

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // 初始加载和定期刷新数据
  useEffect(() => {
    fetchTransactions();
    // 每30秒刷新一次数据
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  // 监听 transactions 变化，更新过滤后的数据
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter(transaction => {
        const transactionDate = dayjs(transaction.date);
        const matchesDateRange = (transactionDate.isAfter(startDate, 'day') || transactionDate.isSame(startDate, 'day')) &&
                               (transactionDate.isBefore(endDate, 'day') || transactionDate.isSame(endDate, 'day'));
        return matchesDateRange;
      });
      setFilteredTransactions(filtered);
    }
  }, [transactions, startDate, endDate]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalProfit = totalIncome - totalExpense;
  const profitRate = totalIncome ? (totalProfit / totalIncome * 100) : 0;
  const monthlyProfitRate = profitRate / 6;

  const stats = [
    {
      title: '总收入',
      value: totalIncome,
      prefix: '¥',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      icon: <RiseOutlined className="text-red-500" />
    },
    {
      title: '总支出',
      value: totalExpense,
      prefix: '¥',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      icon: <FallOutlined className="text-green-500" />
    },
    {
      title: '总利润',
      value: totalProfit,
      prefix: '¥',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      icon: <DollarOutlined className="text-blue-500" />
    },
    {
      title: '总利润率',
      value: profitRate,
      suffix: '%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      icon: <PercentageOutlined className="text-purple-500" />
    },
    {
      title: '月平均利润率',
      value: monthlyProfitRate,
      suffix: '%',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      icon: <ClockCircleOutlined className="text-yellow-500" />
    }
  ];

  return (
    <div className="space-y-6">
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
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                onClick={() => fetchTransactions()}
              >
                查询记录
              </Button>
            </Col>
          </Row>
        </div>
      </Card>

      <Row gutter={16}>
        {stats.map((stat, index) => (
          <Col span={4} key={index}>
            <Card className="shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                  <div className={`text-xl font-medium mt-2 ${stat.color}`}>
                    {stat.prefix}{typeof stat.value === 'number' ? 
                      stat.value.toLocaleString('zh-CN', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      }) : stat.value}{stat.suffix}
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium mb-4">支出记录</h2>
          <TransactionList 
            transactions={filteredTransactions} 
            type="expense"
            showActions={false}
          />
        </div>
        <div>
          <h2 className="text-lg font-medium mb-4">收入记录</h2>
          <TransactionList 
            transactions={filteredTransactions} 
            type="income"
            showActions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;