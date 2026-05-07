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
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 左侧：返回按钮 */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="Status15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">返回</span>
        </button>

        {/* 中间：页面标题 */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-900">
          发帖投稿
        </h1>

        {/* 右侧：动作按钮组 */}
        <div className="flex items-center space-x-3">
          <button 
            className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            存草稿
          </button>
          
          <button 
            onClick={onPublish}
            disabled={!isReady}
            className={`
              px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-300
              ${isReady 
                ? 'bg-[#A37352] text-white shadow-sm hover:bg-[#8e6245] active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            发布
          </button>
        </div>

      </div>
    </header>
    )
}

export default ActionHeader