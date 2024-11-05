import React, { useMemo } from 'react';
import { Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ExcelPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  data: any[];
}

const ExcelPreviewModal: React.FC<ExcelPreviewModalProps> = ({
  visible,
  onClose,
  data
}) => {
  const columns: ColumnsType<any> = useMemo(() => {
    if (data.length === 0) return [];
    
    return Object.keys(data[0]).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      align: 'center',
      ellipsis: true,
      width: typeof data[0][key] === 'number' ? 100 : 150,
      render: (value) => {
        if (typeof value === 'number') {
          return value.toLocaleString('zh-CN', {
            minimumFractionDigits: typeof value === 'number' && !Number.isInteger(value) ? 2 : 0
          });
        }
        return <div className="text-center whitespace-nowrap overflow-hidden text-ellipsis">{value}</div>;
      }
    }));
  }, [data]);

  const dataWithKeys = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      key: `excel-row-${index}`
    }));
  }, [data]);

  const summary = useMemo(() => {
    if (data.length === 0) return null;

    const totals = Object.keys(data[0]).reduce((acc, key) => {
      if (typeof data[0][key] === 'number') {
        acc[key] = data.reduce((sum, row) => sum + (row[key] || 0), 0);
      }
      return acc;
    }, {} as Record<string, number>);

    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row>
          {columns.map((col, index) => {
            const value = totals[col.dataIndex as string];
            return (
              <Table.Summary.Cell key={index} index={index} align="center">
                {typeof value === 'number' ? (
                  <span className="font-bold text-blue-600">
                    {value.toLocaleString('zh-CN', {
                      minimumFractionDigits: !Number.isInteger(value) ? 2 : 0
                    })}
                  </span>
                ) : index === 0 ? (
                  <span className="font-bold">合计</span>
                ) : null}
              </Table.Summary.Cell>
            );
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [data, columns]);

  return (
    <Modal
      title="Excel 数据预览"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      styles={{
        body: {
          padding: '12px'
        }
      }}
    >
      <Table
        dataSource={dataWithKeys}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content', y: 400 }}
        summary={summary}
        bordered
        size="small"
        className="excel-preview-table"
      />
      <style>
        {`
          .excel-preview-table .ant-table-cell {
            padding: 8px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
            text-align: center !important;
          }
          .excel-preview-table .ant-table-thead > tr > th {
            white-space: nowrap;
            background-color: #f5f5f5;
            text-align: center !important;
          }
          .excel-preview-table .ant-table-summary > tr > td {
            padding: 8px !important;
            background-color: #fafafa;
            text-align: center !important;
          }
          .excel-preview-table .ant-table-thead > tr > th,
          .excel-preview-table .ant-table-tbody > tr > td {
            vertical-align: middle;
          }
        `}
      </style>
    </Modal>
  );
};

export default ExcelPreviewModal;