"use client"
import DishCard from './DishCard'

const pageStyles = {
    wrapper: {
      backgroundColor: '#F2EFED',
      minHeight: '100vh',
      padding: '40px 4% 80px 4%', // 减少顶部整体padding，通过header细调
    },
    header: {
      textAlign: 'center',
      // --- 关键修改：增加顶部间距 ---
      paddingTop: '80px', // 这个值可以根据你的感觉微调，80px 到 120px 比较合适
      marginBottom: '80px', // 保持和下方卡片的距离
    },
    title: {
      fontSize: '36px',
      fontWeight: '500',
      letterSpacing: '6px',
      color: '#2A2A2A',
      marginBottom: '10px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#888',
      letterSpacing: '2px',
      textTransform: 'uppercase',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)', // 6列紧凑布局
      gap: '24px',
      maxWidth: '1600px',
      margin: '0 auto',
    }
  };

const TasteCard=()=>{

    const ingredients = [
    { id: '01', name: '官渡生蚝', enName: 'Oyster', desc: '嫩滑鲜甜，碳烤绝佳。', bgColor: '#A8A196' },
    { id: '02', name: '徐闻菠萝', enName: 'Pineapple', desc: '口感清脆，独特美味。', bgColor: '#F5E6CC' },
    { id: '03', name: '湛江沙虫', enName: 'Sand Worm', desc: '脆嫩鲜美，名扬天下。', bgColor: '#D9D1C5' },
    { id: '04', name: '白切鸡', enName: 'White Cut Chicken', desc: '皮脆肉嫩，原汁原味。', bgColor: '#EAE7E2' },
    { id: '05', name: '本地海鲜', enName: 'Local Seafood', desc: '鲜美无比，大海馈赠。', bgColor: '#B8CBD0' },
    { id: '06', name: '雷州番薯', enName: 'Sweet Potato', desc: '甜糯可口，回味无穷。', bgColor: '#7D634B' },
    { id: '07', name: '廉江红橙', enName: 'Red Orange', desc: '汁多味浓，果香诱人。', bgColor: '#E9C6B0' },
    { id: '08', name: '霞山鱼丸', enName: 'Fish Ball', desc: '弹牙入味，鲜而不腻。', bgColor: '#D4D6D1' },
    { id: '09', name: '湛江泥丁', enName: 'Sea Slug', desc: '口感独特，鲜灵爽口。', bgColor: '#E2DACE' },
    { id: '10', name: '坡头大闸蟹', enName: 'Hairy Crab', desc: '黄满膏肥，季节限定。', bgColor: '#C5B199' },
    { id: '11', name: '湛江烧鹅', enName: 'Roasted Goose', desc: '皮脆肉香，油脂丰盈。', bgColor: '#D9C5B2' },
    { id: '12', name: '湛江虾饼', enName: 'Shrimp Cake', desc: '香脆鲜甜，街头至味。', bgColor: '#E6CCB2' },
  ];

   

    return(
        <div style={pageStyles.wrapper}>
             <header style={pageStyles.header}>
                <h1 style={pageStyles.title}>味觉卡片:湛江食材百科</h1>
                <p style={pageStyles.subtitle}>The Encyclopedia of Zhanjiang Ingredients</p>
             </header>

             <main style={pageStyles.grid}>
                {ingredients.map((item)=>(
                  <DishCard key={item.id} data={item} />
                ))
                }
             </main>
        </div>
    )
}

export default TasteCard