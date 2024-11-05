import React, { useMemo, useState } from 'react';
import { Button, Space, App } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined,
  LinkOutlined,
  DisconnectOutlined,
  DownOutlined,
  RightOutlined,
  EyeOutlined,
  FileExcelOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { Transaction } from '../../types';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTransactionStore } from '../../stores/transactionStore';
import ExcelUpload from './ExcelUpload';
import ExcelPreviewModal from './ExcelPreviewModal';

interface TransactionListItemProps {
  record: Transaction;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  showActions?: boolean;
  onSelect?: (id: string) => void;
  selectable?: boolean;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  record,
  expanded,
  onToggleExpand,
  showActions = true,
  onSelect,
  selectable = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modal, message } = App.useApp();
  const { deleteTransaction, unlinkExpenseRecord, fetchTransactions, transactions, updateTransaction } = useTransactionStore();
  const [previewVisible, setPreviewVisible] = useState(false);

  const isExpenseManagementPage = location.pathname === '/expense';

  const linkedIncome = useMemo(() => {
    if (record.type === 'expense') {
      return transactions.find(t => t.linkedExpenseId === record.id);
    }
    return null;
  }, [record.id, transactions, record.type]);

  const linkedExpense = useMemo(() => {
    if (record.type === 'income') {
      return transactions.find(t => t.id === record.linkedExpenseId);
    }
    return null;
  }, [record.linkedExpenseId, transactions, record.type]);

  const hasLinkedRecord = record.type === 'income' ? !!linkedExpense : !!linkedIncome;

  const financialMetrics = useMemo(() => {
    if (record.type === 'expense' && linkedIncome) {
      const recoveredAmount = linkedIncome.amount;
      const unrecoveredAmount = Math.max(0, record.amount - recoveredAmount);
      const profitRate = ((recoveredAmount - record.amount) / record.amount * 100);
      const monthDiff = Math.max(1, dayjs(linkedIncome.date).diff(dayjs(record.date), 'month'));
      const monthlyRate = profitRate / monthDiff;

      return {
        recoveredAmount,
        unrecoveredAmount,
        profitRate,
        monthlyRate
      };
    }
    return null;
  }, [record, linkedIncome]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/add-transaction', { state: { transaction: record, type: record.type } });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    modal.confirm({
      title: '确认删除',
      content: `确定要删除这条${record.type === 'income' ? '收入' : '支出'}记录吗？${hasLinkedRecord ? '删除后将同时取消与关联记录的关联。' : ''}`,
      okText: '确定',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTransaction(record.id);
          message.success('删除成功');
          fetchTransactions();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleUnlink = async (e: React.MouseEvent, incomeId: string) => {
    e.stopPropagation();
    modal.confirm({
      title: '取消关联',
      content: '确定要取消与收入记录的关联吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await unlinkExpenseRecord(incomeId);
          message.success('取消关联成功');
          fetchTransactions();
        } catch (error) {
          message.error('取消关联失败');
        }
      }
    });
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (record.linkedExpenseId) {
      modal.confirm({
        title: '取消关联',
        content: '确定要取消与支出记录的关联吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          try {
            await unlinkExpenseRecord(record.id);
            message.success('取消关联成功');
            fetchTransactions();
          } catch (error) {
            message.error('取消关联失败');
          }
        }
      });
    } else {
      navigate('/expense', { state: { linkRecord: record } });
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(record.id);
    } else if (hasLinkedRecord) {
      onToggleExpand(record.id);
    }
  };

  const handleExcelUpload = async (data: any[]) => {
    try {
      await updateTransaction({
        ...record,
        excelData: data
      });
      message.success('Excel数据上传成功');
      fetchTransactions();
    } catch (error) {
      message.error('Excel数据上传失败');
    }
  };

  return (
    <div className={`bg-white rounded shadow-sm mb-1 ${selectable ? 'cursor-pointer hover:bg-blue-50' : ''}`}>
      <div 
        className="px-4 py-2"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 min-w-0">
            {hasLinkedRecord && !selectable && (
              <span className="text-gray-400 flex-shrink-0">
                {expanded ? <DownOutlined /> : <RightOutlined />}
              </span>
            )}
            <span className="text-gray-600 flex-shrink-0 w-28">{dayjs(record.date).format('YYYY-MM-DD')}</span>
            <span className="text-gray-300">|</span>
            <span className={`${record.type === 'income' ? 'text-red-500' : 'text-green-500'} flex-shrink-0 w-32`}>
              ¥{record.amount.toLocaleString('zh-CN')}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 flex-shrink-0 w-32">{record.category}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 flex-shrink-0 w-40 truncate">{record.description}</span>

            {record.type === 'expense' && financialMetrics && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-orange-500 flex-shrink-0 w-44">
                  已收回: ¥{financialMetrics.recoveredAmount.toLocaleString('zh-CN')}
                </span>
                {financialMetrics.unrecoveredAmount > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-red-500 flex-shrink-0 w-48">
                      剩余未收回: ¥{financialMetrics.unrecoveredAmount.toLocaleString('zh-CN')}
                    </span>
                  </>
                )}
                <span className="text-gray-300">|</span>
                <span className="text-blue-500 flex-shrink-0 w-32 flex items-center">
                  收益率: <RiseOutlined className="mx-1" />{financialMetrics.profitRate.toFixed(2)}%
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-purple-500 flex-shrink-0 w-32 flex items-center">
                  月化: <RiseOutlined className="mx-1" />{financialMetrics.monthlyRate.toFixed(2)}%
                </span>
              </>
            )}
          </div>

          {showActions && !selectable && (
            <Space size="small" className="flex-shrink-0 ml-2">
              {record.type === 'expense' && (
                <>
                  <ExcelUpload onDataLoaded={handleExcelUpload} />
                  {record.excelData && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined className="text-blue-500" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewVisible(true);
                      }}
                    />
                  )}
                </>
              )}
              <Button
                type="text"
                size="small"
                icon={<EditOutlined className="text-blue-500" />}
                onClick={handleEdit}
              />
              {record.type === 'income' && (
                <Button
                  type="text"
                  size="small"
                  icon={hasLinkedRecord ? 
                    <DisconnectOutlined className="text-orange-500" /> : 
                    <LinkOutlined className="text-blue-500" />
                  }
                  onClick={handleLinkClick}
                />
              )}
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined className="text-red-500" />}
                onClick={handleDelete}
              />
            </Space>
          )}
        </div>
      </div>

      {expanded && hasLinkedRecord && !selectable && record.type === 'income' && linkedExpense && (
        <div className="px-6 py-1 bg-gray-50 border-t">
          <div className="text-xs text-gray-500 mb-1">关联的支出记录:</div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-600 w-28">
              {dayjs(linkedExpense.date).format('YYYY-MM-DD')}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-green-500 w-32">
              ¥{linkedExpense.amount.toLocaleString('zh-CN')}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 w-32">{linkedExpense.category}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 w-40 truncate">{linkedExpense.description}</span>
          </div>
        </div>
      )}

      {expanded && hasLinkedRecord && !selectable && record.type === 'expense' && linkedIncome && (
        <div className="px-6 py-1 bg-gray-50 border-t">
          <div className="text-xs text-gray-500 mb-1">关联的收入记录:</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-gray-600 w-28">
                {dayjs(linkedIncome.date).format('YYYY-MM-DD')}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-red-500 w-32">
                ¥{linkedIncome.amount.toLocaleString('zh-CN')}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 w-32">{linkedIncome.category}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 w-40 truncate">{linkedIncome.description}</span>
            </div>
            {isExpenseManagementPage && (
              <Button
                type="text"
                size="small"
                icon={<DisconnectOutlined className="text-orange-500" />}
                onClick={(e) => handleUnlink(e, linkedIncome.id)}
                className="ml-2"
              />
            )}
          </div>
        </div>
      )}

      {record.type === 'expense' && record.excelData && (
        <ExcelPreviewModal
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          data={record.excelData}
        />
      )}
    </div>
  );
};

export default TransactionListItem;