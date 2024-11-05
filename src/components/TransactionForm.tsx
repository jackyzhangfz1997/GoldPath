import React from 'react';
import { Form, Input, DatePicker, Select, InputNumber, Button, App } from 'antd';
import { Transaction } from '../types';
import { useTransactionStore } from '../stores/transactionStore';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const TransactionForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const { addTransaction, updateTransaction } = useTransactionStore();

  const { type, transaction } = location.state || {};
  const isEditing = !!transaction;

  const initialValues = {
    type: type || 'expense',
    date: transaction?.date ? dayjs(transaction.date) : dayjs(),
    amount: transaction?.amount || undefined,
    category: transaction?.category || undefined,
    description: transaction?.description || undefined,
  };

  const onSubmit = async (values: any) => {
    try {
      const transactionData: Partial<Transaction> = {
        ...values,
        type: type || values.type,
        date: values.date.format('YYYY-MM-DD'),
        userId: '1',
      };

      if (isEditing) {
        await updateTransaction({ ...transactionData, id: transaction.id } as Transaction);
        message.success('记录更新成功');
      } else {
        await addTransaction(transactionData as Omit<Transaction, 'id'>);
        message.success('记录添加成功');
      }
      navigate(-1);
    } catch (error) {
      message.error(isEditing ? '更新失败' : '添加失败');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6">
        {isEditing ? '编辑' : '添加'}
        {type === 'income' ? '收入' : '支出'}记录
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={initialValues}
      >
        {!type && (
          <Form.Item
            name="type"
            label="交易类型"
            rules={[{ required: true, message: '请选择交易类型' }]}
          >
            <Select disabled={!!type}>
              <Select.Option value="expense">支出</Select.Option>
              <Select.Option value="income">收入</Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="amount"
          label="金额"
          rules={[{ required: true, message: '请输入金额' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/¥\s?|(,*)/g, '')}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="日期"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="category"
          label="交易类别"
          rules={[{ required: true, message: '请输入交易类别' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="mr-4">
            {isEditing ? '更新' : '提交'}
          </Button>
          <Button onClick={() => navigate(-1)}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TransactionForm;