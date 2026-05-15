"use client";
import React from 'react';

const SuggestionTag = ({ text, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: '34px',
        padding: '0 18px',
        borderRadius: '999px',
        border: '1px solid #ead9c8',
        background: '#fffdfb',
        fontSize: '13px',
        color: '#9b482e',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 16px rgba(83, 49, 25, 0.03)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#fff6ee';
        e.currentTarget.style.borderColor = '#d8b89f';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#fffdfb';
        e.currentTarget.style.borderColor = '#ead9c8';
      }}
    >
      {text}
    </button>
  );
};

export default SuggestionTag;
