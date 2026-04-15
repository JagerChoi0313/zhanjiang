"use client"
import {Form,Button,Card,Input,message,Checkbox} from 'antd'    //导入ant design的UI组件
import {MailOutlined,LockOutlined} from '@ant-design/icons'
import {useState} from 'react'
import Link from 'next/link';


const LoginPage=()=>{
    const [form] = Form.useForm();
    const [loading,setLoading] = useState(false);

    const onFinish = async(values)=>{       //values是一个对象，包含了表单里面的所有数据（nickname，email等）
        setLoading(true);

        try{
            const response = await fetch('/API/auth/Login',{
                method:'POST',      //使用POST方法，意为新建/提交
                headers:{'Content-Type':'application/json'},    //告诉后端，我发给你的是json格式的数据
                body:JSON.stringify(values)                 //把js对象转换成字符串，后端才能理解
            });

            const data = await response.json();         //等待后端回信，并转成JSON格式
            if(data.success){
                message.success('欢迎回来');            //成功提示
                //成功后的逻辑，比如跳转
            }else{
                message.error('账号密码错误');
            }

        }catch{
            message.error('无法连接服务器，请检查网络')     //这里的catch是处理网络断了，服务器崩了的情况
        }finally{
            setLoading(false);
        }
    };

    return(
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
            <Card 
        title={<div className="text-center text-xl font-bold text-[#a63d2d]">寻味湛江</div>} 
        className="w-full max-w-md shadow-lg border-t-4 border-[#a63d2d]"
      >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[{required:true,type:'email',message:'名号不能为空'}]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="example@food.com"/>
                    </Form.Item>

                    <Form.Item
                    lable="密码"
                    name="password"
                    rules={[{required:true,message:'请输入密码'}]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码"/>
                    </Form.Item>

                    <div className="flex justify-between items-center mb-4">
                        <Checkbox>记住我</Checkbox>
                        <a className="text-[#a63d2d] text-sm cursor-pointer">忘记密码？</a>
                    </div>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={loading} 
                        className="bg-[#a63d2d] h-10 hover:!bg-[#8a3225]"
                    >
                        立即登录
                     </Button>

                    <div className="text-center mt-4 text-gray-500">
                     还没有账号？ <Link href="/views/Register" className="text-[#a63d2d]">立即注册</Link>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

export default LoginPage;