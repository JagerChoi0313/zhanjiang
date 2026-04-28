// 路径：app/views/FoodCommunity/page.jsx
"use client";
import React from 'react';
// 引入你写好的 MainPage 组件
import MainPage from './MainPage/page'; 

const FoodCommunityRoot = () => {
  return (
    /* 这里直接渲染 MainPage。
       这样当你访问 /views/FoodCommunity 时，
       它就会作为 {children} 自动显示在你的 layout 布局中。
    */
    <MainPage />
  );
};

export default FoodCommunityRoot;