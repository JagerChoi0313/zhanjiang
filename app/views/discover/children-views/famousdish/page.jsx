const FamousDish=()=>{
    return(
        <div style={{ position: 'relative', width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* 1. 底图：可以是 <img> 或 直接嵌入的 <svg> */}
      <img src="/Image/Map.png" style={{ width: '400px',marginTop: '100px',zIndex: 1}} alt="湛江地图" />

      {/* 2. 锚点与连线：通过绝对定位覆盖在地图上 */}
      <div style={{ position: 'absolute', top: '45%', left: '52%', zIndex: 2 }}>
        {/* 圆点 */}
        <div style={{}}></div>
        {/* 连线：可以使用简单的 div 边框或者 SVG line */}
        <div style={{
          
        }}></div>
      </div>

      {/* 3. 卡片：放在连线的另一端 */}
      <div style={{ position: 'absolute', top: '35%', left: '70%' }}>
       
      </div>

    </div>
    )
}

export default FamousDish