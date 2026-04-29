const CommentCard=({data})=>{

    const dateStr = data.createAt 
    ? new Date(data.createAt).toLocaleDateString().replace(/\//g, '-') 
    : '2026-04-28';
    return(
 <div className="relative flex p-6 bg-white rounded-[20px] border border-gray-100 mb-4 shadow-sm items-start">
      
      {/* 1. 绝对定位的三个点 (右上角) - 用三个小圆点拼出标准设置图标，绝对还原 */}
      <div className="absolute top-5 right-6 flex gap-[3px] cursor-pointer p-2">
        <div className="w-[4px] h-[4px] bg-gray-300 rounded-full"></div>
        <div className="w-[4px] h-[4px] bg-gray-300 rounded-full"></div>
        <div className="w-[4px] h-[4px] bg-gray-300 rounded-full"></div>
      </div>

      {/* 2. 左侧：封面图 */}
      <div className="w-[100px] h-[100px] shrink-0">
        <img 
          src={data.postCover || '/default-food.jpg'} 
          className="w-full h-full object-cover rounded-xl" 
          alt="cover" 
        />
      </div>

      {/* 3. 中间：文字内容区 */}
      <div className="flex-1 ml-5 flex flex-col justify-start py-1">
        <h3 className="text-[16px] font-bold text-gray-900">{data.postTitle}</h3>
        
        {/* 标题下的灰色摘要 */}
        <p className="text-[13px] text-gray-400 mt-1.5 line-clamp-1">{data.postDescription}</p>
        
        {/* 评论正文 */}
        <p className="text-[14px] text-gray-700 mt-3 font-medium">{data.content}</p>
        
        {/* 底部按钮 */}
        <div className="flex items-center gap-6 text-[13px] text-gray-400 mt-5">
          <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400">
            <span className="text-[15px]">👍</span> 26
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400">
            <span className="text-[15px]">💬</span> 回复
          </div>
        </div>
      </div>

      {/* 4. 右侧：原帖引用区与日期 */}
      <div className="w-[200px] ml-6 flex flex-col justify-between items-end min-h-[100px]">
        
        {/* 灰色背景卡片 - 改用 bg-gray-50 确保 Tailwind 一定能渲染出背景色 */}
        <div className="w-full bg-gray-50 p-3 rounded-xl mt-6">
          <div className="text-[11px] text-gray-400 mb-1">原帖内容</div>
          <div className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed mb-2">
            {data.postDescription}
          </div>
          <div className="text-[12px] text-[#A68A80] cursor-pointer font-medium hover:underline">
            查看原帖 &gt;
          </div>
        </div>

        {/* 日期对齐到最右下角 */}
        <div className="text-[13px] text-gray-300 mt-3 pr-1">
          {dateStr}
        </div>
      </div>

    </div>
    )
}

export default CommentCard;