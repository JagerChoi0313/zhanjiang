"use client"
import {useState,useEffect} from 'react'
import CommentCard from "./CommentCard/page"
import Pagination from './Pagination/page'
import CommentFilter from './CommentFilter/page'
import Link from 'next/link'

const MyComments=()=>{

    const [loading,setLoading] = useState(true);
    const [commentList,setCommentList] = useState([]);

    //分页相关的状态
    const [currentPage,setCurrentPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);

    const [isAuthorized,setIsAuthorized] = useState(true)

    const fetchCommentData = async (page) => {
        setLoading(true); // 每次翻页切换显示加载中
        try {
            // 严格匹配你后端的路由和参数名
            const response = await fetch(`/API/MyComments?page=${page}`);
            const result = await response.json();

            //拦截
            if(response.status === 401 || (!result.success && result.message.include('登录'))){
                setIsAuthorized(false)
                return;//直接打断，不再往下执行渲染列表
            }

            if (result.success) {
                setIsAuthorized(true)   //确认身份合法
                setCommentList(result.data);
                // 确保后端返回的是 pagination.totalPages
                setTotalPages(result.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error("Failed to fetch Comment:", error)
        } finally {
            setLoading(false);
        }
    }

    //依赖项加上CurrentPage，当页码改变时重新获取数据
    useEffect(()=>{
        fetchCommentData(currentPage)
    },[currentPage]);
    
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
// 去掉 overflow-hidden 产生的奇怪行为，确保一屏显示
    <div className="flex-1 bg-[#F9F9F9] p-6 lg:px-7 lg:py-6 flex flex-col h-full overflow-hidden">
        
        {/* 压缩标题间距 */}
        <h1 className="text-[19px] font-bold text-gray-900 mb-4 shrink-0">我的评论</h1>

        <CommentFilter />

        {/* 关键修正：这里不需要自定义滚动条，gap-3 配合上方卡片的瘦身，刚好放下 4 条 */}
        <div className="flex flex-col gap-3 shrink-0"> 
            {commentList.slice(0, 4).map((item) => (
                <CommentCard key={item.commentId} data={item} />
            ))}
        </div>

        {/* 分页组件：mt-auto 确保它吸在底部，py-4 保持间距 */}
        {totalPages > 1 && (
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

export default MyComments;