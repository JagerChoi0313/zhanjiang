"use client"

import React from 'react'

/**
 * PostConfig - 发帖页面的右侧配置模块
 * @param {string} category - 当前选中的分类
 * @param {function} setCategory - 设置分类的回调
 * @param {string} location - 当前选中的地区
 * @param {function} setLocation - 设置地区的回调
 */

const sideCard = {
  background:'#ffffff',
  border:'1px solid #eee9e3',
  borderRadius:8,
  boxShadow:'0 10px 26px rgba(70, 54, 38, 0.04)',
  padding:16
};

const PostConfig = ({category,setCategory,location,setLocation})=>{

    // 对应 UI 模板中的分类选项
  const categories = [
    { id: 'recipe', label: '菜谱', icon: '🍳' },
    { id: 'explore', label: '探店', icon: '📋' },
    { id: 'strategy', label: '攻略', icon: '📝' },
    { id: 'share', label: '美食分享', icon: '🥘' },
    { id: 'other', label: '其他', icon: '···' },
  ];

    // 对应湛江的行政区划
  const areas = ['赤坎区', '霞山区', '坡头区', '麻章区', '遂溪县', '徐闻县', '廉江市', '雷州市', '吴川市'];

    return(
 <div style={{display:'flex', flexDirection:'column', gap:14}}>
      {/* 1. 分类选择 */}
      <div style={sideCard}>
        <h3 style={{margin:'0 0 14px', fontSize:13, fontWeight:700, color:'#111827'}}>
          选择分类 <span style={{fontWeight:500, color:'#9ca3af'}}>(必选)</span>
        </h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.label)}
              style={{
                height:36,
                display:'flex',
                alignItems:'center',
                gap:7,
                borderRadius:6,
                border:category === item.label ? '1px solid #9a5f34' : '1px solid #eee9e3',
                background:category === item.label ? '#fff5ec' : '#ffffff',
                color:category === item.label ? '#8c542f' : '#4b5563',
                fontSize:12,
                fontWeight:category === item.label ? 700 : 500,
                cursor:'pointer',
                padding:'0 9px'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 封面图(图二新增) */}
      <div style={sideCard}>
        <h3 style={{margin:'0 0 12px', fontSize:13, fontWeight:700, color:'#111827'}}>封面图</h3>
        <div style={{height:140, border:'1px dashed #ded8d0', borderRadius:6, background:'#fbfaf8', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#8f8880'}}>
          <span style={{fontSize:24, marginBottom:8}}>▧</span>
          <span style={{fontSize:12, fontWeight:700}}>选择封面图</span>
          <span style={{fontSize:10, color:'#b8b2ab', marginTop:5}}>建议尺寸 16:9，单张不超过 5MB</span>
        </div>
      </div>

      {/* 3. 发布设置 (图二新增) */}
      <div style={sideCard}>
        <h3 style={{margin:'0 0 14px', fontSize:13, fontWeight:700, color:'#111827'}}>发布设置</h3>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div>
            <span style={{display:'block', marginBottom:6, fontSize:11, color:'#6b7280'}}>地区选择（必填）</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{width:'100%', height:36, border:'1px solid #eee9e3', borderRadius:6, background:'#fbfaf8', padding:'0 10px', fontSize:12, color:'#374151'}}
            >
              <option value="">请选择地区</option>
              {areas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div style={{borderTop:'1px solid #f1ede8', paddingTop:12}}>
            <span style={{display:'block', marginBottom:6, fontSize:11, color:'#6b7280'}}>可见范围</span>
            <div style={{height:36, border:'1px solid #eee9e3', borderRadius:6, background:'#fbfaf8', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', fontSize:12, color:'#374151'}}>
              <span>公开（所有人可见）</span>
              <span style={{color:'#9ca3af'}}>⌄</span>
            </div>
          </div>
          <div>
            <span style={{display:'block', marginBottom:6, fontSize:11, color:'#6b7280'}}>发布时机</span>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              <button style={{height:34, borderRadius:6, border:'1px solid #9a5f34', background:'#fff5ec', color:'#8c542f', fontSize:12, fontWeight:700}}>立即发布</button>
              <button style={{height:34, borderRadius:6, border:'1px solid #eee9e3', background:'#ffffff', color:'#4b5563', fontSize:12}}>定时发布</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 发布须知 */}
      <div style={{border:'1px solid #f4d9c3', borderRadius:8, background:'#fff5ec', padding:16}}>
        <h4 style={{margin:'0 0 8px', fontSize:13, fontWeight:700, color:'#8c542f'}}>
          发布须知
        </h4>
        <p style={{margin:0, fontSize:11, lineHeight:'18px', color:'#9a5f34'}}>
          请遵守社区规范，拒绝发布违法违规、低俗、欺诈或侵权内容。
          <br/>
          <span style={{textDecoration:'underline', cursor:'pointer'}}>查看社区规范 {'>'}</span>
        </p>
      </div>
    </div>
    )
}

export default PostConfig
