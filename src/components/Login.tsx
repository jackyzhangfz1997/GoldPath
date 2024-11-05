import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Input, Button, Card, App } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const captchaInputRef = useRef<Input>(null);
  
  const [formState, setFormState] = useState({
    captcha: Math.floor(1000 + Math.random() * 9000).toString(),
    userCaptcha: '',
  });

  const generateCaptcha = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      captcha: Math.floor(1000 + Math.random() * 9000).toString(),
      userCaptcha: '',
    }));
    form.setFieldValue('captcha', '');
    captchaInputRef.current?.focus();
  }, [form]);

  const onFinish = async (values: { username: string; password: string }) => {
    if (formState.userCaptcha !== formState.captcha) {
      message.error('验证码错误');
      generateCaptcha();
      return;
    }

    try {
      await login(values);
      navigate('/dashboard');
    } catch (error) {
      message.error('登录失败，请重试');
      generateCaptcha();
      form.setFieldValue('password', '');
    }
  };

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
    setFormState(prev => ({
      ...prev,
      userCaptcha: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-[360px]">
        <div className="text-center mb-6">
          <h1 className="text-xl font-medium">亚马逊资金管理系统</h1>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input 
              size="large" 
              placeholder="用户名"
              className="rounded"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password 
              size="large" 
              placeholder="密码"
              className="rounded"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex space-x-2">
              <Input
                ref={captchaInputRef}
                size="large"
                placeholder="验证码"
                value={formState.userCaptcha}
                onChange={handleCaptchaChange}
                className="rounded"
                maxLength={4}
                autoComplete="off"
              />
              <Button
                size="large"
                className="min-w-[100px] bg-gray-50 select-none"
                onClick={generateCaptcha}
              >
                {formState.captcha}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              className="rounded"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;