"use client"
import Image from 'next/image'

const styles = {
    cardBase: {
      borderRadius: '24px',
      padding: '20px',
      height: '320px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
      border: '1px solid rgba(0,0,0,0.05)',
    },
    idNumber: {
      fontSize: '24px',
      fontFamily: '"Times New Roman", serif',
      fontWeight: 'bold',
      color: 'rgba(0,0,0,0.2)',
      lineHeight: '1',
      marginBottom: '10px',
    },
    imageWrapper: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
    },
    image: {
      maxWidth: '90%',
      maxHeight: '90%',
      objectFit: 'contain',
      filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.12))',
    },
    content: {
      marginTop: 'auto',
    },
    titleGroup: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '6px',
      marginBottom: '4px',
    },
    name: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#333',
    },
    enName: {
      fontSize: '12px',
      color: 'rgba(0,0,0,0.4)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    description: {
      fontSize: '12px',
      color: 'rgba(0,0,0,0.5)',
      lineHeight: '1.4',
    }
};

const DishCard =({ data = {
    id: '01',
    name: '食材名称',
    enName: 'Ingredient',
    desc: '这里是关于食材的简短描述。',
    bgColor: '#EAE7E2'
    }})=>{

    //如果没有传入数据，先返回空值或者加载状态，防止报错
    if(!data) return null;

    return(
        <div 
        // 2. 关键点：使用 ES6 的解构赋值，把外面通用的样式和里面动态的背景色合并
        style={{ 
          ...styles.cardBase, 
          backgroundColor: data.bgColor || '#EAE7E2' 
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px)';
          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={styles.idNumber}>{data.id}.</div>
        
        <div style={{ ...styles.imageWrapper, position: 'relative' }}>
        <Image 
          src={`/images/food/${data.id}.png`} 
          alt={data.name}
          // 解决方案：使用 fill 模式
          fill 
          // 保持图片不被拉伸，并位于正中央
          style={{ objectFit: 'contain' }} 
          // 可选：告诉 Next.js 这是一张需要优先加载的封面图
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

        <div style={styles.content}>
          <div style={styles.titleGroup}>
            <span style={styles.name}>{data.name}</span>
            <span style={styles.enName}>{data.enName}</span>
          </div>
          <div style={styles.description}>{data.desc}</div>
        </div>
      </div>
    )
}

export default DishCard;