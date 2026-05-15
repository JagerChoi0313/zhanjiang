"use client";
import React from 'react';
import { SendHorizontal } from 'lucide-react';

const InputController = ({ input, setInput, handleSend, loading }) => {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #d9c1ae',
      borderRadius: '8px',
      padding: '12px 14px 10px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 24px rgba(139, 69, 19, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="问问湛江美食..."
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            backgroundColor: 'transparent',
            color: '#333',
            height: '30px'
          }}
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading}
          aria-label="发送"
          style={{
            background: 'linear-gradient(180deg, #a95a3d 0%, #914426 100%)',
            color: '#fff',
            border: 'none',
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            display: 'grid',
            placeItems: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: '0.2s ease',
            opacity: loading ? 0.58 : 1,
            flexShrink: 0
          }}
        >
          <SendHorizontal size={22} strokeWidth={2.1} />
        </button>
      </div>
    </div>
  );
};

export default InputController;
