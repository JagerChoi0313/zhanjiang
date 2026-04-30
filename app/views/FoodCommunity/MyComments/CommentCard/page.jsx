const CommentCard=({data})=>{

    const dateStr = data.createAt 
    ? new Date(data.createAt).toLocaleDateString().replace(/\//g, '-') 
    : '2026-04-28';
    return(
 // 关键修正：p-4 降为 p-3.5，稍微减少圆角，确保 4 张卡片高度不超标
    <div className="flex p-3.5 bg-white rounded-[16px] border border-gray-50 shadow-sm items-stretch">
      
      {/* 1. 图片尺寸：从 90 降到 82，这是节省垂直空间的关键 */}
      <div className="w-[82px] h-[82px] shrink-0">
        <img 
          src={data.postCover || '/default-food.jpg'} 
          className="w-full h-full object-cover rounded-[10px]" 
          alt="cover" 
          onError={(e) => { e.target.src = '/default-food.jpg' }}  
        />
      </div>

      {/* 2. 中间内容区 */}
      <div className="flex-1 ml-4 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="text-[14px] font-bold text-gray-800 leading-tight line-clamp-1">
            <span className="font-normal text-gray-400">评论了：</span>{data.postTitle}
          </h3>
          {/* 这里的 mt-1 稍微收紧 */}
          <p className="text-[13px] text-gray-600 mt-1 font-medium leading-normal line-clamp-2">
            {data.content}
          </p>
        </div>
        
        {/* 底部：互动数据与日期 */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[13px]">👍</span> 26
            </div>
            <div className="w-[1px] h-[10px] bg-gray-100"></div>
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[13px]">💬</span> 回复
            </div>
          </div>
          <div className="text-[11px] text-gray-300 pr-2">
            {dateStr}
          </div>
        </div>
      </div>

      {/* 3. 右侧：原帖引用卡片 (压缩宽度和间距) */}
      <div className="w-[210px] ml-1 flex flex-col justify-between items-end shrink-0">
        <div className="flex gap-[3px] cursor-pointer p-0.5 opacity-40">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>

        {/* 原帖卡片高度收紧：p-3 降为 p-2.5 */}
        <div className="w-full bg-[#FCF9F8] p-2.5 rounded-xl">
          <div className="text-[10px] text-[#B8988C] mb-0.5 font-bold">原帖内容</div>
          <div className="text-[11px] text-gray-500 line-clamp-2 leading-snug mb-1">
            {data.postDescription}
          </div>
          <div className="text-[11px] text-[#C49B8A] cursor-pointer font-medium">
            查看原帖 &gt;
          </div>
        </div>
      </div>
    </div>
    )
}

export default CommentCard;

//原来面试最大的问题是实习时间