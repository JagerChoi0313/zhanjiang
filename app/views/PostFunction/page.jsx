"use client"
import React from 'react'
import {useState,useMemo} from 'react'
import {useRouter} from 'next/navigation'

// 导入刚才封装的四个组件
import ActionHeader from './ActionHeader/page';
import EditorSection from './EditorSection/page';
import MediaUploader from './MediaUploader/page';
import PostConfig from './PostConfig/page';

const PostFunction=()=>{
    const router = useRouter();
    //统一表单状态管理
    const [title,setTitle] = useState('')
    const [description,setDescription] = useState('')
    const [category,setCategory] = useState('')
    const [location,setLocation] = useState('')
    const [images,setImages] = useState([])

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
                    coverImage:images[0] || '', //默认第一张图为封面
                })
            });

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
    return(
    <div style={{minHeight:'100vh', background:'#f7f5f2', color:'#1f2937', paddingBottom:48}}>
      {/* 顶部导航与发布动作 */}
      <ActionHeader isReady={isReady} onPublish={handlePublish} />

      <main style={{maxWidth:1180, margin:'0 auto', padding:'22px 18px'}}>
        <div
          style={{
            display:'grid',
            gridTemplateColumns:'minmax(0, 1fr) 322px',
            gap:22,
            alignItems:'start'
          }}
        >
          
          {/* 左侧：创作核心区 (编辑器 + 媒体上传) */}
          <div style={{minWidth:0, display:'flex', flexDirection:'column', gap:14}}>
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
          <aside style={{position:'sticky', top:64}}>
            <PostConfig 
              category={category} 
              setCategory={setCategory} 
              location={location} 
              setLocation={setLocation} 
            />
          </aside>

        </div>
      </main>
    </div>
    )
}

export default PostFunction
