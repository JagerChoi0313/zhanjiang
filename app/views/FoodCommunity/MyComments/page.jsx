"use client"
import {useState,useEffect} from 'react'
import CommentCard from "./CommentCard/page"
import Pagination 

const MyComments=()=>{

    const [loading,setLoading] = useState(true);
    const [commentList,setCommentList] = useState([]);


    useEffect(()=>{
        const fetchComment = async()=>{
            try{
                const response = await fetch("/API/MyComments");
                const result = await response.json();
                if(result.success)
                {
                    setCommentList(result.data)
                }
            }catch(error){
                console.error("Failed to fecth Comments:",error)
            }finally{
                setLoading(false);
            }
        }
        
        fetchComment()
    },[])
    
    if (loading) return <div className="p-5 text-gray-400 text-center">加载中...</div>;

    return(
        <div className="p-6">
      {/* 渲染你的组件列表 */}
      {commentList.map((item) => (
        <CommentCard key={item.commentId} data={item} />
      ))}
    </div>
    )
}

export default MyComments;