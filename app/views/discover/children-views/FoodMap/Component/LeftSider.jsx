"use client";
import React from 'react';
import { Bot, ChevronRight, Clock3, Compass, MapPinned, Sparkles, Utensils } from 'lucide-react';

const featureItems = [
  { icon: Compass, text: '智能推荐路线' },
  { icon: Utensils, text: '挖掘地道美食' },
  { icon: Sparkles, text: '本地人私藏攻略' },
  { icon: Clock3, text: '实时更新信息' }
];

const hotQuestions = [
  '赤坎老街寻味路线推荐',
  '寻找湛江最新鲜生蚝',
  '湛江下午茶推荐',
  '霞山区必吃美食有哪些?',
  '适合带家人吃的餐厅推荐'
];

const LeftSider = ({ onQuestionClick }) => {
  return (
    <div style={{
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <section style={{ ...cardStyle, flex: '0 0 238px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginBottom: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#f4e2d2',
            display: 'grid',
            placeItems: 'center',
            color: '#a14e32',
            flexShrink: 0
          }}>
            <Bot size={27} strokeWidth={2.3} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#9b482e', margin: 0, whiteSpace: 'nowrap' }}>
            寻味湛江 AI
          </h2>
        </div>

        <p style={{ fontSize: '13px', color: '#5f6673', lineHeight: 1.55, margin: '0 0 12px' }}>
          你的专属美食向导，带你发现湛江最地道的味道与最美的风景 ✨
        </p>

        <div style={{ display: 'grid', gap: '8px' }}>
          {featureItems.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#747985', fontSize: '13px', lineHeight: 1.25 }}>
              <Icon size={15} color="#c18462" strokeWidth={1.9} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...cardStyle, flex: '0 0 190px', padding: '15px 18px 13px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#20242c', margin: '0 0 10px' }}>
          热门问题
        </h3>
        <div style={{ display: 'grid', gap: '3px' }}>
          {hotQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onQuestionClick && onQuestionClick(question)}
              style={{
                width: '100%',
                minHeight: '25px',
                border: 'none',
                background: 'transparent',
                color: '#343946',
                cursor: 'pointer',
                padding: '3px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                textAlign: 'left',
                fontSize: '12.5px',
                lineHeight: 1.25
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {question}
              </span>
              <ChevronRight size={15} color="#b58b73" />
            </button>
          ))}
        </div>
      </section>

      <section style={{
        flex: '0 0 126px',
        marginTop: '22px',
        borderRadius: '12px',
        padding: '16px 18px',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(230, 201, 176, 0.72)',
        background: 'linear-gradient(135deg, #fff8ee 0%, #f5dfc7 100%)',
        boxShadow: '0 18px 36px rgba(149, 89, 47, 0.12)'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#9b482e', margin: '0 0 8px' }}>
          今日寻味灵感
        </h3>
        <p style={{ fontSize: '12px', color: '#8d6b58', lineHeight: 1.45, margin: '0 0 10px', maxWidth: '150px' }}>
          不知道问什么？先从老街小吃路线开始
        </p>
        <button
          type="button"
          onClick={() => onQuestionClick && onQuestionClick('赤坎老街寻味路线推荐')}
          style={{
            border: '1px solid rgba(170, 92, 54, 0.18)',
            background: '#fff',
            color: '#9b482e',
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          试试提问 →
        </button>
        <MapPinned
          size={76}
          strokeWidth={1.6}
          color="#d88846"
          style={{ position: 'absolute', right: '10px', bottom: '8px', opacity: 0.58, transform: 'rotate(-6deg)' }}
        />
      </section>
    </div>
  );
};

const cardStyle = {
  minHeight: 0,
  background: 'rgba(255,255,255,0.86)',
  border: '1px solid rgba(139, 69, 19, 0.10)',
  borderRadius: '12px',
  padding: '18px 20px 16px',
  boxShadow: '0 18px 42px rgba(70, 46, 28, 0.06)',
  overflow: 'hidden'
};

export default LeftSider;
