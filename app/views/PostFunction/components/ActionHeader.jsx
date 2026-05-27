"use client"
import React from 'react'
import {useRouter} from 'next/navigation'

/**
 * ActionHeader - 发帖页面的顶部交互条
 * @param {boolean} isReady - 发布按钮是否可用（标题/内容等必填项是否已填）
 * @param {function} onPublish - 点击发布时的回调函数
 */

const ActionHeader =({isReady = false,onPublish})=>{
    const router = useRouter();
    return(
    <header style={{height:46, borderBottom:'1px solid #eee9e3', background:'rgba(255,255,255,.94)', zIndex:50, backdropFilter:'blur(12px)'}}>
      <div style={{maxWidth:1180, height:'100%', margin:'0 auto', padding:'0 18px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative'}}>
        
        {/* 左侧：返回按钮 */}
        <button 
          onClick={() => router.back()}
          style={{display:'inline-flex', alignItems:'center', gap:5, border:0, background:'transparent', color:'#6b7280', fontSize:12, cursor:'pointer'}}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14"
            height="14"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>返回</span>
        </button>

        {/* 中间：页面标题 */}
        <h1 style={{position:'absolute', left:'50%', transform:'translateX(-50%)', margin:0, fontSize:14, fontWeight:700, color:'#111827'}}>
          发帖投稿
        </h1>

        {/* 右侧：动作按钮组 */}
        <div style={{display:'flex', alignItems:'center', gap:9}}>
          <button 
            style={{border:0, background:'transparent', color:'#4b5563', fontSize:12, fontWeight:600, cursor:'pointer'}}
          >
            存草稿
          </button>
          
          <button 
            onClick={onPublish}
            disabled={!isReady}
            style={{
              border:0,
              borderRadius:999,
              padding:'6px 17px',
              fontSize:12,
              fontWeight:700,
              color:isReady ? '#ffffff' : '#9ca3af',
              background:isReady ? '#9a5f34' : '#e5e7eb',
              cursor:isReady ? 'pointer' : 'not-allowed'
            }}
          >
            发布
          </button>
        </div>

      </div>
    </header>
    )
}

export default ActionHeader
