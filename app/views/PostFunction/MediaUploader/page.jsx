"use client"
import React from 'react'
import {useState,useRef} from 'react'
import {v4 as uuidv4} from 'uuid'

/**
 * MediaUploader - 多图上传与预览组件
 * @param {Array} images - 已上传成功的服务器 URL 数组（用于同步给主页面）
 * @param {function} setImages - 更新服务器 URL 数组的回调
 */

const MediaUploader=({images,setImages})=>{
    const fileInputRef=useRef(null);

    //关键状态：管理本地预览列表（包含上传的状态）
    const [previewList,setPreviewList] = useState([]);

    //处理文件选择
    const handleFileChange=async(e)=>{
        const files = Array.from(e.target.files)
        if (files.length===0)   return

        //限制总数不能超过9张
        const RemainingQuota = 9 - previewList.length;
        const filesToUpload = files.slice(0,remainingQuota);

        //1.1 生成临时预览项，实现秒开预览
        const newPreviews = fileToUpload.map(file=>({
            id:uuidv4(),
            file,   //保存file对象用于后续上传
            localUrl:URL.createObjectURL(file) ,    //生成blob链接
            status:'pending',
            remoteUrl:''
        }));

        setPreviewList(prev=>[...prev,...newPreviews])

        //1.2 自动触发异步上传
        newPreviewList.forEach(previewItem=>{
            uploadFile(previewItem);
        });

        //清空Input，防止选择同名文件不触发
        e.target.value='';
    }

    //2.真实上传逻辑（对接之前写好的/API/Upload）
    const uploadFile = async(previewItem) =>{
        //更新状态为uploading
        setPreviewList(prev => prev.map(item =>
            item.id === previewItem.id ? {...item,status:'uploading'} : item
        ));

        const formData = new FormData();
        formData.append('file',previewItem.file);

        try{
            const res = await fetch('/API/Upload',{
                method:'POST',
                body:formData
            })

            const data = await res.json();

            if(data.success){
                //上传成功：更新预览列表，并同步结果给主页面
                setPreviewList(prev=>prev.map(item=>
                    item.id === previewItem.id ? {...item,status:'success',remoteUrl:dataUrl} : item
                ));
                //同步给主页面数据表需要的数组
                setImages(prev=>[...prev,data.url]);
            }else{
                throw new Error('上传失败')
            }
        }catch(error){
            //上传失败：更新状态
            console.error(error);
            setPreviewList(prev =>prev.map(item=>
                item.id === previewItem.id ? {...item,status:'error'} : item
            ))
        }
    }

    //3.删除图片
    const handleDelete = (idToRemove) =>{
        const itemToRemove = PreviewList.find(item=>item.id === idToRemove);

        //释放本地的objectUrl,防止内存泄漏
        if(itemToRemove && itemToRemove.localUrl){
            URL.revokeObjectURL(itemToRemove.localUrl)
        }

        //从预览表中移除
        setPreviewList(prev => prev.filter(item =>item.id!==idToRemove));

        //如果已经成功，也要从主页面Images数组中移除
        if (itemToRemove && itemToRemove.remoteUrl) {
            setImages(prev => prev.filter(url => url !== itemToRemove.remoteUrl));
    }
    }
    return(
    <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      
      {/* 头部标题 */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          图片/视频 <span className="text-xs text-gray-400 ml-2">添加图片让你的帖子更生动哦~</span>
        </h3>
        <span className="text-xs text-gray-300 font-medium">{previewList.length}/9</span>
      </div>

      {/* 媒体展示区 */}
      <div className="grid grid-cols-3 gap-3">
        
        {/* 已选择图片的预览卡片 */}
        {previewList.map((item) => (
          <div key={item.id} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-100 shadow-sm bg-gray-50">
            {/* 真实图片 */}
            <img 
              src={item.localUrl} 
              alt="预览" 
              className={`w-full h-full object-cover transition-opacity duration-300 ${item.status === 'success' ? 'opacity-100' : 'opacity-40'}`}
            />

            {/* 上传中/错误状态遮罩 */}
            {(item.status === 'uploading' || item.status === 'pending') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                <div className="w-5 h-5 border-2 border-[#A37352] border-t-transparent rounded-full animate-spin mb-1"></div>
                <span className="text-[10px] text-[#A37352]">上传中</span>
              </div>
            )}
            
            {item.status === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50/80">
                <span className="text-[10px] text-red-500 font-bold">⚠️ 上传失败</span>
              </div>
            )}

            {/* 悬浮删除按钮 */}
            <button 
              onClick={() => handleDelete(item.id)}
              className="absolute top-1.5 right-1.5 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* “+”号上传按钮 (当数量小于9时显示) */}
        {previewList.length < 9 && (
          <button 
            onClick={() => fileInputRef.current.click()}
            className="aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-[#A37352] hover:bg-[#A37352]/5 transition-all flex flex-col items-center justify-center text-gray-400 hover:text-[#A37352]"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">上传图片/视频</span>
            <span className="text-[10px] text-gray-300 mt-1">支持jpg、png，单张不超过5MB</span>
          </button>
        )}
      </div>

      {/* 隐藏的文件输入框 */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        accept="image/*" 
        className="hidden" 
      />
      
    </div>
    )
}

export default MediaUploader