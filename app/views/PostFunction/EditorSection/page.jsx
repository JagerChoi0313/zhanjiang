"use client"
import React from 'react'

/**
 * EditorSection - 投稿内容编辑区
 * @param {string} title - 标题内容
 * @param {function} setTitle - 更新标题
 * @param {string} description - 正文内容
 * @param {function} setDescription - 更新正文
 */

const EditorSection=({title,setTitle,description,setDescription})=>{

    // 假工具栏图标数据
  const mockTools = [
    { icon: "B", label: "加粗" },
    { icon: "I", label: "斜体" },
    { icon: "H", label: "标题" },
    { icon: "🔗", label: "链接" },
    { icon: "“", label: "引用" },
    { icon: "🖼️", label: "图片" },
    { icon: "🎥", label: "视频" },
    { icon: "😊", label: "表情" },
    { icon: "@", label: "提及" },
  ];

    return(
 <div className="space-y-4">
      
      {/* 标题输入区 */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">标题 (必填)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
          placeholder="给你的帖子起一个吸引人的标题吧~"
          className="w-full text-2xl font-bold text-gray-800 placeholder-gray-300 border-none focus:ring-0 p-0"
        />
        <div className="absolute right-6 bottom-4 text-xs text-gray-300">
          {title.length}/100
        </div>
      </div>

      {/* 内容编辑区 */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {/* 假工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center space-x-4">
            {mockTools.map((tool, index) => (
              <button 
                key={index} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={tool.label}
                onClick={(e) => e.preventDefault()}
              >
                <span className="text-sm font-medium">{tool.icon}</span>
              </button>
            ))}
          </div>
          <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            撤销
          </button>
        </div>

        {/* 纯文字输入区 */}
        <div className="p-6 relative">
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">内容 (必填)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 5000))}
            placeholder="分享你的美食体验、做法心得、探店经历..."
            className="w-full min-h-[300px] text-lg text-gray-700 leading-relaxed placeholder-gray-300 border-none focus:ring-0 p-0 resize-none"
          />
          <div className="text-right text-xs text-gray-300 mt-2">
            {description.length}/5000
          </div>
        </div>
      </div>
      
    </div>
    )
}

export default EditorSection