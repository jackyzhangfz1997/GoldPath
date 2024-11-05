import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initDB } from './utils/db';

// 初始化应用
const init = async () => {
  try {
    await initDB();
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <App />
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};

init();