"use client"
import DishCard from './DishCard'
import {useState,useEffect} from 'react'

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

   //1.使用useState管理从后端获取的食材
   const [ingredients,setIngredients] = useState([]);
   const [loading,setLoading]=useState(true);
   
   //2.使用useEffect在组件加载时请求后端API
  useEffect(() => {
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      // 1. 建议统一使用小写 api 路径
      const response = await fetch('/API/TasteCard'); 
      
      // 2. 先解析 JSON
      const result = await response.json(); 
      
      // 3. 检查 result 里的 success 状态
      if (result.success) {
          setIngredients(result.data || []); 
      } else {
          // 这里 result.message 才有值
          console.error("后端业务报错：", result.message);
      }
    } catch (error) {
       // 修正之前 image_4e2bbb 里的 ReferenceError
       console.error("网络请求失败：", error); 
    } finally {
      setLoading(false);
    }
  }
  fetchIngredients();
}, []);
   

    return(
        <div style={pageStyles.wrapper}>
            <header style={pageStyles.header}>
                <h1 style={pageStyles.title}>味觉卡片:湛江食材百科</h1>
                <p style={pageStyles.subtitle}>The Encyclopedia of Zhanjiang Ingredients</p>
            </header>

            <main style={pageStyles.grid}>
                {loading ? (
                    // 这里可以放一个简单的加载占位，或者留空
                    <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#999' }}>加载百科中...</p>
                ) : (
                    ingredients.map((item) => (
                        <DishCard key={item.id} data={item} />
                    ))
                )}
                
                {!loading && ingredients.length === 0 && (
                    <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>数据库里还没有食材数据记录</p>
                )}
            </main>
        </div>
    )
}

export default TasteCard