"use client"
import React from 'react'
import {useState} from 'react'

const FoodMap=()=>{

    const [messages,setMessages] = useState([
        {role:"assistant",text:"嘿！我是寻味小助手。想知道赤坎老街怎么走，还是想找找湛江最正宗的白切鸡？"}
    ])

    const [suggestions,setSuggestions] = useState(['赤坎老街寻味路线','寻找湛江最鲜生蚝','湛江下午茶推荐'])
    const [input,setInput] = useState('')
    const [loading,setLoading] = useState(false)

 //核心对话逻辑
  const handleSend = async(queryText)=>{
      const query = queryText || input;
      if(!query || loading) return

      //立刻更新UI，显示用户发送内容
      setMessages(prev=>[...prev,{role:'user',text:query}])
      setInput('')
      setLoading(true);

      try{
          const response = await fetch(`${process.env.NEXT_PUBLIC_DIFY_API_URL}/chat-messages`,{
              method:'POST',
              headers:{
                  'Authorization':`Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
                  'Content-Type':'application/json'
              },
              body:JSON.stringify({
                  inputs:{},
                  query:query,
                  response_mode:'blocking',
                  user:'zhanjiang_explorer' // 顺手帮你把拼写修正了
              })
          });

          // 【关键修改区：抓取真实报错信息】
          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error("Dify 详细报错:", errorData);
              // 把 Dify 传回来的具体报错信息提取出来
              const exactReason = errorData.message || errorData.code || `HTTP ${response.status}`;
              throw new Error(exactReason);
          }
          
          const data = await response.json();

          //3.将AI回答加入消息列表
          setMessages(prev=>[...prev,{role:'assistant',text:data.answer}]);

          //4.动态更新词条索引
          if(data.metadata?.suggested_questions){
              setSuggestions(data.metadata.suggested_questions)
          }
      }catch(error){
          console.error("完整报错：", error);
          // 让 AI 气泡直接显示具体报错原因
          setMessages(prev => [...prev, { 
              role: 'assistant', 
              text: `请求失败了 😭 原因是：${error.message}` 
          }]);
      }finally{
          setLoading(false)
      }
  }
    return(
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 消息流区域 */}
      <div style={{ height: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px', scrollBehavior: 'smooth' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              backgroundColor: msg.role === 'user' ? '#007AFF' : '#F2F2F7', 
              color: msg.role === 'user' ? '#fff' : '#1D1D1F', 
              padding: '12px 18px', 
              borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
              fontSize: '15px', 
              lineHeight: '1.5',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: '12px', color: '#86868B', textAlign: 'center', marginTop: '10px' }}>正在为你规划寻味路线...</div>}
      </div>

      {/* 动态词条索引区 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '24px 0' }}>
        {suggestions.map((tag, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(tag)} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '20px', 
              border: '1px solid #E5E5EA', 
              backgroundColor: '#fff', 
              fontSize: '13px', 
              color: '#3A3A3C',
              cursor: 'pointer', 
              transition: 'background-color 0.2s' 
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#F2F2F7'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 输入框区域 */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#F9F9F9', padding: '8px', borderRadius: '16px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="问问湛江美食..."
          style={{ 
            flex: 1, 
            padding: '10px 12px', 
            borderRadius: '10px', 
            border: 'none', 
            outline: 'none', 
            fontSize: '16px', 
            backgroundColor: 'transparent' 
          }}
        />
        <button 
          onClick={() => handleSend()} 
          style={{ 
            padding: '10px 20px', 
            borderRadius: '10px', 
            backgroundColor: '#007AFF', 
            color: '#fff', 
            border: 'none', 
            fontWeight: '600', 
            fontSize: '14px',
            cursor: 'pointer' 
          }}
        >
          发送
        </button>
      </div>
    </div>
    )
}

export default FoodMap