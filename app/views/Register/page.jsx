"use client";
import {Form,Input,Card,Button,message,Select,InputNumber} from 'antd';
import {UserOutlined,MailOutlined,LockOutlined,PhoneOutlined,HeartOutlined} from '@ant-design/icons';
import {useState} from 'react'
import Link from 'next/link';

const {Option} = Select

const RegisterPage=()=>{

        const [form] = Form.useForm();
        const [loading,setLoading]=useState(false);
        
        //将前端的数据传给后端
        const onFinish = async(values) =>{
            try{
                //发起网络请求
                const response = await fetch('/API/auth/Register',{
                    method:'POST',
                    headers:{"Content-Type" : "application/json"},
                    body:JSON.stringify(values)
                })

                const data = await response.json();

                if(data.success){
                    message.success('恭喜！您已成功入驻湛江美食地图');
                    form.resetFields(); //清空表单
                }else{
                    message.error(data.error||'注册失败')
                }

            }catch(error){
                message.error('无法连接服务器，请检查网络')
            }finally{
              setLoading(false)
            }
        };

    return (
       <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card 
        title={<div className="text-center text-xl font-bold text-[#a63d2d]">加入美食地图</div>} 
        className="w-full max-w-lg shadow-lg border-t-4 border-[#a63d2d]"
      >
        <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="昵称" name="nickname" rules={[{ required: true, message: '名号不能为空' }]}>
              <Input prefix={<UserOutlined />} placeholder="食客名号" />
            </Form.Item>

            <Form.Item label="性别" name="gender">
              <Select placeholder="请选择">
                <Option value="male">男</Option>
                <Option value="female">女</Option>
                <Option value="secret">保密</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="年龄" name="age">
              <InputNumber min={1} max={120} className="w-full" placeholder="你的年龄" />
            </Form.Item>

            <Form.Item label="电话" name="phoneNumber" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '格式错误' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="联系电话" />
            </Form.Item>
          </div>

          <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="example@food.com" />
          </Form.Item>

          <Form.Item label="密码" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="设置密码" />
          </Form.Item>

          <Form.Item 
            label="确认密码" 
            name="confirmPassword" 
            dependencies={['password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} className="bg-[#a63d2d] h-10">
            开启美食之旅
          </Button>

          <div className="text-center mt-4 text-gray-500">
            已有账号？ <Link href="views/Login" className="text-[#a63d2d]">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
    )
}

export default RegisterPage;