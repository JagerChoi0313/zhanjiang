"use client"
import {useState,useEffect} from 'react'
import CommentCard from "./CommentCard/page"
import Pagination from './Pagination/page'

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
 // 1. 去掉固定高度限制，让内容自然排列
    <div className="flex-1 bg-[#F9F9F9] p-6 pb-10">
        
        {/* 2. 压缩标题下方的 margin (mb-7 -> mb-4) */}
        <h1 className="text-[20px] font-bold text-gray-900 mb-4">我的评论</h1>

        {/* 3. 压缩列表间距 (gap-4 -> gap-2) */}
        <div className="flex flex-col gap-2.5"> 
            {commentList.map((item) => (
                <CommentCard key={item.commentId} data={item} />
            ))}
        </div>

        {/* 4. 分页组件：稍微调小 mt */}
        {totalPages > 1 && (
            <div className="flex justify-center mt-5 py-2 select-none">
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                />
            </div>
        )}
    </div>
    )
}

export default MyComments;