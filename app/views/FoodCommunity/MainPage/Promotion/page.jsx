const Promotion =()=>{
    return(
<div className="relative overflow-hidden rounded-[24px] bg-[#FDF8F4] p-6 border border-orange-100/50 shadow-sm">
      {/* 右侧装饰美食图片 - 模拟设计稿的破框效果 */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 select-none pointer-events-none">
        <div 
          className="w-full h-full rounded-full bg-cover bg-center border-[6px] border-white shadow-xl"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200&auto=format&fit=crop')" 
          }}
        />
      </div>

      {/* 内容主体 */}
      <div className="relative z-10">
        <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">
          分享你的美食故事
        </h3>
        <p className="mt-1 text-[13px] text-gray-500 font-normal">
          记录生活中的美味时刻
        </p>
        
        <button 
          className="mt-5 px-5 py-2.5 bg-[#8B5742] hover:bg-[#734735] text-white text-[13px] font-medium rounded-full transition-all duration-300 shadow-sm active:scale-95"
          onClick={() => console.log('跳转至投稿页')}
        >
          立即投稿
        </button>
      </div>
    </div>
    )
}

export default Promotion