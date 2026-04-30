"use client"
import {useState,useEffect} from 'react'
import CommentCard from "./CommentCard/page"
import Pagination from './Pagination/page'
import CommentFilter from './CommentFilter/page'

const MyComments=()=>{

    const [loading,setLoading] = useState(true);
    const [commentList,setCommentList] = useState([]);

    //分页相关的状态
    const [currentPage,setCurrentPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);



    const fetchCommentData = async (page) => {
        setLoading(true); // 每次翻页切换显示加载中
        try {
            // 严格匹配你后端的路由和参数名
            const response = await fetch(`/API/MyComments?page=${page}`);
            const result = await response.json();

            if (result.success) {
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