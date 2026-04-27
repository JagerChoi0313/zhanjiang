//layout相当于一个相框，他在整个app运行期间只加载一次。当你点击跳转时，layout里面的NavBar不会消失
//也不会重新加载。这就是为什么高亮动画能丝滑渡过的原因

"use client"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./views/discover/c-cpns/nav-bar";
import {usePathname} from "next/navigation"   //引入路径钩子


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Zhanjiang Food",
//   description: "探索地道湛江风味",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();

  //判断当前路径是否包含FoodCommunity
  //如果是论坛页面，我们就不渲染那个NavBar
  const isForumPage = pathname.includes("FoodCommunity")


  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*逻辑判断：只有不是论坛页时，才显示主页导航栏 */}
        {!isForumPage && <NavBar/>}

        {/*使用main标签包裹children，并给他一个上边距，防止被固定的导航栏遮住 */}
        <main className="flex-1 p">
          {children}
        </main>
        </body>
    </html>
  );
}
