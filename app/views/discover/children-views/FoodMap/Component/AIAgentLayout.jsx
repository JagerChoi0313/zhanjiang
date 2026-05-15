"use client";
import React from 'react';

const AIAgentLayout = ({ leftSidebar, mainChatArea }) => {
  const navOffset = 80;

  return (
    <div style={{
      position: 'fixed',
      top: `${navOffset}px`,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, #fffdf9 0%, #fbf7f0 100%)',
      padding: '18px 52px 20px',
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

      <div style={{
        width: '100%',
        maxWidth: '1340px',
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '300px minmax(0, 1fr)',
        gap: '24px',
        position: 'relative',
        zIndex: 1,
        alignItems: 'stretch'
      }}>
        <aside style={{ minWidth: 0, height: '100%', overflow: 'hidden' }}>
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
