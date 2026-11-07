"use client";
import React from 'react';

const AIAgentLayout = ({ leftSidebar, mainChatArea }) => {
  const navOffset = 80;

  return (
    <div className="px-3 py-3 sm:px-6 lg:px-[52px] lg:py-[18px]" style={{
      position: 'fixed',
      top: `${navOffset}px`,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, #fffdf9 0%, #fbf7f0 100%)',
      boxSizing: 'border-box',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute',
        inset: 'auto 0 0 0',
        height: '150px',
        opacity: 0.28,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(232,190,151,0.18) 100%)'
      }} />
      <div style={{
        position: 'absolute',
        left: '0',
        right: '0',
        bottom: '0',
        height: '110px',
        opacity: 0.22,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(to top, #d7a77a 0 38px, transparent 38px),
          linear-gradient(to top, #d7a77a 0 78px, transparent 78px),
          linear-gradient(to top, #d7a77a 0 58px, transparent 58px),
          linear-gradient(to top, #d7a77a 0 96px, transparent 96px),
          linear-gradient(to top, #d7a77a 0 44px, transparent 44px)
        `,
        backgroundSize: '62px 100%, 78px 100%, 92px 100%, 66px 100%, 120px 100%',
        backgroundPosition: '4% bottom, 12% bottom, 88% bottom, 95% bottom, 76% bottom',
        backgroundRepeat: 'no-repeat'
      }} />

      <div className="grid-cols-[minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]" style={{
        width: '100%',
        maxWidth: '1340px',
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gap: '24px',
        position: 'relative',
        zIndex: 1,
        alignItems: 'stretch'
      }}>
        <aside className="hidden lg:block" style={{ minWidth: 0, height: '100%', overflow: 'hidden' }}>
          {leftSidebar}
        </aside>
        <main style={{ minWidth: 0, height: '100%', overflow: 'hidden' }}>
          {mainChatArea}
        </main>
      </div>
    </div>
  );
};

export default AIAgentLayout;
