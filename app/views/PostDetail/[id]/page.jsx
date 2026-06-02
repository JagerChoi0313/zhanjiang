"use client"
// 以前我们可以直接 params.id 拿到数字，现在不行了，必须先“解包”（unwrap）
// 这个 Promise 才能拿到里面的 id。因为拿不到正确的 id，前端发给后端的请求就乱了，最后就只能显示“帖子不见啦”。
import {use} from 'react'
import React from 'react'
import {useState,useEffect} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import IdenticonAvatar from '../../../components/IdenticonAvatar';
import {csrfFetch} from '../../../../lib/csrf-client';

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

    

    //去后端查询一下帖子的收藏状态
    const CheckFavoriteStatus=async()=>{
        try{
            //注意看这里：URL后面加上了？postId=xxx
            const res = await fetch(`/API/MyFavorites?postId=${postId}`)
            const data = await res.json()

            //如果后端返回了状态就更新到前端的星星上
            if(data.data?.isFavorited!==undefined){
                setIsFavorited(data.data.isFavorited)
            }

        }catch(error){
            console.error("获取收藏状态失败",error)
        }
    }

    //获取真实数据
    useEffect(()=>{
        fetchPost()
        CheckFavoriteStatus()  // 页面加载时，除了拿帖子，顺便查一下星星该不该亮
    },[postId])
    
    //处理点击收藏，取消收藏的逻辑
    const handleFavorite = async()=>{
        setIsFavoriteLoading(true);
        try{
            //访问收藏专属API
            const res = await csrfFetch(`/API/MyFavorites`,{
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
                setIsFavorited(data.data?.isFavorited);
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
        const res = await csrfFetch(`/API/PostDetail/${postId}`,{
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
        <div className="post-detail-page">
            <main className="detail-shell">
                <article className="post-panel">
                    <button className="back-btn" onClick={() => router.back()}>
                        <span>←</span>
                        返回
                    </button>

                    {imagesArray.length > 0 && (
                        <div className="image-stage">
                            <img src={imagesArray[currentImgIndex]} alt="美食图" className="post-image" />
                            <div className="image-count">{currentImgIndex + 1} / {imagesArray.length}</div>

                            {imagesArray.length > 1 && (
                                <>
                                    <button className="image-nav image-nav-left" onClick={prevImg}>‹</button>
                                    <button className="image-nav image-nav-right" onClick={nextImg}>›</button>
                                    <div className="image-dots">
                                        {imagesArray.map((_, index) => (
                                            <span
                                                key={index}
                                                className={`image-dot ${index === currentImgIndex ? 'active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="post-body">
                        <div className="post-scroll-area">
                            <div className="title-row">
                                <h1>{post.title}</h1>
                            </div>

                            <div className="author-row">
                                <Link 
                                href={`/views/User/${post.userId || post.author?.userId}`}
                                className="author-card">
                                    
                                    <IdenticonAvatar src={post.author?.avatar} seed={post.author?.nickname || post.userId || post.id} alt="avatar" className="author-avatar" />
                                    <div className="author-meta">
                                        <div className="author-name-line">
                                            <span className="author-name">{post.author?.nickname || "未知吃货"}</span>
                                            <span className="level-badge">LV4 美食达人</span>
                                        </div>
                                        <div className="post-time">{formatTime(post.createdAt || post.createAt)} · 湛江市 {post.location || ''}</div>
                                    </div>
                                </Link>

                                {/* <button className="follow-btn">+ 关注</button> */}
                            </div>

                            <div className="description">{post.description}</div>

                            <div className="tag-row">
                                {post.category && <span># {post.category}</span>}
                                <span># 湛江美食</span>
                            </div>
                        </div>

                        <div className="stats-card">
                            <div className="stat-item">
                                <span className="stat-icon">◎</span>
                                <strong>2.3k</strong>
                                <small>浏览</small>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon">□</span>
                                <strong>{CommentsList.length}</strong>
                                <small>评论</small>
                            </div>
                            <button
                                className={`stat-item favorite-stat ${isFavorited ? 'is-active' : ''}`}
                                onClick={handleFavorite}
                                disabled={isFavoriteLoading}
                            >
                                <span className="stat-icon">{isFavorited ? '★' : '☆'}</span>
                                <small className="favorite-label">{isFavorited ? '已收藏' : '收藏'}</small>
                            </button>
                        </div>
                    </div>
                </article>

                <section className="comments-panel">
                    <div className="comments-head">
                        <h2>评论 ({CommentsList.length})</h2>
                        <span>最新⌄</span>
                    </div>

                    <div className="comment-input-row">
                        <div className="me-avatar">J</div>
                        <div className="comment-input-wrap">
                            <input
                                type="text"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="说点什么吧..."
                            />
                            <span className="input-tool">☺</span>
                            <span className="input-tool">▧</span>
                        </div>
                        <button
                            className="publish-btn"
                            onClick={handleCommentSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '发送中' : '发布'}
                        </button>
                    </div>

                    <div className="comment-list">
                        {CommentsList.map((item) => (
                            <div key={item.id} className="comment-item">
                                <IdenticonAvatar src={item.author?.avatar} seed={item.author?.nickname || item.userId || item.id} alt="user" className="comment-avatar" />
                                <div className="comment-main">
                                    <div className="comment-name-line">
                                        <span className="comment-name">{item.author?.nickname || "匿名用户"}</span>
                                        <span className="comment-level">LV3 美食爱好者</span>
                                    </div>
                                    <p>{item.content}</p>
                                    <div className="comment-actions">
                                        <span>{formatTime(item.createAt)}</span>
                                        <div>
                                            <span>□ 回复</span>
                                            <span>♡ 0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {CommentsList.length === 0 && (
                            <div className="empty-comment">还没有人评论，快来抢沙发吧~</div>
                        )}
                    </div>

                    {CommentsList.length > 0 && <div className="comment-end">没有更多了</div>}
                </section>
            </main>

            <style jsx>{`
                .post-detail-page {
                    height: 100vh;
                    overflow: hidden;
                    color: #171717;
                    background:
                        radial-gradient(circle at 12% 0%, rgba(184, 122, 72, 0.08), transparent 28%),
                        linear-gradient(180deg, #fffaf6 0%, #ffffff 38%, #fbfbfb 100%);
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    padding: 18px 22px;
                }

                .back-btn {
                    position: absolute;
                    top: 14px;
                    left: 14px;
                    z-index: 5;
                    height: 32px;
                    min-width: 76px;
                    border: 1px solid rgba(229, 224, 218, 0.9);
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #171717;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    box-shadow: 0 8px 18px rgba(20, 20, 20, 0.07);
                }

                .back-btn span {
                    font-size: 15px;
                    line-height: 1;
                }

                .detail-shell {
                    max-width: 1500px;
                    margin: 0 auto;
                    height: calc(100vh - 36px);
                    display: grid;
                    grid-template-columns: minmax(0, 1.18fr) minmax(430px, 0.92fr);
                    gap: 22px;
                    align-items: stretch;
                }

                .post-panel,
                .comments-panel {
                    background: rgba(255, 255, 255, 0.92);
                    border: 1px solid rgba(236, 232, 226, 0.9);
                    border-radius: 8px;
                    box-shadow: 0 18px 42px rgba(28, 24, 20, 0.07);
                }

                .post-panel {
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }

                .image-stage {
                    flex: 0 0 auto;
                    position: relative;
                    margin: 14px 14px 0;
                    height: clamp(360px, 48vh, 520px);
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f3f0ec;
                }

                .post-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .image-count {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    color: #fff;
                    background: rgba(18, 18, 18, 0.58);
                    border-radius: 999px;
                    padding: 5px 11px;
                    font-size: 13px;
                    line-height: 1;
                }

                .image-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 42px;
                    height: 42px;
                    border: 1px solid rgba(255, 255, 255, 0.68);
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.9);
                    color: #272727;
                    font-size: 30px;
                    line-height: 1;
                    cursor: pointer;
                    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
                }

                .image-nav-left {
                    left: 16px;
                }

                .image-nav-right {
                    right: 16px;
                }

                .image-dots {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                }

                .image-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.72);
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.12);
                }

                .image-dot.active {
                    background: #a95722;
                }

                .post-body {
                    min-height: 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 20px 32px 24px;
                    overflow: hidden;
                }

                .post-scroll-area {
                    min-height: 0;
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 6px;
                    scrollbar-width: thin;
                    scrollbar-color: #ded8d0 transparent;
                }

                .title-row h1 {
                    margin: 0 0 16px;
                    font-size: 26px;
                    line-height: 1.35;
                    font-weight: 800;
                    color: #161616;
                }

                .author-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 22px;
                }

                .author-card {
                    min-width: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .author-avatar,
                .comment-avatar {
                    flex: 0 0 auto;
                    border-radius: 50%;
                    object-fit: cover;
                    background: #efe9e3;
                }

                .author-avatar {
                    width: 34px;
                    height: 34px;
                }

                .author-meta {
                    min-width: 0;
                }

                .author-name-line,
                .comment-name-line {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    flex-wrap: wrap;
                }

                .author-name,
                .comment-name {
                    font-weight: 800;
                    color: #191919;
                }

                .author-name {
                    font-size: 15px;
                }

                .level-badge,
                .comment-level {
                    border-radius: 5px;
                    background: #fbede2;
                    color: #a25724;
                    font-size: 11px;
                    font-weight: 800;
                    padding: 3px 7px;
                    line-height: 1;
                }

                .post-time {
                    margin-top: 4px;
                    color: #8c95a3;
                    font-size: 13px;
                }

                .follow-btn {
                    flex: 0 0 auto;
                    min-width: 86px;
                    height: 34px;
                    border-radius: 999px;
                    border: 1px solid #e35c47;
                    color: #e24e3c;
                    background: #fff;
                    font-size: 14px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .description {
                    color: #222;
                    font-size: 15px;
                    line-height: 1.85;
                    white-space: pre-wrap;
                    margin-bottom: 20px;
                }

                .tag-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 22px;
                }

                .tag-row span {
                    border-radius: 999px;
                    background: #f4f5f6;
                    color: #5f6772;
                    padding: 7px 13px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .stats-card {
                    flex: 0 0 auto;
                    margin-top: auto;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    border: 1px solid #ebe7e2;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #fff;
                }

                .stat-item {
                    min-height: 68px;
                    border: 0;
                    border-right: 1px solid #ebe7e2;
                    background: transparent;
                    color: #1f2328;
                    display: grid;
                    place-items: center;
                    align-content: center;
                    gap: 3px;
                    font: inherit;
                }

                .stat-item:last-child {
                    border-right: 0;
                }

                .favorite-stat {
                    cursor: pointer;
                }

                .favorite-stat.is-active .stat-icon,
                .favorite-stat.is-active .favorite-label {
                    color: #d99a1e;
                }

                .stat-icon {
                    font-size: 22px;
                    line-height: 1;
                    color: #252525;
                }

                .stat-item strong {
                    font-size: 18px;
                    font-weight: 700;
                }

                .stat-item small {
                    color: #4e535b;
                    font-size: 14px;
                }

                .comments-panel {
                    min-height: 0;
                    height: 100%;
                    padding: 28px 30px 18px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .comments-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 26px;
                    flex: 0 0 auto;
                }

                .comments-head h2 {
                    margin: 0;
                    font-size: 20px;
                    line-height: 1.2;
                    font-weight: 800;
                }

                .comments-head span {
                    color: #6f7682;
                    font-size: 14px;
                }

                .comment-input-row {
                    display: grid;
                    grid-template-columns: 38px minmax(0, 1fr) 90px;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 26px;
                    flex: 0 0 auto;
                }

                .me-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #57bc87, #31a56d);
                    color: #fff;
                    display: grid;
                    place-items: center;
                    font-size: 17px;
                    font-weight: 700;
                }

                .comment-input-wrap {
                    min-width: 0;
                    height: 48px;
                    border: 1px solid #e7e9ec;
                    border-radius: 999px;
                    background: #f7f8fa;
                    display: flex;
                    align-items: center;
                    padding: 0 14px 0 19px;
                    gap: 12px;
                }

                .comment-input-wrap input {
                    min-width: 0;
                    flex: 1;
                    border: 0;
                    outline: 0;
                    background: transparent;
                    color: #222;
                    font-size: 15px;
                }

                .comment-input-wrap input::placeholder {
                    color: #9aa2ac;
                }

                .input-tool {
                    flex: 0 0 auto;
                    color: #68717c;
                    font-size: 20px;
                    line-height: 1;
                }

                .publish-btn {
                    height: 48px;
                    border: 0;
                    border-radius: 999px;
                    background: #a85b25;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(168, 91, 37, 0.18);
                }

                .publish-btn:disabled {
                    background: #c9c3bd;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .comment-list {
                    min-height: 0;
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    scrollbar-width: thin;
                    scrollbar-color: #ded8d0 transparent;
                }

                .comment-item {
                    display: flex;
                    gap: 14px;
                }

                .comment-avatar {
                    width: 38px;
                    height: 38px;
                }

                .comment-main {
                    min-width: 0;
                    flex: 1;
                }

                .comment-main p {
                    margin: 10px 0 12px;
                    color: #242424;
                    font-size: 15px;
                    line-height: 1.7;
                    word-break: break-word;
                }

                .comment-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    color: #7f8794;
                    font-size: 14px;
                }

                .comment-actions div {
                    display: flex;
                    gap: 22px;
                    white-space: nowrap;
                }

                .empty-comment {
                    padding: 72px 0;
                    text-align: center;
                    color: #9aa2ac;
                    font-size: 14px;
                }

                .comment-end {
                    flex: 0 0 auto;
                    margin: 18px -30px 0;
                    padding-top: 16px;
                    border-top: 1px solid #eee9e3;
                    color: #8b929d;
                    text-align: center;
                    font-size: 14px;
                }

                @media (max-width: 1120px) {
                    .detail-shell {
                        height: calc(100vh - 20px);
                        grid-template-columns: 1fr;
                        overflow-y: auto;
                        align-items: start;
                    }

                    .comments-panel {
                        height: min(620px, calc(100vh - 40px));
                    }

                    .image-stage {
                        height: clamp(320px, 42vh, 460px);
                    }
                }

                @media (max-width: 720px) {
                    .post-detail-page {
                        height: auto;
                        min-height: 100vh;
                        overflow: auto;
                        padding: 10px 12px;
                    }

                    .detail-shell {
                        height: auto;
                        gap: 14px;
                        overflow: visible;
                    }

                    .image-stage {
                        margin: 10px 10px 0;
                        height: 300px;
                    }

                    .post-body,
                    .comments-panel {
                        padding: 22px 18px;
                        overflow: visible;
                    }

                    .post-body {
                        display: block;
                    }

                    .post-scroll-area {
                        overflow: visible;
                        padding-right: 0;
                    }

                    .title-row h1 {
                        font-size: 22px;
                    }

                    .author-row,
                    .comment-actions {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .stats-card {
                        grid-template-columns: 1fr;
                    }

                    .stat-item {
                        min-height: 74px;
                        border-right: 0;
                        border-bottom: 1px solid #ebe7e2;
                    }

                    .stat-item:last-child {
                        border-bottom: 0;
                    }

                    .comment-input-row {
                        grid-template-columns: 38px minmax(0, 1fr);
                    }

                    .publish-btn {
                        grid-column: 2;
                        width: 100%;
                    }

                    .input-tool {
                        display: none;
                    }
                }
            `}</style>
        </div>
    )
}

export default PostDetail
