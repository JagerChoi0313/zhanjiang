"use client"
import {Suspense, useState,useEffect} from 'react'
import CommentCard from "./components/CommentCard"
import Pagination from './components/Pagination'
import CommentFilter from './components/CommentFilter'
import Link from 'next/link'
import {useRef} from 'react'    //引入useRef记录上一次的搜索词
import {useSearchParams} from 'next/navigation' //引入路由参数工具

const MyCommentsContent=()=>{

    //获得URL里的q参数
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get('q') || ''

    const [loading,setLoading] = useState(true);
    const [commentList,setCommentList] = useState([]);

    //分页相关的状态
    const [currentPage,setCurrentPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);

    const [isAuthorized,setIsAuthorized] = useState(true)

    //记录上一次的搜索词，防止分页错乱
    const prevSearchQuery = useRef(searchQuery)


    const fetchCommentData = async (page,query) => {
        setLoading(true); // 每次翻页切换显示加载中
        try {
            // 拼装 url
            const url = query 
                ? `/API/MyComments?page=${page}&q=${encodeURIComponent(query)}`
                : `/API/MyComments?page=${page}`;

            // ✅ 必须用 url 变量！并加上防缓存！
            const response = await fetch(url, { cache: 'no-store' });
            const result = await response.json();

            //拦截
            if(response.status === 401 || (!result.success && result.message.includes('登录'))){
                setIsAuthorized(false)
                return;//直接打断，不再往下执行渲染列表
            }

            if (result.success) {
                setIsAuthorized(true)   //确认身份合法
                setCommentList(result.data);
                // 确保后端返回的是 pagination.totalPages
                setTotalPages(result.meta?.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error("Failed to fetch Comment:", error)
        } finally {
            setLoading(false);
        }
    }

    // 核心分页与搜索联动逻辑
    //依赖项加上CurrentPage，当页码改变时重新获取数据
    useEffect(()=>{
        let targetPage = currentPage;
        
        // 如果侦测到这是“全新的一次搜索”，强制跳回第 1 页
        if (prevSearchQuery.current !== searchQuery) {
            targetPage = 1;
            prevSearchQuery.current = searchQuery;
            setCurrentPage(1); // 同步更新下方分页器组件
        }

        fetchCommentData(targetPage, searchQuery);
    }, [currentPage, searchQuery]); // 依赖项加上 searchQuery
    
    if (loading) return <div className="p-5 text-gray-400 text-center">加载中...</div>;

    //未登录情况
    if (!isAuthorized) {
        return (
            <div className="flex-1 bg-[#F9F9F9] flex flex-col justify-center items-center py-6 px-10 h-full">
                <div className="bg-white p-12 rounded-3xl flex flex-col items-center max-w-md w-full shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex justify-center items-center mb-6 text-gray-300">
                        {/* 这里换成了一个极简的“对话气泡” SVG 图标，呼应“评论”主题 */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 mb-2">需要验证身份</h2>
                    <p className="text-gray-500 text-sm mb-8 text-center">登录后即可查看并管理你在美食社区留下的评论</p>
                    <Link 
                        href="/views/Login" 
                        className="w-full text-center py-3 bg-[#a63d2d] text-white rounded-xl font-medium active:scale-95 transition-transform hover:bg-[#8e3326]"
                    >
                        前往登录
                    </Link>
                </div>
            </div>
        );
    }


    return(
    <div className="flex-1 bg-[#F9F9F9] p-6 lg:px-7 lg:py-6 flex flex-col h-full overflow-hidden">
        <h1 className="text-[19px] font-bold text-gray-900 mb-4 shrink-0">我的评论</h1>

        <CommentFilter />

        {/* 👇 增加了如果没有搜到数据的防守状态提示 */}
        <div className="flex flex-col gap-3 shrink-0"> 
            {commentList.length > 0 ? (
                commentList.slice(0, 4).map((item) => (
                    <Link
                     href={`/views/PostDetail/${item.postId}`}
                     key={item.commentId}
                     className="block no-underline text-inherit active:scale-[0.99] transition-transform"
                    >
                     <CommentCard data={item} />
                    </Link>
                ))
            ) : (
                <div className="flex justify-center items-center h-32 text-gray-400 text-[14px]">
                    {searchQuery ? `未找到与“${searchQuery}”相关的评论或帖子` : "暂无评论内容"}
                </div>
            )}
        </div>

        {totalPages > 1 && commentList.length > 0 && (
            <div className="flex justify-center mt-auto py-4 select-none shrink-0">
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => {
                        setCurrentPage(page);
                    }} 
                />
            </div>
        )}
    </div>
    )
}

const MyComments=()=>(
    <Suspense fallback={<div className="p-5 text-gray-400 text-center">加载中...</div>}>
        <MyCommentsContent />
    </Suspense>
)

export default MyComments;
