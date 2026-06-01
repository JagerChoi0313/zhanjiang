"use client"
import React from 'react'
import {useState,useMemo,useEffect} from 'react'
import {useRouter} from 'next/navigation'

// 导入刚才封装的四个组件
import ActionHeader from './components/ActionHeader';
import EditorSection from './components/EditorSection';
import MediaUploader from './components/MediaUploader';
import PostConfig from './components/PostConfig';
import Link from 'next/link'

const PostFunction=()=>{
    const router = useRouter();
    //统一表单状态管理
    const [title,setTitle] = useState('')
    const [description,setDescription] = useState('')
    const [category,setCategory] = useState('')
    const [location,setLocation] = useState('')
    const [images,setImages] = useState([])
    const [coverImage,setCoverImage]=useState('')

    //身份查验状态
    const [isAuthorized,setIsAuthorized] = useState(false)
    const [authChecking,setAuthChecking] = useState(true)

    //页面挂载时去检验是否有合法的token
    useEffect(()=>{
      const checkAuth = async()=>{
        try{
          const res = await fetch('/API/auth/Login');
          const data = await res.json();

          if(data.success){
            setIsAuthorized(true)
          }else{
            setIsAuthorized(false)
          }
        }catch(error){
            console.error("Auth check failed:",error)
            setIsAuthorized(false)
        }finally{
          setAuthChecking(false)
        }
      }

      checkAuth()
    },[])

    //逻辑判断，发布按钮是否可用
    const isReady = useMemo(()=>{
        return title.trim() !== ''&&
               description.trim() !== ''&&
               category !== ''&&
               location !== '';
    },[title,description,category,location]);

    //最终发布逻辑
    const handlePublish = async()=>{
        if(!isReady) return;

        try{
            const response = await fetch('/API/Post',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    title,
                    description,
                    category,
                    location,
                    images,     //数组会在后端被JSON.stringify
                    coverImage:coverImage || (images.length > 0 ? images[0] : '')
                })
            });

            //双保险：如果用户在写文章时token刚好过期了，
            if(response.status === 401){
              alert("登录已失效，请重新登录后再发布")
              router.push('/views/Login')
            }

            const data = await response.json();

            if(data.success){
                alert("发布成功！")
                router.push('/views/FoodCommunity') //假设跳转回社区主页
            }else{
                alert("发布失败:" + data.message)
            }
        }catch(error){
            console.error("Publish error:",error)
            alert("网络错误，请稍后重试")
        }
    }
    
    //身份核验加载中
    if (authChecking) {
        return (
            <div style={{ height: '100vh', background: '#f7f5f2' }} className="flex justify-center items-center">
                <span className="text-gray-400 text-sm animate-pulse font-light">正在核实创作者身份...</span>
            </div>
        );
    }

    //未登录时的视图
    if (!isAuthorized) {
        return (
            <div style={{ height: '100vh', background: '#f7f5f2' }} className="flex flex-col justify-center items-center py-6 px-10">
                <div className="bg-white p-12 rounded-3xl flex flex-col items-center max-w-md w-full shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex justify-center items-center mb-6 text-gray-300">
                        {/* 创作主题的 SVG 图标：羽毛笔与纸 */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 mb-2">需要验证身份</h2>
                    <p className="text-gray-500 text-sm mb-8 text-center">登录后即可进入创作者中心，发布你的专属美食记录</p>
                    <Link 
                        href="/views/Login" 
                        className="w-full text-center py-3 bg-[#a63d2d] text-white rounded-xl font-medium active:scale-95 transition-transform hover:bg-[#8e3326]"
                    >
                        前往登录
                    </Link>
                </div>
            </div>
        );
    }

    return(
    <div style={{height:'100vh', overflow:'hidden', background:'#f7f5f2', color:'#1f2937'}}>
      {/* 顶部导航与发布动作 */}
      <ActionHeader isReady={isReady} onPublish={handlePublish} />

      <main style={{height:'calc(100vh - 46px)', maxWidth:1180, margin:'0 auto', padding:'14px 18px 12px', boxSizing:'border-box'}}>
        <div
          style={{
            display:'grid',
            gridTemplateColumns:'minmax(0, 1fr) 320px',
            gap:18,
            alignItems:'stretch',
            height:'100%'
          }}
        >
          
          {/* 左侧：创作核心区 (编辑器 + 媒体上传) */}
          <div style={{minWidth:0, height:'100%', display:'flex', flexDirection:'column', gap:12}}>
            <EditorSection 
              title={title} 
              setTitle={setTitle} 
              description={description} 
              setDescription={setDescription} 
            />
            
            <MediaUploader 
              images={images} 
              setImages={setImages} 
            />
          </div>

          {/* 右侧：配置卡片区 (分类 + 地区) */}
          <aside style={{height:'100%'}}>
            <PostConfig 
              category={category} 
              setCategory={setCategory} 

              location={location} 
              setLocation={setLocation} 

              coverImage={coverImage}
              setCoverImage={setCoverImage}
            />
          </aside>

        </div>
      </main>
    </div>
    )
}

export default PostFunction
