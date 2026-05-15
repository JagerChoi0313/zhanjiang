"use client";
import React, { useState } from 'react';
import AIAgentLayout from './Component/AIAgentLayout';
import LeftSider from './Component/LeftSider';
import ChatArea from './Component/ChatArea';

const FoodMap = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '无论你想找地道美食、特色小吃，还是经典路线，我都能帮你规划！\n你可以试着问我：赤坎老街有什么好吃的？或者寻找湛江最新鲜生蚝在哪里？'
    }
  ]);

  const [suggestions, setSuggestions] = useState([
    '寻找湛江最新鲜生蚝',
    '湛江下午茶推荐',
    '霞山区必吃美食',
    '适合带家人吃的餐厅'
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText) => {
    const query = queryText || input;
    if (!query || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIFY_API_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {},
          query: query,
          response_mode: 'blocking',
          user: 'zhanjiang_explorer'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Dify 详细报错:', errorData);
        const exactReason = errorData.message || errorData.code || `HTTP ${response.status}`;
        throw new Error(exactReason);
      }

      const data = await response.json();

      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);

      if (data.metadata?.suggested_questions) {
        setSuggestions(data.metadata.suggested_questions);
      }
    } catch (error) {
      console.error('完整报错:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `请求失败了 😢 原因是：${error.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIAgentLayout
      leftSidebar={
        <LeftSider
          onQuestionClick={handleSend}
        />
      }
      mainChatArea={
        <ChatArea
          messages={messages}
          suggestions={suggestions}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          loading={loading}
        />
      }
    />
  );
};

export default FoodMap;
