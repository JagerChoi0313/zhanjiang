"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Camera, SendHorizontal, X } from 'lucide-react';

const InputController = ({ input, setInput, handleSend, loading, photo, setPhoto }) => {
  const picker = useRef(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (photo && preview) return () => URL.revokeObjectURL(preview);
  }, [photo, preview]);

  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
      setError('请选择 5 MB 以内的 JPG、PNG 或 WebP 图片。');
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(file));
    setPhoto(file);
  };
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
      <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={selectPhoto} />
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => picker.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border border-[#ead9c8] bg-[#fff7ee] px-3 py-1.5 text-sm font-semibold text-[#914426] hover:bg-[#f4e2d2] focus-visible:outline-2 focus-visible:outline-[#914426] disabled:opacity-50"
        >
          <Camera size={16} aria-hidden="true" />
          拍照识美食
        </button>
      </div>
      {photo && (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-[#ead9c8] bg-[#fffaf5] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          {preview && <img src={preview} alt="待识别的美食照片" className="size-12 shrink-0 rounded-md object-cover" />}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-[#914426]">{photo.name}</div>
            <div className="text-xs text-[#746256]">已选照片，可直接发送识别</div>
          </div>
          <button type="button" disabled={loading} aria-label="移除照片" onClick={() => { setPhoto(null); setError(''); }}
            className="rounded-md p-2 text-[#914426] hover:bg-[#f4e2d2] disabled:opacity-50">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      {error && <p role="alert" className="mb-2 text-sm text-[#914426]">{error}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
          maxLength={500}
          disabled={loading}
          placeholder={photo ? '想问照片里的什么？' : '问问湛江美食…'}
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
