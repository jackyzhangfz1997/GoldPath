import React from 'react';
import { Button, Upload, App } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  onDataLoaded: (data: any[]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onDataLoaded }) => {
  const { message } = App.useApp();

  const handleExcelUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        onDataLoaded(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      message.error('Excel 文件解析失败');
    }
    return false;
  };

  return (
    <Upload
      beforeUpload={handleExcelUpload}
      showUploadList={false}
      accept=".xlsx,.xls"
    >
      <Button
        type="text"
        icon={<FileExcelOutlined className="text-green-500" />}
      />
    </Upload>
  );
};

export default ExcelUpload;