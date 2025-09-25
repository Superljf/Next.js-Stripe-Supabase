'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

// Mock数据
const mockResources = [
  {
    id: '1',
    name: 'React学习资料',
    description: 'React官方文档和教程集合',
    url: 'https://reactjs.org/docs/getting-started.html'
  },
  {
    id: '2',
    name: 'Next.js指南',
    description: 'Next.js完整开发指南',
    url: 'https://nextjs.org/docs'
  },
  {
    id: '3',
    name: 'TypeScript手册',
    description: 'TypeScript官方手册',
    url: 'https://www.typescriptlang.org/docs/'
  },
  {
    id: '4',
    name: 'Node.js教程',
    description: 'Node.js入门到进阶教程',
    url: 'https://nodejs.org/en/docs/'
  },
  {
    id: '5',
    name: 'CSS Tricks',
    description: 'CSS技巧和最佳实践',
    url: 'https://css-tricks.com/'
  }
];

export default function PublicResourcesPage() {
  const [resources] = useState(mockResources);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            学习资源分享
          </h1>
          <p className="mt-3 text-xl text-zinc-300">
            精选的开发学习资源，助您提升技能
          </p>
        </div>

        <div className="bg-zinc-900 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-700">
            <h2 className="text-xl font-semibold text-white">
              资源列表
            </h2>
          </div>

          <div className="divide-y divide-zinc-700">
            {resources.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-zinc-400">
                  暂无资源
                </p>
              </div>
            ) : (
              resources.map((resource) => (
                <div key={resource.id} className="px-6 py-4 hover:bg-zinc-800 transition duration-150">
                  <div className="flex justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-white">
                        {resource.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {resource.description}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium bg-zinc-700 text-zinc-300 px-2 py-1 rounded truncate max-w-md">
                          {resource.url}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center">
                      <Button
                        onClick={() => handleCopy(resource.url, resource.id)}
                        className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-300"
                      >
                        {copiedId === resource.id ? '已复制!' : '复制链接'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}