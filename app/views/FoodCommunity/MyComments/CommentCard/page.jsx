const CommentCard=({data})=>{

    const dateStr = data.createAt 
    ? new Date(data.createAt).toLocaleDateString().replace(/\//g, '-') 
    : '2026-04-28';
    return(
// 1. 进一步缩小 padding (p-4 -> p-3)，移除不必要的 items-start 强制对齐
    <div className="relative flex p-3 lg:p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm items-center">
      
      {/* 2. 缩小图片尺寸 (85px -> 75px) */}
      <div className="w-[75px] h-[75px] shrink-0">
        <img 
          src={data.postCover || '/default-food.jpg'} 
          className="w-full h-full object-cover rounded-lg" 
          alt="cover" 
          onError={(e) => { e.target.src = '/default-food.jpg' }} 
        />
      </div>

      {/* 3. 中间内容区：压缩文字间距 */}
      <div className="flex-1 ml-4 flex flex-col justify-center">
        <h3 className="text-[14px] font-bold text-gray-900 leading-tight line-clamp-1">{data.postTitle}</h3>
        
        {/* 这里让描述只占一行 */}
        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{data.postDescription}</p>
        
        {/* 评论内容限制为 1 行或 2 行，防止撑开卡片 */}
        <p className="text-[13px] text-gray-700 mt-1.5 font-medium leading-snug line-clamp-1">{data.content}</p>
        
        {/* 底部按钮缩小 mt */}
        <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2">
          <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400">
            <span className="text-[12px]">👍</span> 26
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-orange-400">
            <span className="text-[12px]">💬</span> 回复
          </div>
        </div>
      </div>

      {/* 4. 右侧原帖区：变窄一点并压缩内部 padding */}
      <div className="w-[160px] ml-4 flex flex-col justify-between items-end">
        {/* 三个点移动到这里 */}
        <div className="flex gap-[2px] cursor-pointer p-1 mb-1">
          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
        </div>

        <div className="w-full bg-gray-50/50 p-2 rounded-lg">
          <div className="text-[9px] text-gray-400 mb-0.5 font-bold">原帖内容</div>
          <div className="text-[11px] text-gray-500 line-clamp-1 leading-tight mb-1">
            {data.postDescription}
          </div>
          <div className="text-[11px] text-[#A68A80] cursor-pointer font-medium">查看原帖 &gt;</div>
        </div>

        <div className="text-[11px] text-gray-300 mt-1">
          {dateStr}
        </div>
      </div>
    </div>
    )
}

export default CommentCard;