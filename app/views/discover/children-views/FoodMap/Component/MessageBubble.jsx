"use client";
import React from 'react';
import { Bot, MapPin, RefreshCw, UserRound, Utensils } from 'lucide-react';

const routeStops = [
  { index: 1, name: '水井头牛杂', desc: '牛杂汤' },
  { index: 2, name: '中兴街炸虾饼', desc: '现炸虾饼' },
  { index: 3, name: '日初鸡老店', desc: '鲜嫩多汁' },
  { index: 4, name: '田艾籺', desc: '软糯清香' },
  { index: 5, name: '糖水铺', desc: '地道糖水' }
];

const ActionButton = ({ icon: Icon, children }) => (
  <button style={{
    height: '34px',
    borderRadius: '999px',
    border: '1px solid #e8dfd6',
    background: '#fff',
    color: '#535a66',
    padding: '0 14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '13px',
    cursor: 'pointer'
  }}>
    <Icon size={15} />
    {children}
  </button>
);

const RouteCard = () => (
  <div style={{
    marginTop: '14px',
    borderRadius: '8px',
    border: '1px solid #efe1d2',
    background: 'linear-gradient(135deg, #fff7ee 0%, #fbefe3 100%)',
    padding: '16px 18px'
  }}>
    <h4 style={{ margin: '0 0 14px', color: '#9b482e', fontSize: '15px', fontWeight: 800 }}>
      赤坎老街经典寻味路线（半日游）
    </h4>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(92px, 1fr))',
      gap: '8px',
      alignItems: 'start'
    }}>
      {routeStops.map((stop, idx) => (
        <div key={stop.name} style={{ position: 'relative', minWidth: 0 }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#9b482e',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontSize: '11px',
            fontWeight: 700,
            marginBottom: '8px'
          }}>
            {stop.index}
          </div>
          {idx < routeStops.length - 1 && (
            <div style={{
              position: 'absolute',
              top: '9px',
              left: '30px',
              right: '-2px',
              height: '1px',
              background: '#d7b198'
            }} />
          )}
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2d3139', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {stop.name}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#8f7565' }}>
            特色：{stop.desc}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MessageBubble = ({ msg, index }) => {
  const isUser = msg.role === 'user';
  const cleanText = String(msg.text || '').replace(/\*\*/g, '');
  const showRouteCard = !isUser && index > 0 && /路线|赤坎|老街|推荐/.test(cleanText);

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: isUser ? '30px' : '24px'
    }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: isUser ? '#dfe8f5' : '#f2dfcf',
        color: isUser ? '#425a78' : '#a14e32',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }}>
        {isUser ? <UserRound size={23} /> : <Bot size={23} />}
      </div>

      <div style={{
        maxWidth: isUser ? '34%' : '68%',
        minWidth: isUser ? '260px' : '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start'
      }}>
        <div style={{
          width: '100%',
          padding: isUser ? '13px 20px' : (index === 0 ? '4px 0 0' : '14px 16px'),
          borderRadius: isUser ? '8px' : '8px',
          background: isUser ? 'linear-gradient(180deg, #f3e4d5 0%, #f6eadf 100%)' : (index === 0 ? 'transparent' : '#fff'),
          border: isUser ? '1px solid #ead8c9' : (index === 0 ? 'none' : '1px solid #e7e7e7'),
          color: '#171b22',
          fontSize: '15px',
          lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
          boxShadow: index === 0 ? 'none' : '0 10px 26px rgba(64, 45, 31, 0.04)'
        }}>
          {index === 0 && !isUser ? (
            <strong style={{ display: 'block', fontWeight: 800, marginBottom: '4px' }}>
              👋 你好！我是寻味湛江 AI 助手
            </strong>
          ) : null}
          {cleanText}
          {showRouteCard ? <RouteCard /> : null}
          {showRouteCard ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
              <ActionButton icon={MapPin}>查看路线地图</ActionButton>
              <ActionButton icon={Utensils}>更多赤坎美食</ActionButton>
              <ActionButton icon={RefreshCw}>换个口味推荐</ActionButton>
            </div>
          ) : null}
        </div>
        <span style={{
          marginTop: '7px',
          fontSize: '12px',
          color: '#9aa0aa',
          alignSelf: isUser ? 'flex-end' : 'flex-start'
        }}>
          15:29
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
