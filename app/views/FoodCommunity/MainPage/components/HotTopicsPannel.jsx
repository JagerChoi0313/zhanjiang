"use client";
import { useEffect, useState } from 'react';

export default function HotTopicsPannel({ location, onSelect }) {
  const [topics, setTopics] = useState(null);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTopics() {
      try {
        const response = await fetch('/API/HotTopics', { signal: controller.signal });
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.data)) throw new Error('Invalid topics');
        if (!controller.signal.aborted) setTopics(result.data);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    loadTopics();
    return () => controller.abort();
  }, []);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-semibold">🔥 热门话题</h2>
        {topics?.length > 5 && (
          <button type="button" aria-expanded={expanded} className="text-xs text-[#805741]"
            onClick={() => setExpanded(value => !value)}>{expanded ? '收起' : '查看全部'}</button>
        )}
      </div>
      <p className="mb-3 text-xs text-gray-500">按各区县的公开投稿数排行</p>
      {failed && <p role="status" className="text-sm text-gray-500">话题暂时无法加载</p>}
      {!failed && !topics && <p role="status" className="text-sm text-gray-500">正在加载话题…</p>}
      {topics?.length === 0 && <p className="text-sm text-gray-500">有新投稿后，地区话题会出现在这里。</p>}
      <ol className="space-y-1">
        {topics?.slice(0, expanded ? undefined : 5).map((topic, index) => (
          <li key={topic.location}>
            <button type="button" aria-pressed={location === topic.location}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[#faf4ef] aria-pressed:bg-[#f6ebe3]"
              onClick={() => onSelect(topic.location)}>
              <span className="w-4 shrink-0 font-semibold text-[#a63d2d]">{index + 1}</span>
              <span className="flex-1"># {topic.location}寻味</span>
              <span className="text-xs text-gray-500">{topic.postCount} 篇</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
