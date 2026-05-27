"use client"
import React, { useState, useEffect } from 'react'
import { Spin, Button, message, Modal, Form, Input, Select } from 'antd';
import {
  UserOutlined, LogoutOutlined, CalendarOutlined, MailOutlined, 
  PhoneOutlined, IdcardOutlined, ManOutlined, WomanOutlined,
  EditOutlined, FileTextOutlined, EnvironmentOutlined, CoffeeOutlined, CameraOutlined,
  MessageOutlined, StarOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './profile.module.css'; // ✅ 坚决保留你的 CSS Module

const ProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // 编辑弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/API/auth/Login', { credentials: 'include' });
      const data = await res.json();
      const currentUser = data.data?.user;
      if (data.success) {
        setUser(currentUser);
        form.setFieldsValue({
          nickname: currentUser.nickname,
          gender: currentUser.gender,
          age: currentUser.age,
          phoneNumber: currentUser.phoneNumber,
          introduction: currentUser.introduction // 获取个人简介
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUserData(); 
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/API/auth/Logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        message.success("已成功退出登录，期待与您下次美食相遇");
        setUser(null);
        router.push('/views/Login');
      } else {
        message.error(data.message || '退出失败');
      }
    } catch (error) {
      message.error("网络异常，请稍后再尝试");
    }
  };

  const handleUpdate = async (values) => {
    setSubmitLoading(true);
    try {
      const res = await fetch('/API/auth/UpdateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      
      if (data.success) {
        message.success(data.message);
        setIsModalOpen(false);
        fetchUserData(); 
      } else {
        message.error(data.message || "更新失败");
      }
    } catch (error) {
      message.error("网络错误，请稍后再试");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff' }}>
        <Spin size="large" description="正在载入食客空间..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '8px' }}>探索属于你的湛江美食足迹</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>登录后即可解锁投稿专属美食、管理你的评论等功能。</p>
        <Link href="/views/Login">
          <Button type="primary" size="large" style={{ background: '#a63d2d', borderColor: '#a63d2d' }}>请先登录</Button>
        </Link>
      </div>
    );
  }

  const joinDate = user.createdAt || user.createTime;
  const displayJoinDate = joinDate ? String(joinDate).slice(0, 10) : '暂未记录';

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileShell}>
        <div className={styles.profileCard}>
          
          <div className={styles.topActions}>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} className={styles.logoutButton}>退出登录</Button>
          </div>

          {/* 1. 顶部个人横幅 */}
          <section className={styles.hero}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarInner}>
                {user.avatar ? <img src={user.avatar} alt="avatar" className={styles.avatarImg} /> : <UserOutlined className={styles.avatarFallback} />}
              </div>
              <div className={styles.avatarBadge}><CameraOutlined /></div>
            </div>

            <div className={styles.heroContent}>
              <div className={styles.nameRow}>
                <h1 className={styles.nickname}>{user.nickname}</h1>
                <span className={styles.levelBadge}>LV4 美食达人</span>
              </div>

              <p className={styles.heroBio}>爱生活，爱美食，爱湛江的一切味道～</p>
              
              <div className={styles.followInfoRow}>
                <div className={styles.followItem}>
                  <span className={styles.followLabel}>关注</span>
                  <span className={styles.followNum}>{user.stats?.followingCount || 0}</span>
                </div>
                <span className={styles.followDivider}>|</span>
                <div className={styles.followItem}>
                  <span className={styles.followLabel}>粉丝</span>
                  <span className={styles.followNum}>{user.stats?.followerCount || 0}</span>
                </div>
              </div>

              <div className={styles.joinTime}>
                <CalendarOutlined />
                <span>加入时间：{displayJoinDate}</span>
              </div>
            </div>
          </section>

          {/* 2. 统计卡片 */}
          <section className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.postTone}`}>
              <div className={styles.statIcon}><FileTextOutlined /></div>
              <div><p className={styles.statValue}>{user.stats?.posts || 0}</p><p className={styles.statLabel}>我的帖子</p></div>
            </div>
            <div className={`${styles.statCard} ${styles.commentTone}`}>
              <div className={styles.statIcon}><MessageOutlined /></div>
              <div><p className={styles.statValue}>{user.stats?.comments || 0}</p><p className={styles.statLabel}>我的评论</p></div>
            </div>
            <div className={`${styles.statCard} ${styles.favoriteTone}`}>
              <div className={styles.statIcon}><StarOutlined /></div>
              <div><p className={styles.statValue}>{user.stats?.favorites || 0}</p><p className={styles.statLabel}>获得收藏</p></div>
            </div>
          </section>

          {/* 3. 左右分栏核心区 (新增部分) */}
          <div className={styles.splitLayout}>
            
            {/* 左侧：个人简介 */}
            <section className={styles.introPanel}>
              <h2 className={styles.panelTitle}>个人简介</h2>
              <div className={styles.introText}>
                {user.introduction || "你还没有填写个人简介，点击右侧的编辑按钮向大家介绍一下自己吧～"}
              </div>
              <div className={styles.tagGroup}>
                 <span className={styles.tag}><CoffeeOutlined /> 美食探店爱好者</span>
                 <span className={styles.tag}><EnvironmentOutlined /> 湛江本地人</span>
                 <span className={styles.tag}><CameraOutlined /> 记录生活</span>
              </div>
            </section>

            {/* 右侧：基本信息与编辑入口 */}
            <section className={styles.infoPanel}>
               <div className={styles.panelHeader}>
                 <h2 className={styles.panelTitle}>基本信息</h2>
                 <Button type="link" icon={<EditOutlined />} className={styles.editButton} onClick={() => setIsModalOpen(true)}>编辑资料</Button>
               </div>
               
               <div className={styles.infoGrid}>
                 <div className={styles.infoItem}>
                   <div className={styles.infoIcon}><IdcardOutlined/></div>
                   <div className={styles.infoText}><p className={styles.infoLabel}>用户 ID</p><p className={styles.infoValue}>{user.userId}</p></div>
                 </div>
                 <div className={styles.infoItem}>
                   <div className={styles.infoIcon}>{user.gender === 'female' ? <WomanOutlined/> : <ManOutlined/>}</div>
                   <div className={styles.infoText}><p className={styles.infoLabel}>性别</p><p className={styles.infoValue}>{user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '未设置'}</p></div>
                 </div>
                 <div className={styles.infoItem}>
                   <div className={styles.infoIcon}><CalendarOutlined/></div>
                   <div className={styles.infoText}><p className={styles.infoLabel}>年龄</p><p className={styles.infoValue}>{user.age ? `${user.age} 岁` : '未设置'}</p></div>
                 </div>
                 <div className={styles.infoItem}>
                   <div className={styles.infoIcon}><PhoneOutlined/></div>
                   <div className={styles.infoText}><p className={styles.infoLabel}>手机号</p><p className={styles.infoValue}>{user.phoneNumber || '未设置'}</p></div>
                 </div>
                 <div className={`${styles.infoItem} ${styles.fullWidthItem}`}>
                   <div className={styles.infoIcon}><MailOutlined/></div>
                   <div className={styles.infoText}><p className={styles.infoLabel}>绑定邮箱</p><p className={styles.infoValue}>{user.email}</p></div>
                 </div>
               </div>
            </section>
          </div>
        </div>
      </div>

      {/* 4. 极简风编辑资料弹窗 (内部使用 Antd 默认样式 + 少量行内样式即可) */}
      <Modal
        forceRender 
        title={<b style={{ fontSize: '18px', color: '#1e293b' }}>编辑个人资料</b>} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        confirmLoading={submitLoading}
        okText="保存修改" 
        cancelText="取消" 
        width={560} 
        centered
        okButtonProps={{ style: { background: '#a63d2d', borderColor: '#a63d2d' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ marginTop: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
              <Input size="large" placeholder="输入你的昵称" />
            </Form.Item>
            <Form.Item name="gender" label="性别">
              <Select size="large" options={[{ value: 'male', label: '男' }, { value: 'female', label: '女' }, { value: 'unknown', label: '保密' }]} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Form.Item name="age" label="年龄">
              <Input size="large" type="number" placeholder="填入数字，如：24" />
            </Form.Item>
            <Form.Item name="phoneNumber" label="手机号">
              <Input size="large" placeholder="输入手机号" />
            </Form.Item>
          </div>
          <Form.Item name="introduction" label="个人简介">
            <Input.TextArea size="large" rows={4} style={{ resize: 'none' }} placeholder="向大家介绍一下你自己吧，比如你的探店风格、最爱的街头小吃..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProfilePage
