"use client"
import {useState,useEffect} from 'react'
import { Spin, Button, message } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  MessageOutlined,
  StarOutlined,
  LogoutOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ManOutlined,
  WomanOutlined
} from '@ant-design/icons';
import Link from "next/link"
import {useRouter} from 'next/navigation'
import styles from './profile.module.css'

const InfoItem = ({ icon, label, value }) => (
  <div className={styles.infoItem}>
    <div className={styles.infoIcon}>{icon}</div>
    <div className={styles.infoText}>
      <p className={styles.infoLabel}>{label}</p>
      <p className={styles.infoValue}>{value}</p>
    </div>
  </div>
)

const StatCard = ({ icon, value, label, tone }) => (
  <div className={`${styles.statCard} ${styles[tone]}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  </div>
)

const ProfilePage=()=>{
    const router = useRouter()
    const [loading,setLoading] = useState(true)
    const [user,setUser] = useState(null)

    //1，页面加载时自动查验用户的登录状态
    useEffect(()=>{

       const checkLoginStatus = async()=>{

        try{
            const res = await fetch('/API/auth/Login', { credentials: 'include' })
            const data = await res.json();

            if(data.success){
                setUser(data.user)  //存入当前登录的用户信息（包含头像，昵称）
            }else{
                setUser(null)
            }
        }catch(error){
                setUser(null)
        }finally{
            setLoading(false)
        }
       }
            checkLoginStatus()
    },[])

    //退出登录逻辑
    const handleLogout=async()=>{
        try{
            const res = await fetch("/API/auth/Logout",{method:"POST"})
            const data = await res.json()

            if(data.success){
                message.success("已成功退出登录，期待与您下次美食相遇")
                setUser(null)
                router.push('/views/Login')
            }else{
                message.error(data.error||'退出失败')
            }
        }catch(error){
                message.error("网络异常，请稍后再尝试")
        }
    }

    //全局加载动画状态
    if(loading){
        return(
        <div className="flex justify-center items-center min-h-screen bg-white">
            <Spin size="large" description="正在载入食客空间..." />
        </div>
        )
    }

    //情况A：用户未登录，渲染拦截页面
    if(!user){
        return(
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex justify-center items-center mb-6">
          <UserOutlined className="text-2xl text-gray-400" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 mb-2">探索属于你的湛江美食足迹</h2>
        <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
          登录后即可解锁投稿专属美食、管理你的评论、帖子以及收藏的寻味路线。
        </p>
        <Link 
          href="/views/Login" 
          className="px-8 py-3 bg-[#a63d2d] text-white font-medium rounded-xl transition-all hover:bg-[#8b3224] hover:shadow-lg hover:shadow-red-900/10 active:scale-95 text-base tracking-wide"
        >
          请先登录
        </Link>
    </div>
        )
    }

    const genderLabel = user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '保密'
    const genderIcon = user.gender === 'female' ? <WomanOutlined /> : <ManOutlined />
    const joinDate = user.createdAt || user.createTime || user.joinTime || user.registerTime
    const displayJoinDate = joinDate ? String(joinDate).slice(0, 10) : '暂未记录'

    return(
<div className={styles.profilePage}>
      <div className={styles.profileShell}>
        <div className={styles.profileCard}>
          <div className={styles.topActions}>
            <Button
              danger
              ghost
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              退出登录
            </Button>
          </div>

          <section className={styles.hero}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarInner}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className={styles.avatarImg}
                  />
                ) : (
                  <UserOutlined className={styles.avatarFallback} />
                )}
              </div>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.nameRow}>
                <h1 className={styles.nickname}>{user.nickname}</h1>
                <span className={styles.levelBadge}>
                  湛江美食食客
                </span>
              </div>
              <p className={styles.bio}>
                爱生活，爱美食，记录湛江的一切味道。
              </p>
              <div className={styles.joinTime}>
                <CalendarOutlined />
                <span>加入时间：{displayJoinDate}</span>
              </div>
            </div>
          </section>

          <section className={styles.statsGrid}>
            <StatCard
              icon={<FileTextOutlined />}
              value={user.stats?.posts || 0}
              label="我的帖子"
              tone="postTone"
            />
            <StatCard
              icon={<MessageOutlined />}
              value={user.stats?.comments || 0}
              label="我的评论"
              tone="commentTone"
            />
            <StatCard
              icon={<StarOutlined />}
              value={user.stats?.favorites || 0}
              label="我的收藏"
              tone="favoriteTone"
            />
          </section>

          <section className={styles.infoPanel}>
            <h2 className={styles.panelTitle}>基本信息</h2>
            <div className={styles.infoGrid}>
              <InfoItem icon={<IdcardOutlined />} label="用户 ID" value={user.userId || '未填写'} />
              <InfoItem icon={genderIcon} label="性别" value={genderLabel} />
              <InfoItem icon={<CalendarOutlined />} label="年龄" value={user.age ? `${user.age} 岁` : '未填写'} />
              <InfoItem icon={<PhoneOutlined />} label="联系电话" value={user.phoneNumber || '未填写'} />
              <InfoItem icon={<MailOutlined />} label="绑定邮箱" value={user.email || '未填写'} />
            </div>
          </section>
        </div>
      </div>
    </div>
    )
}

export default ProfilePage
