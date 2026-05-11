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

    //获取真实数据
    useEffect(()=>{
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
        fetchPost()
    },[postId])
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
    const formatDate = new Date(post.createAt).toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    // 轮播图切换逻辑
    const nextImg = () => setCurrentImgIndex(prev => (prev + 1) % imagesArray.length);
    const prevImg = () => setCurrentImgIndex(prev => (prev - 1 + imagesArray.length) % imagesArray.length);

    return(
 <div style={{ minHeight: '100vh', background: '#ffffff', color: '#111827', paddingBottom: 80, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* 1. 顶部导航 */}
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
                {/* 2. 主图轮播 (如果有图片) */}
                {imagesArray.length > 0 && (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', background: '#f7f5f2', marginBottom: 24 }}>
                        <img src={imagesArray[currentImgIndex]} alt="美食图" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, padding: '4px 10px', borderRadius: 999, fontWeight: 500 }}>
                            {currentImgIndex + 1} / {imagesArray.length}
                        </div>
                        
                        {/* 只有一张图时不显示左右箭头 */}
                        {imagesArray.length > 1 && (
                            <>
                                <button onClick={prevImg} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', left: 16 }}>‹</button>
                                <button onClick={nextImg} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', right: 16 }}>›</button>
                            </>
                        )}
                    </div>
                )}

                {/* 3. 标题与作者信息 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4, margin: '0 0 16px 0', color: '#111827' }}>{post.title}</h1>
                    <button style={{ border: '1px solid #ef4444', color: '#ef4444', background: '#fff', padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ 关注</button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* 头像占位 */}
                        <img src="/upload/default-avatar.png" alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#eee9e3' }} />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>湛江干饭王</span>
                                <span style={{ background: '#f4ece1', color: '#8c542f', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600, marginLeft: 8 }}>LV4 美食达人</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>
                                {formatDate} · 湛江市 {post.location}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. 正文与标签 */}
                <div style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap', marginBottom: 24 }}>{post.description}</div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: 13, padding: '6px 12px', borderRadius: 999 }}># {post.category}</span>
                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: 13, padding: '6px 12px', borderRadius: 999 }}># 湛江美食</span>
                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: 13, padding: '6px 12px', borderRadius: 999 }}># 探店打卡</span>
                </div>

                {/* 5. 互动数据条 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: 32 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent' }}>
                        <span style={{ color: '#ef4444' }}>♥</span> {post.likes || '1.2k'}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent' }}>
                        <span>💬</span> {post.comments || 86}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent' }}>
                        <span>⭐</span> 收藏
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 14, cursor: 'pointer', border: 0, background: 'transparent' }}>
                        <span>⎋</span> 分享
                    </button>
                </div>

                {/* 6. 评论区 UI 骨架 */}
                <section style={{ paddingTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>评论 (86)</h3>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>最新 ⌄</span>
                    </div>
                    
                    {/* 发布评论框 */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>J</div>
                        <input type="text" placeholder="说点什么吧..." style={{ flex: 1, background: '#f9fafb', border: 0, borderRadius: 999, padding: '10px 16px', fontSize: 14, outline: 'none' }} />
                        <button style={{ background: '#9a5f34', color: '#fff', border: 0, borderRadius: 999, padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>评论</button>
                    </div>

                    {/* 单条评论展示占位 */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <img src="/upload/default-avatar.png" alt="user" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#4b5563' }}>糖水研究所</span>
                                <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600, marginLeft: 8 }}>LV5 美食达人</span>
                            </div>
                            <div style={{ fontSize: 14, color: '#111827', marginBottom: 8, lineHeight: 1.5 }}>
                                看着就流口水了！改天去试试 🤤
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
                                <span>2026-04-29 14:45</span>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <span style={{ cursor: 'pointer' }}>回复</span>
                                    <span style={{ cursor: 'pointer' }}>👍 18</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default PostDetail