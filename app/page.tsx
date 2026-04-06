"use client"
//Page 是“照片”：当你点击“经典名菜”或“街头小吃”时，
// 只有 children 这一块地方在换“照片”，外面的“相框”（NavBar）稳如泰山

import MainPage from "./views/discover/children-views/mainPage/page"

const Home=()=>{
  return(
    <main>
      <MainPage/>
    </main>
  )
}

export default Home