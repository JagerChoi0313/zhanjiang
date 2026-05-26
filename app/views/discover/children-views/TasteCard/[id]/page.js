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
    <div style={{ minHeight: '100vh', background: '#fcfaf7', padding: '118px 0 64px', color: '#201814', fontFamily: 'Arial, "Microsoft YaHei", sans-serif' }}>
      <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 48px' }}>

        {/* 返回按钮 */}
        <Link
          href="/views/discover/children-views/TasteCard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, color: '#a13a24', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>&lt;</span>
          <span>返回味觉卡片</span>
        </Link>

        {/* 核心视觉区大卡片 */}
        <section style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 16, border: '1px solid #eee6df', boxShadow: '0 18px 55px rgba(80,54,34,0.07)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '400px minmax(0, 1fr) 380px', gap: 48, alignItems: 'center' }}>
            {/* 左侧图片 */}
            <div style={{ position: 'relative', height: 320, borderRadius: 12, overflow: 'hidden', background: '#f2ebe4' }}>
              <Image
                src={food.imagePath || `/Image/food/${food.id}.png`}
                alt={food.name}
                fill
                sizes="(max-width: 1024px) 100vw, 430px"
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* 右侧主信息 */}
            <div style={{ minWidth: 0 }}>
              {/* 标题与标语区 */}
              <div>
                <span style={{ display: 'block', color: '#d8c9bb', fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 12 }}>
                  {food.id}.
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', columnGap: 20, rowGap: 8, marginBottom: 12 }}>
                  <h1 style={{ margin: 0, color: '#211814', fontSize: 46, fontWeight: 800, lineHeight: 1.12, letterSpacing: 0 }}>
                    {food.name}
                  </h1>
                  <p style={{ margin: '0 0 7px', color: '#7d7774', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0 }}>
                    {food.enName}
                  </p>
                </div>
                <p style={{ margin: '0 0 24px', color: '#4d4742', fontSize: 16, lineHeight: 1.75 }}>
                  {food.desc}
                </p>

                {/* 标签 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{ padding: '7px 16px', background: '#eadfd5', borderRadius: 999, color: '#6b5848', fontSize: 13, fontWeight: 600 }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 简介长文案 */}
              <p style={{ margin: 0, paddingTop: 20, borderTop: '1px solid #eadfd5', color: '#302824', fontSize: 15, lineHeight: 1.85 }}>
                {food.desc}
              </p>
            </div>

            {/* 右侧概览表格 */}
            <div style={{ background: '#fbf6f1', borderRadius: 14, padding: '26px 30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 24, padding: '16px 0', borderBottom: '1px solid #e5d8cb', fontSize: 15 }}>
                <span style={{ color: '#6f6863' }}>主要产地</span>
                <span style={{ color: '#241b16', fontWeight: 700, lineHeight: 1.7 }}>{food.origin || '暂无信息'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 24, padding: '16px 0', borderBottom: '1px solid #e5d8cb', fontSize: 15 }}>
                <span style={{ color: '#6f6863' }}>最佳时节</span>
                <span style={{ color: '#241b16', fontWeight: 700, lineHeight: 1.7 }}>{food.season || '暂无信息'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 24, padding: '16px 0', borderBottom: '1px solid #e5d8cb', fontSize: 15 }}>
                <span style={{ color: '#6f6863' }}>主要做法</span>
                <span style={{ color: '#241b16', fontWeight: 700, lineHeight: 1.7 }}>{food.mainMethods || '暂无信息'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 24, padding: '16px 0', fontSize: 15 }}>
                <span style={{ color: '#6f6863' }}>口味特点</span>
                <span style={{ color: '#241b16', fontWeight: 700, lineHeight: 1.7 }}>{food.tasteProfile || '暂无信息'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 深度科普区 Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: 20, marginBottom: 24 }}>
          {/* 食材特色 */}
          <div style={{ minHeight: 225, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff', borderRadius: 12, border: '1px solid #eee6df', boxShadow: '0 14px 40px rgba(80,54,34,0.05)', padding: 28 }}>
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#201814', fontSize: 20, fontWeight: 800 }}>食材特色</h3>
              <p style={{ margin: '0 0 32px', color: '#3f3732', fontSize: 15, lineHeight: 1.85 }}>{features.text}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 12, color: '#241b16', fontSize: 15, fontWeight: 700 }}>
              {features.keywords.map((kw) => (
                <span key={kw} style={{ padding: '0 24px 0 0', marginRight: 24, borderRight: '1px solid #d9c9ba' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* 营养价值 */}
          <div style={{ minHeight: 225, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff', borderRadius: 12, border: '1px solid #eee6df', boxShadow: '0 14px 40px rgba(80,54,34,0.05)', padding: 28 }}>
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#201814', fontSize: 20, fontWeight: 800 }}>营养价值</h3>
              <p style={{ margin: '0 0 32px', color: '#3f3732', fontSize: 15, lineHeight: 1.85 }}>{nutrition.text}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 12, color: '#241b16', fontSize: 15, fontWeight: 700 }}>
              {nutrition.keywords.map((kw) => (
                <span key={kw} style={{ padding: '0 24px 0 0', marginRight: 24, borderRight: '1px solid #d9c9ba' }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* 饮食文化 */}
          <div style={{ minHeight: 225, background: '#fff', borderRadius: 12, border: '1px solid #eee6df', boxShadow: '0 14px 40px rgba(80,54,34,0.05)', padding: 28 }}>
            <h3 style={{ margin: '0 0 20px', color: '#201814', fontSize: 20, fontWeight: 800 }}>饮食文化</h3>
            {culture.text && (
              <p style={{ margin: '0 0 20px', color: '#3f3732', fontSize: 15, lineHeight: 1.85 }}>{culture.text}</p>
            )}
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 28, rowGap: 12, margin: 0, padding: 0, color: '#403732', fontSize: 14, listStyle: 'none' }}>
              {culture.list.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a33722', flexShrink: 0, marginTop: 9 }}></span>
                  <span style={{ lineHeight: 1.7 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 常见做法列表 */}
        <section style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee6df', boxShadow: '0 14px 45px rgba(80,54,34,0.05)', padding: 28 }}>
          <h3 style={{ margin: '0 0 26px', color: '#201814', fontSize: 20, fontWeight: 800 }}>常见做法</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {recipes.map((recipe, idx) => (
              <div key={recipe.name} style={{ padding: '0 40px', borderRight: idx === recipes.length - 1 ? 'none' : '1px solid #e1d3c6' }}>
                <h4 style={{ margin: '0 0 12px', color: '#201814', fontSize: 16, fontWeight: 800 }}>{recipe.name}</h4>
                <p style={{ margin: 0, color: '#4a413b', fontSize: 14, lineHeight: 1.8 }}>{recipe.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
