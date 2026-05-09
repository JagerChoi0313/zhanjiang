"use client"
import React from 'react'

/**
 * EditorSection - 投稿内容编辑区
 * @param {string} title - 标题内容
 * @param {function} setTitle - 更新标题
 * @param {string} description - 正文内容
 * @param {function} setDescription - 更新正文
 */

const cardStyle = {
  background:'#ffffff',
  border:'1px solid #eee9e3',
  borderRadius:8,
  boxShadow:'0 10px 26px rgba(70, 54, 38, 0.04)'
};

const EditorSection=({title,setTitle,description,setDescription})=>{

    // 假工具栏图标数据
  const mockTools = [
    { icon: "B", label: "加粗" },
    { icon: "I", label: "斜体" },
    { icon: "H", label: "标题" },
    { icon: "🔗", label: "链接" },
    { icon: "“", label: "引用" },
    { icon: "▣", label: "图片" },
    { icon: "◉", label: "视频" },
    { icon: "☺", label: "表情" },
    { icon: "@", label: "提及" },
  ];

    return(
 <div style={{display:'flex', flexDirection:'column', gap:12}}>
      
      {/* 标题输入区 */}
      <div style={{...cardStyle, position:'relative', height:88, boxSizing:'border-box', padding:'15px 22px'}}>
        <label style={{display:'block', marginBottom:9, fontSize:13, fontWeight:700, color:'#111827'}}>标题 <span style={{fontWeight:500, color:'#9ca3af'}}>(必填)</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
          placeholder="给你的帖子起一个吸引人的标题吧~"
          style={{width:'100%', border:0, outline:'none', padding:0, paddingRight:60, fontSize:14, color:'#1f2937', background:'transparent'}}
        />
        <div style={{position:'absolute', right:22, bottom:14, fontSize:11, color:'#b8b2ab'}}>
          {title.length}/100
        </div>
      </div>

      {/* 内容编辑区 */}
      <div style={{...cardStyle, height:338, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        
        {/* 假工具栏 */}
        <div style={{height:40, flex:'0 0 40px', padding:'0 18px', borderBottom:'1px solid #f0ece7', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:15}}>
            {mockTools.map((tool, index) => (
              <button 
                key={index} 
                title={tool.label}
                onClick={(e) => e.preventDefault()}
                style={{border:0, background:'transparent', color:'#5f6570', fontSize:12, fontWeight:700, cursor:'pointer', padding:0, minWidth:14}}
              >
                <span>{tool.icon}</span>
              </button>
            ))}
          </div>
          <button style={{border:0, background:'transparent', color:'#6b7280', display:'inline-flex', alignItems:'center', gap:5, fontSize:12, cursor:'pointer'}}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            撤销
          </button>
        </div>

        {/* 纯文字输入区 */}
        <div style={{position:'relative', flex:1, minHeight:0, padding:'17px 22px 14px', boxSizing:'border-box', display:'flex', flexDirection:'column'}}>
          <label style={{display:'block', marginBottom:10, fontSize:13, fontWeight:700, color:'#111827'}}>内容 <span style={{fontWeight:500, color:'#9ca3af'}}>(必填)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 5000))}
            placeholder="分享你的美食体验、做法心得、探店经历..."
            style={{width:'100%', flex:1, minHeight:0, resize:'none', border:0, outline:'none', padding:0, fontSize:14, lineHeight:'25px', color:'#374151', background:'transparent'}}
          />
          <div style={{textAlign:'right', fontSize:11, color:'#b8b2ab'}}>
            {description.length}/5000
          </div>
        </div>
      </div>
      
    </div>
    )
}

export default EditorSection
