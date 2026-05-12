"use client";
import {Form,Input,Card,Button,message,Select,InputNumber,Upload} from 'antd';
import {UserOutlined,MailOutlined,LockOutlined,PhoneOutlined,PlusOutlined} from '@ant-design/icons';
import {useState} from 'react'
import Link from 'next/link';

const { Option } = Select;

// 1. **修复：将图片文件转换为 Base64 字符串的辅助函数（添加了缺失的 return）**
const getBase64 = (file) => {
  return new Promise((resolve, reject) => { // 修复：必须在此处添加 return 语句
    const reader = new FileReader(); // 修复：FileReader 必须大写 F
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(); // 用于存储头像 Base64 字符串以显示预览

  // 处理头像选择
  const handleAvatarChange = async (info) => {
    // 拦截文件，转为 Base64 格式用于预览和提交
    const file = info.fileList[0]?.originFileObj;
    if (file) {
      // 修复：此时 base64Url 将正确获得异步数据
      const base64Url = await getBase64(file);
      // 2. **关键：设置 state 触发界面重新渲染，显示头像 preview**
      setImageUrl(base64Url);
      // 手动将 base64 字符串塞进表单的 avatar 字段中，用于提交
      form.setFieldsValue({ avatar: base64Url });
    }
  };

  // 将前端的数据传给后端
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 发起网络请求
      const response = await fetch('/API/auth/Register', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (data.success) {
        message.success('恭喜！您已成功入驻湛江美食地图');
        form.resetFields(); // 清空表单
        setImageUrl(null); // 清空头像预览
      } else {
        message.error(data.error || '注册失败');
      }
    } catch (error) {
      message.error('无法连接服务器，请检查网络');
    } finally {
      setLoading(false);
    }
  };

      // 头像上传按钮 UI
    const uploadButton = (
        <div className="flex flex-col items-center justify-center text-gray-400 hover:text-[#a63d2d] transition-colors">
          <PlusOutlined className="text-xl mb-2" />
        <div className="text-sm">上传头像</div>
        </div>
      );

    return (
<div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <Card
        title={<div className="text-center text-xl font-bold text-[#a63d2d]">加入美食地图</div>}
        className="w-full max-w-lg shadow-lg border-t-4 border-[#a63d2d] rounded-2xl"
      >
        <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
          
          {/* 3. **核心架构修改：将 Upload 组件彻底拿出 Form.Item** */}
          {/* 此时 Upload 是一个纯粹的 UI 预览组件，不再受表单直接控制，彻底修复报错 */}
          <div className="flex justify-center mb-6">
            <Upload
              name="avatar-uploader"
              listType="picture-circle"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={() => false} // 阻止默认的自动上传行为
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg, image/jpg"
            >
              {imageUrl ? (
                // 4. **关键：当有图片数据时，这里渲染预览图**
                <img src={imageUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                // 此时是默认状态，显示 '+' 号
                uploadButton
              )}
            </Upload>
          </div>

          {/* 5. **核心架构修改：添加一个隐藏的表单项用于提交数据** */}
          {/* 当你在 handleAvatarChange 中 form.setFieldsValue 时，这个隐藏项会接住数据 */}
          <Form.Item name="avatar" hidden>
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="昵称" name="nickname" rules={[{ required: true, message: '名号不能为空' }]}>
              <Input prefix={<UserOutlined />} placeholder="食客名号" className="rounded-lg" />
            </Form.Item>

            <Form.Item label="性别" name="gender">
              <Select placeholder="请选择" className="rounded-lg">
                <Option value="male">男</Option>
                <Option value="female">女</Option>
                <Option value="secret">保密</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="年龄" name="age">
              <InputNumber min={1} max={120} className="w-full rounded-lg" placeholder="你的年龄" />
            </Form.Item>

            <Form.Item label="电话" name="phoneNumber" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '格式错误' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="联系电话" className="rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="example@food.com" className="rounded-lg" />
          </Form.Item>

          <Form.Item label="密码" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="设置密码" className="rounded-lg" />
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
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" className="rounded-lg" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} className="bg-[#a63d2d] hover:bg-[#8b3224] h-11 rounded-xl text-base font-medium mt-2">
            开启美食之旅
          </Button>

          <div className="text-center mt-6 text-sm text-gray-500">
            已有账号？ <Link href="/views/Login" className="text-[#a63d2d] font-medium hover:underline">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
    )
}

export default RegisterPage;