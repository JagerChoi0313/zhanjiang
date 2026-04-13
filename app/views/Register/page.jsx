"use client";
import {Form,Input,Card,Button,message} from 'antd';

const RegisterPage=()=>{

        const [form] = Form.useForm();

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
            }
        };

    return (
       <div className="flex justify-center items-center min-h-[80vh]">
      <Card title="食客注册" className="w-full max-w-md shadow-md">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="昵称" name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input placeholder="输入你的食客名号" />
          </Form.Item>

          <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入有效的邮箱' }]}>
            <Input placeholder="example@food.com" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block className="bg-[#a63d2d] hover:bg-[#8e3426] border-none">
            立即提交
          </Button>
        </Form>
      </Card>
    </div>
    )
}

export default RegisterPage;