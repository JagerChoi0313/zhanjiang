"use client";
import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SuggestionTag from './SuggestionTag';
import InputController from './InputController';

const ChatArea = ({ messages, suggestions, input, setInput, handleSend, loading, photo, setPhoto }) => {
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const scrollEl = chatScrollRef.current;
    if (scrollEl) {
      scrollEl.scrollTo({
        top: scrollEl.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  return (
    <div style={{
      height: '100%',
      minHeight: 0,
      display: 'grid',
      gridTemplateRows: 'minmax(0, 1fr) auto',
      backgroundColor: 'rgba(255,255,255,0.84)',
      border: '1px solid rgba(139, 69, 19, 0.10)',
      borderRadius: '12px',
      boxShadow: '0 20px 52px rgba(58, 38, 24, 0.07)',
      overflow: 'hidden'
    }}>
      <div className="px-3 sm:px-[30px]" style={{
        minHeight: 0,
        overflowY: 'auto',
        paddingTop: '26px',
        paddingBottom: '10px',
        scrollBehavior: 'smooth',
        overscrollBehavior: 'contain'
      }}
      ref={chatScrollRef}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} index={i} />
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#f2dfcf',
              color: '#a14e32',
              display: 'grid',
              placeItems: 'center'
            }}>
              <Bot size={23} />
            </div>
            <div style={{
              padding: '13px 16px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              color: '#777d87',
              fontSize: '14px',
              border: '1px solid #e8e8e8',
              boxShadow: '0 10px 26px rgba(64, 45, 31, 0.04)'
            }}>
              {messages.at(-1)?.hasPhoto ? "正在识别照片里的美食…" : "正在为你寻味…"}
            </div>
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-2 sm:px-[30px]" style={{
        backgroundColor: 'rgba(255,255,255,0.72)'
      }}>
        <div className="mb-3 flex gap-2 overflow-x-auto sm:flex-wrap">
          {suggestions.map((tag, i) => (
            <SuggestionTag key={i} text={tag} onClick={() => handleSend(tag)} />
          ))}
        </div>

        <InputController
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          loading={loading}
          photo={photo}
          setPhoto={setPhoto}
        />

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#aeb3bc', marginTop: '10px' }}>
          内容由 AI 生成，仅供参考，请以实际情况为准
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
