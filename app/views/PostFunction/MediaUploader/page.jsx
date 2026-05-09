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
        const remainingQuota = 9 - previewList.length;
        const filesToUpload = files.slice(0,remainingQuota);

        //1.1 生成临时预览项，实现秒开预览
        const newPreviews = filesToUpload.map(file=>({
            id:uuidv4(),
            file,   //保存file对象用于后续上传
            localUrl:URL.createObjectURL(file) ,    //生成blob链接
            status:'pending',
            remoteUrl:''
        }));

        setPreviewList(prev=>[...prev,...newPreviews])

        //1.2 自动触发异步上传
        newPreviews.forEach(previewItem=>{
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
                    item.id === previewItem.id ? {...item,status:'success',remoteUrl:data.url} : item
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
        const itemToRemove = previewList.find(item=>item.id === idToRemove);

        //释放本地的objectUrl,防止内存泄露
        if(itemToRemove && itemToRemove.localUrl){
            URL.revokeObjectURL(itemToRemove.localUrl)
        }

        //从预览表中移除
        setPreviewList(prev => prev.filter(item =>item.id!==idToRemove));

        //如果已经成功，也要从主页面images数组中移除
        if (itemToRemove && itemToRemove.remoteUrl) {
            setImages(prev => prev.filter(url => url !== itemToRemove.remoteUrl));
    }
    }
    return(
    <div style={{background:'#ffffff', border:'1px solid #eee9e3', borderRadius:8, boxShadow:'0 10px 26px rgba(70, 54, 38, 0.04)', padding:'18px 22px'}}>
      
      {/* 头部标题 */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h3 style={{margin:0, fontSize:13, fontWeight:700, color:'#111827'}}>
          图片/视频 <span style={{fontWeight:500, color:'#8f96a3'}}>添加图片让你的帖子更生动哦~</span>
        </h3>
        <span style={{fontSize:13, fontWeight:700, color:'#9ca3af'}}>{previewList.length}/9</span>
      </div>

      {/* 媒体展示区 */}
      <div style={{display:'grid', gridTemplateColumns:previewList.length ? 'repeat(3, 1fr)' : '1fr', gap:12}}>
        
        {/* 已选择图片的预览卡片 */}
        {previewList.map((item) => (
          <div key={item.id} style={{position:'relative', aspectRatio:'4 / 3', overflow:'hidden', borderRadius:6, border:'1px solid #eee9e3', background:'#f7f5f2'}}>
            {/* 真实图片 */}
            <img 
              src={item.localUrl} 
              alt="预览" 
              style={{width:'100%', height:'100%', objectFit:'cover', opacity:item.status === 'success' ? 1 : .45}}
            />

            {/* 上传中/错误状态遮罩 */}
            {(item.status === 'uploading' || item.status === 'pending') && (
              <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,.68)'}}>
                <div style={{width:20, height:20, borderRadius:'50%', border:'2px solid #9a5f34', borderTopColor:'transparent', marginBottom:6}}></div>
                <span style={{fontSize:11, color:'#9a5f34'}}>上传中</span>
              </div>
            )}
            
            {item.status === 'error' && (
              <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(254,242,242,.86)'}}>
                <span style={{fontSize:11, fontWeight:700, color:'#ef4444'}}>上传失败</span>
              </div>
            )}

            {/* 悬浮删除按钮 */}
            <button 
              onClick={() => handleDelete(item.id)}
              style={{position:'absolute', right:6, top:6, width:24, height:24, border:0, borderRadius:'50%', background:'rgba(0,0,0,.45)', color:'#fff', cursor:'pointer'}}
            >
              ×
            </button>
          </div>
        ))}

        {/* “+”号上传按钮 (当数量小于9时显示) */}
        {previewList.length < 9 && (
          <button 
            onClick={() => fileInputRef.current.click()}
            style={{height:190, border:'1px dashed #ded8d0', borderRadius:6, background:'#fbfaf8', color:'#8f8880', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}
          >
            <span style={{fontSize:34, lineHeight:'34px', color:'#a5a09a', marginBottom:10}}>+</span>
            <span style={{fontSize:13, fontWeight:700}}>上传图片/视频</span>
            <span style={{fontSize:11, color:'#b8b2ab', marginTop:6}}>支持 jpg、png，单张不超过 5MB</span>
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
