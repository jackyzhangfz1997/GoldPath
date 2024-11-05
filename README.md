# 亚马逊资金管理系统

一个用于管理亚马逊销售资金收支的 Web 应用程序。

## 功能特点

- 收入支出管理
  - 记录亚马逊销售收入
  - 记录采购支出
  - 支持收入与支出记录关联
  - 自动计算收益率和月化收益

- 数据分析
  - 总收入/支出统计
  - 利润率计算
  - 月平均利润率分析
  - 关联交易分析

- Excel 数据管理
  - 支持 Excel 文件上传
  - Excel 数据预览
  - 数据表格展示
  - 自动计算合计

- 其他功能
  - 按日期范围筛选记录
  - 支持编辑和删除记录
  - 响应式界面设计
  - 用户认证系统

## 技术栈

- 前端框架: React + TypeScript
- UI 组件库: Ant Design
- 状态管理: Zustand
- 样式: Tailwind CSS
- 构建工具: Vite
- 数据存储: IndexedDB (idb)
- Excel 处理: SheetJS

## 开发说明

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
src/
  ├── components/        # React 组件
  │   ├── shared/       # 共享组件
  │   │   ├── ExcelPreviewModal.tsx    # Excel 预览模态框
  │   │   ├── ExcelUpload.tsx          # Excel 上传组件
  │   │   ├── TransactionList.tsx      # 交易列表组件
  │   │   └── TransactionListItem.tsx  # 交易列表项组件
  │   ├── Dashboard.tsx       # 仪表盘组件
  │   ├── Login.tsx          # 登录组件
  │   ├── MainLayout.tsx     # 主布局组件
  │   └── TransactionForm.tsx # 交易表单组件
  ├── stores/           # Zustand 状态管理
  │   ├── authStore.ts        # 认证状态管理
  │   └── transactionStore.ts # 交易状态管理
  ├── types/            # TypeScript 类型定义
  │   └── index.ts      # 类型声明文件
  ├── utils/            # 工具函数
  │   ├── db.ts         # IndexedDB 数据库操作
  │   ├── excel.ts      # Excel 文件处理
  │   └── testData.ts   # 测试数据生成
  ├── App.tsx           # 应用程序入口组件
  └── main.tsx         # 应用程序入口文件
```

## 核心功能实现

### 1. 数据存储

使用 IndexedDB 实现本地数据持久化：

```typescript
// src/utils/db.ts
export const initDB = async () => {
  const db = await openDB('amazon-finance-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
    },
  });
  return db;
};
```

### 2. 状态管理

使用 Zustand 进行状态管理：

```typescript
// src/stores/transactionStore.ts
export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,
  fetchTransactions: async () => {
    // 实现交易数据获取逻辑
  },
  // ... 其他状态和操作
}));
```

### 3. Excel 数据处理

支持 Excel 文件上传和预览：

```typescript
// src/utils/excel.ts
export const importExcel = (file: File): Promise<Partial<Transaction>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target?.result, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      resolve(data);
    };
    reader.readAsBinaryString(file);
  });
};
```

### 4. 用户认证

实现基本的用户认证系统：

```typescript
// src/stores/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (credentials) => {
        // 实现登录逻辑
      },
      logout: () => {
        // 实现登出逻辑
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## 使用说明

1. 登录系统
   - 使用用户名和密码登录
   - 登录状态会被保存在本地存储中

2. 查看总览
   - 在仪表盘页面查看收支统计
   - 查看利润率和月化收益分析
   - 按日期范围筛选数据

3. 管理交易记录
   - 添加/编辑收入和支出记录
   - 关联收入和支出记录
   - 上传和预览 Excel 数据
   - 查看详细的交易信息

4. 数据分析
   - 查看收益率计算
   - 分析月化收益情况
   - 跟踪资金流向

## 注意事项

- 所有金额单位为人民币(CNY)
- 收入记录可以关联到对应的支出记录
- Excel 数据会保存在本地数据库中
- 定期备份重要数据
- 建议定期清理浏览器缓存

## 开发计划

- [ ] 添加多用户支持
- [ ] 实现数据导出功能
- [ ] 添加数据可视化图表
- [ ] 优化移动端体验
- [ ] 添加批量操作功能