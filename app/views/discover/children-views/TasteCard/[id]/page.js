import { db } from "../../../../../../database/index";
import { TasteCardTable } from "../../../../../../database/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

// 辅助函数：安全解析数据库里取出来的 JSON 字符串
const parseJSON = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch (e) { return fallback; }
  }
  return data;
};

export default async function FoodDetail({ params }) {
  const { id } = await params;

  // 1. 真实且动态的数据库查询
  const [food] = await db.select().from(TasteCardTable).where(eq(TasteCardTable.id, id));

  if (!food) {
    return (
      <div className="bg-[#FBFBFD] min-h-screen pt-[120px] pb-[100px] text-[#1D1D1F] font-sans flex justify-center">
        <div className="pt-[200px] text-[#86868B] tracking-widest text-lg">未找到该美食档案</div>
      </div>
    );
  }

  // 2. 动态解析真实数据
  const tags = parseJSON(food.tags, []);
  const features = parseJSON(food.features, { text: '', keywords: [] });
  const nutrition = parseJSON(food.nutrition, { text: '', keywords: [] });
  const culture = parseJSON(food.culture, { text: '', list: [] });
  const recipes = parseJSON(food.recipes, []);

  return (
    <div className="bg-[#FBFBFD] min-h-screen pt-[120px] pb-[100px] text-[#1D1D1F] font-sans">
      <div className="max-w-[1200px] mx-auto px-8">
        
        {/* 返回按钮 */}
        <Link 
          href="/views/discover/children-views/TasteCard" 
          className="inline-flex items-center gap-2 mb-12 text-[15px] text-[#86868B] font-medium tracking-wide hover:text-black transition-colors"
        >
           <Image src="/Image/left_arrow_gray.png" alt="arrow" width={16} height={16} /> 返回味觉卡片
        </Link>

        {/* 核心视觉区大卡片 */}
        <section className="bg-white rounded-[32px] p-[60px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row gap-[60px] mb-[60px]">
          {/* 左侧图片 */}
          <div className="flex-[1.4] rounded-[24px] overflow-hidden relative h-[480px]">
            <Image 
              src={food.imagePath} 
              alt={food.name} 
              fill 
              sizes="(max-width: 1200px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* 右侧主信息 */}
          <div className="flex-[2.6] flex flex-col">
            <div className="flex flex-col xl:flex-row justify-between items-start mb-8 gap-10">
              
              {/* 标题与标语区 */}
              <div className="flex-1">
                  <span className="text-[28px] text-[#D2D2D7] font-bold">{food.id}.</span>
                  <h1 className="text-[64px] font-bold tracking-wide mt-2 mb-1 leading-tight">{food.name}</h1>
                  <p className="text-[22px] text-[#D2D2D7] uppercase tracking-[4px] mb-5">{food.enName}</p>
                  
                  {/* 标签 */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="px-5 py-2 bg-[#F2F2F7] rounded-full text-[13px] text-[#1D1D1F] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
              </div>

              {/* 右侧概览表格 */}
              <div className="w-full xl:w-[320px] xl:pl-10 shrink-0">
                  <div className="grid grid-cols-[100px_1fr] py-4 border-b border-[#E5E5EA] text-[15px]">
                    <span className="text-[#86868B]">主要产地</span>
                    <span className="text-[#1D1D1F] font-medium leading-relaxed">{food.origin || '暂无信息'}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] py-4 border-b border-[#E5E5EA] text-[15px]">
                    <span className="text-[#86868B]">最佳时节</span>
                    <span className="text-[#1D1D1F] font-medium leading-relaxed">{food.season || '暂无信息'}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] py-4 border-b border-[#E5E5EA] text-[15px]">
                    <span className="text-[#86868B]">主要做法</span>
                    <span className="text-[#1D1D1F] font-medium leading-relaxed">{food.mainMethods || '暂无信息'}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] py-4 text-[15px]">
                    <span className="text-[#86868B]">口味特点</span>
                    <span className="text-[#1D1D1F] font-medium leading-relaxed">{food.tasteProfile || '暂无信息'}</span>
                  </div>
              </div>
            </div>

            {/* 简介长文案 */}
            <p className="text-[17px] leading-[1.8] text-[#555] mt-5 border-t border-[#E5E5EA] pt-8">
              {food.desc}
            </p>
          </div>
        </section>

        {/* 深度科普区 Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-[60px]">
            {/* 食材特色 */}
            <div className="bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold mb-6 text-[#1D1D1F]">食材特色</h3>
                    <p className="text-[15px] leading-[1.7] text-[#555] mb-6 grow">{features.text}</p>
                </div>
                <div className="border-t border-[#E5E5EA] pt-5 flex flex-wrap gap-2.5">
                    {features.keywords.map(kw => (
                      <span key={kw} className="px-4 py-1.5 border border-[#E5E5EA] rounded-md text-[13px] text-[#1D1D1F] font-medium">
                        {kw}
                      </span>
                    ))}
                </div>
            </div>

            {/* 营养价值 */}
            <div className="bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-semibold mb-6 text-[#1D1D1F]">营养价值</h3>
                    <p className="text-[15px] leading-[1.7] text-[#555] mb-6 grow">{nutrition.text}</p>
                </div>
                <div className="border-t border-[#E5E5EA] pt-5 flex flex-wrap gap-2.5">
                    {nutrition.keywords.map(kw => (
                      <span key={kw} className="px-4 py-1.5 border border-[#E5E5EA] rounded-md text-[13px] text-[#1D1D1F] font-medium">
                        {kw}
                      </span>
                    ))}
                </div>
            </div>

            {/* 饮食文化 */}
            <div className="bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col">
                <h3 className="text-lg font-semibold mb-6 text-[#1D1D1F]">饮食文化</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 text-sm text-[#333] font-medium p-0 m-0">
                    {culture.list.map(item => (
                        <li key={item} className="flex items-start gap-2 pt-1">
                            <span className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full shrink-0 mt-1.5"></span> 
                            <span className="leading-snug">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        {/* 常见做法列表 */}
        <section className="bg-white rounded-[32px] px-[60px] py-[50px] shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <h3 className="text-2xl font-bold mb-10 text-[#1D1D1F]">常见做法</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-t border-[#E5E5EA] pt-10">
            {recipes.map((recipe) => (
              <div key={recipe.name}>
                <h4 className="text-lg font-semibold mb-3 text-[#1D1D1F]">{recipe.name}</h4>
                <p className="text-sm leading-[1.7] text-[#555]">{recipe.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}