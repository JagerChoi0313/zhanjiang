"use client"

import React from 'react'

/**
 * PostConfig - 发帖页面的右侧配置模块
 * @param {string} category - 当前选中的分类
 * @param {function} setCategory - 设置分类的回调
 * @param {string} location - 当前选中的地区
 * @param {function} setLocation - 设置地区的回调
 */

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
 <div className="space-y-6">
      
      {/* 选择分类卡片 */}
      <section className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
          选择分类 <span className="text-red-500 ml-1">*</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.label)}
              className={`
                flex items-center px-4 py-2 rounded-xl text-sm transition-all duration-200
                ${category === item.label 
                  ? 'bg-[#A37352] text-white shadow-md shadow-[#A37352]/20' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
              `}
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 选择地区卡片 */}
      <section className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
          选择地区 <span className="text-red-500 ml-1">*</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setLocation(area)}
              className={`
                py-2 rounded-lg text-xs transition-all duration-200 border
                ${location === area 
                  ? 'border-[#A37352] bg-[#A37352]/5 text-[#A37352] font-medium' 
                  : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'}
              `}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      {/* 发布设置预览 (模拟 UI 效果) */}
      <section className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] opacity-80">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">发布设置</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>可见范围</span>
            <span>公开 (所有人可见) ▾</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-4">
            <span>加入合集 (可选)</span>
            <span>未选择 ▾</span>
          </div>
        </div>
      </section>

    </div>
    )
}

export default PostConfig