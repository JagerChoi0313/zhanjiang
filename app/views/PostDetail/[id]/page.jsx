"use client"
// 以前我们可以直接 params.id 拿到数字，现在不行了，必须先“解包”（unwrap）
// 这个 Promise 才能拿到里面的 id。因为拿不到正确的 id，前端发给后端的请求就乱了，最后就只能显示“帖子不见啦”。
import {use} from 'react'
import React from 'react'
import {useState,useEffect} from 'react'
import {useRouter} from 'next/navigation'

const PostDetail=({params})=>{
    const router = useRouter();

    const resolvedParams=use(params)
    const postId = resolvedParams.id;

    const [post,setPost] = useState(null)
    const [loading,setLoading] = useState(true)
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    //轮播图索引
    const [currentImage,setCurrentImage] = useState(0);

    //管理评论相关状态：
    const [commentContent,setCommentContent] = useState("");//绑定输入框文字
    const [isSubmitting,setIsSubmitting] = useState(false);//防止用户连续疯狂点击按钮

    //管理收藏相关状态
    const [isFavorited,setIsFavorited] = useState(false)    //记录当前的收藏状态
    const [isFavoriteLoading,setIsFavoriteLoading] = useState(false)    //防止疯狂点击按钮

    //假设当前操作的用户ID为20260001（后续接入真实JWT的状态）
    const CURRENT_USER_ID = 20260001;

    //抽取fetchPost为单独函数，方便后续发表评论后重新拉取数据刷新页面
    const fetchPost = async()=>{
        try{
            const res = await fetch(`/API/PostDetail/${postId}`)
            const data = await res.json();
            if(data.success){
                setPost(data.data)
            }
        }catch(error){
            console.error("获取帖子失败",error)
        }finally{
            setLoading(false)
        }
    }

    //获取真实数据
    useEffect(()=>{
        fetchPost()
    },[postId])

    //处理点击收藏，取消收藏的逻辑
    const handleFavorite = async()=>{
        setIsFavoriteLoading(true);
        try{
            //访问收藏专属API
            const res = await fetch(`/API/MyFavorites`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    postId:postId,
                    userId:CURRENT_USER_ID
                })
            })
            
            const data = await res.json();

            if(data.success){
                //切换前端按钮收藏状态：
                setIsFavorited(data.isFavorited);
            }else{
                alert(data.message)
            }
        }catch(error){
            console.error("收藏请求失败：",error)
        }finally{
            setIsFavoriteLoading(false)
        }
    }

    //提交评论的核心逻辑
    const handleCommentSubmit = async()=>{
        if(!commentContent.trim()){
            alert("写点什么再评论吧")
            return;
        }

    setIsSubmitting(true)

    try{
        const res = await fetch(`/API/PostDetail/${postId}`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                content:commentContent,
                userId:CURRENT_USER_ID
            })
        })

       const data = await res.json();
       if(data.success){
        //清空输入框
        setCommentContent("")

        //重新提取一次数据，让新评论再次显示在下方
        await fetchPost();
       }else{
        alert(data.message || "评论失败")
       }
        
    }catch(error){
        console.error("提交评论错误：",error);
        alert("网络错误，请稍后重试")
    }finally{
        setIsSubmitting(false)
     }
        };
    if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div>;
    if (!post) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>帖子不见啦</div>;
    
   // 1. 安全解析图片数组（兼容早期未正确 JSON 序列化的脏数据）
    let imagesArray = [];
    try {
        if (post.images) {
            if (typeof post.images === 'string' && post.images.startsWith('[')) {
                imagesArray = JSON.parse(post.images);
            } else if (typeof post.images === 'string') {
                // 兼容早期直接存入的纯路径文本
                imagesArray = [post.images]; 
            } else if (Array.isArray(post.images)) {
                imagesArray = post.images;
            }
        }
    } catch (error) {
        console.error("图片数据解析失败", error);
    }

    // 2. 修复时间格式化的拼写错误 (加上空格，修正方法名)
   const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    // 轮播图切换逻辑
    const nextImg = () => setCurrentImgIndex(prev => (prev + 1) % imagesArray.length);
    const prevImg = () => setCurrentImgIndex(prev => (prev - 1 + imagesArray.length) % imagesArray.length);

    //获取评论列表数组（做个容错，如果后端没查到就是个空数组）
    const CommentsList = post.comments && Array.isArray(post.comments)?post.comments : [];

    return(
        <div style={{ minHeight: '100vh', background: '#ffffff', color: '#111827', paddingBottom: 80, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
                <button onClick={() => router.back()} style={{ border: 0, background: 'transparent', color: '#374151', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0' }}>
                    <span style={{ fontSize: 20 }}>←</span> 返回
                </button>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #eee9e3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer', color: '#374151' }}>⎋</button> 
                    <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #eee9e3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer', color: '#374151' }}>⋯</button> 
                </div>
            </header>

            <main style={{ maxWidth: 680, margin: '0 auto', padding: '0 20px' }}>
                {/* 图片轮播部分保持不变 */}
                {imagesArray.length > 0 && (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', background: '#f7f5f2', marginBottom: 24 }}>
                        <img src={imagesArray[currentImgIndex]} alt="美食图" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, padding: '4px 10px', borderRadius: 999, fontWeight: 500 }}>
                            {currentImgIndex + 1} / {imagesArray.length}
                        </div>
                        {imagesArray.length > 1 && (
                            <>
                                <button onClick={prevImg} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', left: 16 }}>‹</button>
                                <button onClick={nextImg} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', right: 16 }}>›</button>
                            </>
                        )}
                    </div>
                )}

                {/* 标题与作者信息 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4, margin: '0 0 16px 0', color: '#111827' }}>{post.title}</h1>
                    <button style={{ border: '1px solid #ef4444', color: '#ef4444', background: '#fff', padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ 关注</button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* 动态读取作者头像，如果为空给个默认值 */}
                        <img src={post.author?.avatar || "/upload/default-avatar.png"} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#eee9e3' }} />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                {/* 动态读取作者昵称 */}
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{post.author?.nickname || "未知吃货"}</span>
                                <span style={{ background: '#f4ece1', color: '#8c542f', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600, marginLeft: 8 }}>LV4 美食达人</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>
                                {formatTime(post.createAt)} · 湛江市 {post.location || ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap', marginBottom: 24 }}>{post.description}</div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
                    {post.category && <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: 13, padding: '6px 12px', borderRadius: 999 }}># {post.category}</span>}
                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: 13, padding: '6px 12px', borderRadius: 999 }}># 湛江美食</span>
                </div>

                {/* 互动数据条 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: 32 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent' }}>
                        <span style={{ color: '#ef4444' }}>♥</span> {post.likes || 0}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent' }}>
                        {/* 这里的评论数直接从数组长度拿最准确 */}
                        <span>💬</span> {CommentsList.length}
                    </button>

                    {/* ========================================== */}
                    {/* 【重点修改区】绑上了点击事件的动态收藏按钮 */}
                    {/* ========================================== */}
                    <button 
                        onClick={handleFavorite}
                        disabled={isFavoriteLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: isFavorited ? '#eab308' : '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent', transition: 'color 0.2s' }}
                    >
                    {/* 👇 关键：换成了纯文本字符 ☆ 和 ★ */}
                    <span style={{ fontSize: 16 }}>{isFavorited ? '★' : '☆'}</span> 
                        {isFavorited ? '已收藏' : '收藏'}
                    </button>

                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent' }}>
                        <span>⎋</span> 分享
                    </button>
                </div>

                {/* ========================================== */}
                {/* 评论区核心渲染区 */}
                {/* ========================================== */}
                <section style={{ paddingTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>评论 ({CommentsList.length})</h3>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>最新 ⌄</span>
                    </div>
                    
                    {/* 互动输入框：绑定 state 和 onChange，提交绑定 onClick */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>我</div>
                        <input 
                            type="text" 
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="说点什么吧..." 
                            style={{ flex: 1, background: '#f9fafb', border: 0, borderRadius: 999, padding: '10px 16px', fontSize: 14, outline: 'none' }} 
                        />
                        <button 
                            onClick={handleCommentSubmit}
                            disabled={isSubmitting} // 提交中禁用按钮
                            style={{ background: isSubmitting ? '#ccc' : '#9a5f34', color: '#fff', border: 0, borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                        >
                            {isSubmitting ? '发送中' : '评论'}
                        </button>
                    </div>

                    {/* 动态渲染评论列表 */}
                    {CommentsList.map((item) => (
                        <div key={item.id} style={{ display: 'flex', gap: 12, marginTop: 24, borderBottom: '1px solid #f9fafb', paddingBottom: 16 }}>
                            {/* 评论人头像 */}
                            <img src={item.author?.avatar || "/upload/default-avatar.png"} alt="user" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5563' }}>{item.author?.nickname || "匿名用户"}</span>
                                </div>
                                
                                {/* 评论具体内容 */}
                                <div style={{ fontSize: 14, color: '#111827', marginBottom: 8, lineHeight: 1.5 }}>
                                    {item.content}
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
                                    {/* 评论发表时间 */}
                                    <span>{formatTime(item.createAt)}</span>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <span style={{ cursor: 'pointer' }}>回复</span>
                                        <span style={{ cursor: 'pointer' }}>👍 0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 空数据兜底 UI */}
                    {CommentsList.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 14 }}>
                            还没有人评论，快来抢沙发吧~
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default PostDetail