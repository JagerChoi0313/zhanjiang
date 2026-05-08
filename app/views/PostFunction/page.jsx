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
    const [images,setImages] = useState('')

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航与发布动作 */}
      <ActionHeader isReady={isReady} onPublish={handlePublish} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 左侧：创作核心区 (编辑器 + 媒体上传) */}
          <div className="flex-1 space-y-8">
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
          <div className="w-full lg:w-80">
            <PostConfig 
              category={category} 
              setCategory={setCategory} 
              location={location} 
              setLocation={setLocation} 
            />
            
            {/* 发布须知 - 还原 UI 模板底部提示 */}
            <div className="mt-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
              <h4 className="text-xs font-bold text-orange-800 mb-2">发布须知</h4>
              <p className="text-[10px] text-orange-700 leading-relaxed">
                请遵守社区规范，拒绝发布违法违规、低俗、欺诈或侵权内容。查看《社区规范》{'>'}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
    )
}

export default PostFunction