"use client"
import React from 'react'
import {useState,useEffect} from 'react'
import {Spin,message} from "antd"
import {useParams} from 'next/navigation'
import {
  FileTextOutlined,
  MessageOutlined,
  StarOutlined,
  CalendarOutlined,
  CoffeeOutlined,
  EnvironmentOutlined,
  CameraOutlined
} from '@ant-design/icons';
import IdenticonAvatar from '../../../components/IdenticonAvatar';
import {csrfFetch} from '../../../../lib/csrf-client';

const UserProfilePage=()=>{
    const {id} = useParams();
    const [loading,setLoading] = useState(true)
    const [targetUser,setTargetUser] = useState(null)

    const [isFollowing,setIsFollowing] = useState(false)
    const [followLoading,setFollowLoading] = useState(false)
    const [followerCount,setFollowerCount] = useState(0)

    // 用于接管关注按钮的悬停动画，彻底告别 CSS 伪类
    const [isBtnHovered, setIsBtnHovered] = useState(false);

    // 修复 2：去掉多余的等号，正确调用 useEffect
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await fetch(`/API/UserInfo?id=${id}`);
        const userData = await userRes.json();

        if (userData.success) {
          setTargetUser(userData.data);
          // 修复 3：统一命名为 setFollowerCount
          setFollowerCount(userData.data.stats?.followerCount || 0);
        } else {
          message.error(userData.message || "未找到该食客");
        }

        const followRes = await fetch(`/API/Follow?targetId=${id}`);
        const followData = await followRes.json();

        if (followData.success) {
          setIsFollowing(followData.data?.isFollowing);
        }
      } catch (error) {
        console.error(error);
        message.error("网络错误");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUserData();
  }, [id]);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      const res = await csrfFetch('/API/Follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: id })
      });
      const data = await res.json();
      
      if (data.success) {
        message.success(data.message);
        const nextIsFollowing = data.data?.isFollowing;
        setIsFollowing(nextIsFollowing);
        setFollowerCount(prev => nextIsFollowing ? prev + 1 : prev - 1);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error("操作失败，请重试");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Spin size="large" description="正在探寻食客足迹..." />
      </div>
    );
  }

  if (!targetUser) return null;

  const joinDate = targetUser.createdAt || targetUser.createTime;
  const displayJoinDate = joinDate ? String(joinDate).slice(0, 10) : '暂未记录'
  const pageStyle = {
    minHeight: 'calc(100vh - 80px)',
    boxSizing: 'border-box',
    padding: '92px 24px 12px',
    color: '#0f172a',
    backgroundColor: '#f8f7f5',
    backgroundImage: 'radial-gradient(circle at 18% 0%, rgba(180, 83, 9, 0.08), transparent 32%), radial-gradient(circle at 86% 10%, rgba(37, 99, 235, 0.06), transparent 34%)'
  };
  const shellStyle = {
    width: 'min(100%, 1220px)',
    margin: '0 auto'
  };
  const cardStyle = {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 0,
    padding: '24px 42px 24px',
    border: '1px solid rgba(226, 232, 240, 0.88)',
    borderRadius: 22,
    background: 'rgba(255, 255, 255, 0.96)',
    boxShadow: '0 22px 70px rgba(15, 23, 42, 0.11)'
  };
  const actionStyle = {
    position: 'absolute',
    top: 26,
    right: 42,
    zIndex: 2
  };
  const followButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 118,
    height: 40,
    padding: '0 24px',
    border: isFollowing ? '1px solid #e2e8f0' : '1px solid transparent',
    borderRadius: 999,
    background: isFollowing ? (isBtnHovered ? '#fff1f2' : '#f8fafc') : '#a63d2d',
    color: isFollowing ? (isBtnHovered ? '#dc2626' : '#64748b') : '#fff',
    fontSize: 14,
    fontWeight: 800,
    cursor: followLoading ? 'not-allowed' : 'pointer',
    opacity: followLoading ? 0.72 : 1,
    boxShadow: isFollowing ? 'none' : '0 10px 22px rgba(166, 61, 45, 0.24)',
    transition: 'all 0.22s ease'
  };
  const heroStyle = {
    display: 'grid',
    gridTemplateColumns: '140px minmax(0, 1fr)',
    alignItems: 'center',
    columnGap: 38,
    paddingRight: 190
  };
  const avatarStyle = {
    width: 132,
    height: 132,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d8b28c, #f4e2cf)',
    boxShadow: '0 18px 42px rgba(120, 53, 15, 0.18)'
  };
  const nameRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10
  };
  const statsRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    marginBottom: 12,
    color: '#475569',
    fontSize: 15,
    fontWeight: 700
  };
  const statGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 24,
    marginTop: 28
  };
  const introPanelStyle = {
    marginTop: 24,
    padding: '22px 32px 24px',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    background: '#fff'
  };

  const metricCardStyle = (tone) => {
    const map = {
      post: ['linear-gradient(135deg, #fff8f3, #fffdfb)', '#fff1e5', '#b45309'],
      comment: ['linear-gradient(135deg, #f5f9ff, #ffffff)', '#e8f2ff', '#2563eb'],
      favorite: ['linear-gradient(135deg, #fffbeb, #ffffff)', '#fff2cc', '#f59e0b']
    };
    const [background, iconBg, iconColor] = map[tone];
    return {
      card: {
        minHeight: 92,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '16px 26px',
        borderRadius: 14,
        background
      },
      icon: {
        width: 50,
        height: 50,
        flex: '0 0 50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: iconBg,
        color: iconColor,
        fontSize: 22
      }
    };
  };

  const postMetric = metricCardStyle('post');
  const commentMetric = metricCardStyle('comment');
  const favoriteMetric = metricCardStyle('favorite');

    return(
        <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={cardStyle}>
          <div style={actionStyle}>
            <button 
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              onClick={handleFollowToggle}
              disabled={followLoading}
              style={followButtonStyle}
            >
              {isFollowing ? (isBtnHovered ? '取消关注' : '已关注') : '+ 关注'}
            </button>
          </div>

          <section style={heroStyle}>
            <div style={avatarStyle}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <IdenticonAvatar src={targetUser.avatar} seed={targetUser.nickname || targetUser.email || targetUser.userId} alt="avatar" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={nameRowStyle}>
                <h1 style={{ margin: 0, color: '#0f172a', fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: 0 }}>
                  {targetUser.nickname}
                </h1>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 14px', borderRadius: 999, background: '#fff3e8', color: '#b45309', fontSize: 14, fontWeight: 800 }}>
                  {targetUser.level ? `LV${targetUser.level} 美食达人` : 'LV4 美食达人'}
                </span>
              </div>
              <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 16, lineHeight: 1.7, fontWeight: 600 }}>
                {targetUser.bio || "爱生活，爱美食，爱湛江的一切味道～"}
              </p>

              <div style={statsRowStyle}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span style={{ color: '#64748b' }}>关注</span>
                  <span style={{ color: '#0f172a', fontSize: 18, fontWeight: 800 }}>{targetUser.stats?.followingCount || 0}</span>
                </div>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span style={{ color: '#64748b' }}>粉丝</span>
                  <span style={{ color: '#0f172a', fontSize: 18, fontWeight: 800 }}>{followerCount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569', fontSize: 15, fontWeight: 600 }}>
                <CalendarOutlined style={{ color: '#b45309', fontSize: 18 }} />
                <span>加入时间：{displayJoinDate}</span>
              </div>
            </div>
          </section>

          <section style={statGridStyle}>
            <div style={postMetric.card}>
              <div style={postMetric.icon}>
                <FileTextOutlined />
              </div>
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontSize: 28, lineHeight: 1, fontWeight: 800 }}>{targetUser.stats?.posts || 0}</p>
                <p style={{ margin: '8px 0 0', color: '#475569', fontSize: 15, lineHeight: 1.2, fontWeight: 600 }}>他的帖子</p>
              </div>
            </div>

            <div style={commentMetric.card}>
              <div style={commentMetric.icon}>
                <MessageOutlined />
              </div>
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontSize: 28, lineHeight: 1, fontWeight: 800 }}>{targetUser.stats?.comments || 0}</p>
                <p style={{ margin: '8px 0 0', color: '#475569', fontSize: 15, lineHeight: 1.2, fontWeight: 600 }}>他的评论</p>
              </div>
            </div>

            <div style={favoriteMetric.card}>
              <div style={favoriteMetric.icon}>
                <StarOutlined />
              </div>
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontSize: 28, lineHeight: 1, fontWeight: 800 }}>{targetUser.stats?.favorites || 0}</p>
                <p style={{ margin: '8px 0 0', color: '#475569', fontSize: 15, lineHeight: 1.2, fontWeight: 600 }}>获得收藏</p>
              </div>
            </div>
          </section>

         <section style={introPanelStyle}>
            <h2 style={{ margin: '0 0 18px', color: '#0f172a', fontSize: 19, lineHeight: 1.2, fontWeight: 800 }}>个人简介</h2>
            
            {/* 👇 核心改动：加入 whiteSpace 保持排版，并动态渲染 targetUser.introduction */}
            <div style={{ minHeight: 58, maxHeight: 96, overflow: 'hidden', marginBottom: 20, color: '#475569', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {targetUser.introduction || "这位食客很懒，还没有填写简介～"}
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                <CoffeeOutlined /> 美食探店爱好者
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                <EnvironmentOutlined /> 湛江本地人
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                <CameraOutlined /> 记录生活
              </span>
            </div>
          </section>
          
        </div>
      </div>
    </div>
    )
}

export default UserProfilePage
