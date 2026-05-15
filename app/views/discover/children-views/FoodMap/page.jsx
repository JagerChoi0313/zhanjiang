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
    const query = queryText || input;   //判断用户是点击词条进来的（queryText），还是输入文字进来的（input）
    if (!query || loading) return;      //如果什么都没输入，或者AI在思考就直接return

    setMessages((prev) => [...prev, { role: 'user', text: query }]);//一有内容，立刻把你的话追加到聊天记录里面
    setInput('');   //清空输入框
    setLoading(true);     //亮起红灯，告诉页面去请求数据

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIFY_API_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },    //fetch带着API密钥和用户问的问题，按照Dify的格式进行POST请求，敲开Dify的大门
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
      //请求成功
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
