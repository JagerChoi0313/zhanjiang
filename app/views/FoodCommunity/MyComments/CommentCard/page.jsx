const CommentCard=({data})=>{

    const dateStr = data.createAt 
    ? new Date(data.createAt).toLocaleDateString().replace(/\//g, '-') 
    : '2026-04-28';
    return(
 // 关键修改 1：p-6 改为 p-5，mb-4 改为 mb-3，整体卡片变矮
    <div className="relative flex p-4 lg:p-5 bg-white rounded-[20px] border border-gray-100 mb-3 shadow-sm items-start">
      
      {/* 右上角三个点：稍微调整 top 的位置适应变矮的卡片 */}
      <div className="absolute top-4 right-5 flex gap-[3px] cursor-pointer p-2">
        <div className="w-[4px] h-[4px] bg-gray-300 rounded-full"></div>
        <div className="w-[4px] h-[4px] bg-gray-300 rounded-full"></div>
        <div className="w-[4px] h-[4px] bg-gray-300 rounded-full"></div>
      </div>

      {/* 左侧：封面图 - 稍微缩小尺寸 100px -> 85px */}
      <div className="w-[85px] h-[85px] shrink-0 mt-1">
        <img 
          src={data.postCover || '/default-food.jpg'} 
          className="w-full h-full object-cover rounded-xl" 
          alt="cover" 
          onError={(e) => { e.target.src = '/default-food.jpg' }} // 处理图片404
        />
      </div>

      {/* 中间：文字内容区 - 压缩上下 margin (mt-3 改为 mt-2 等) */}
      <div className="flex-1 ml-5 flex flex-col justify-start">
        <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{data.postTitle}</h3>
        
        <p className="text-[12px] text-gray-400 mt-1 line-clamp-1">{data.postDescription}</p>
        
        <p className="text-[14px] text-gray-700 mt-2 font-medium leading-snug">{data.content}</p>
        
        {/* 底部按钮组 */}
        <div className="flex items-center gap-5 text-[12px] text-gray-400 mt-3">
          <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400">
            <span className="text-[14px]">👍</span> 26
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400">
            <span className="text-[14px]">💬</span> 回复
          </div>
        </div>
      </div>

      {/* 右侧：原帖引用区与日期 - 压缩内边距和字号 */}
      <div className="w-[180px] ml-4 flex flex-col justify-between items-end">
        
        {/* 灰色背景卡片 - p-3 改为 p-2.5，移除 mt-6，使用较小的字号 */}
        <div className="w-full bg-gray-50 p-2.5 rounded-xl mt-3">
          <div className="text-[10px] text-gray-400 mb-1 leading-none font-bold">原帖内容</div>
          <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-1.5">
            {data.postDescription}
          </div>
          <div className="text-[11px] text-[#A68A80] cursor-pointer font-medium hover:underline">
            查看原帖 &gt;
          </div>
        </div>

        {/* 日期对齐到最右下角 */}
        <div className="text-[12px] text-gray-300 mt-2 pr-1">
          {dateStr}
        </div>
      </div>

    </div>
    )
}

export default CommentCard;