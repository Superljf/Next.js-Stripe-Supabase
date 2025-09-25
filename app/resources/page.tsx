'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  }
];

export default function ResourcesPage() {
  const [resources, setResources] = useState(mockResources);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: ''
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingResource) {
      // 更新资源
      setResources(prev => 
        prev.map(resource => 
          resource.id === editingResource.id 
            ? { ...resource, ...formData } 
            : resource
        )
      );
    } else {
      // 添加新资源
      const newResource = {
        id: Date.now().toString(),
        ...formData
      };
      setResources(prev => [newResource, ...prev]);
    }
    
    // 重置表单
    setFormData({ name: '', description: '', url: '' });
    setShowForm(false);
    setEditingResource(null);
  };

  const handleEdit = (resource: any) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      description: resource.description,
      url: resource.url
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setResources(prev => prev.filter(resource => resource.id !== id));
  };

  const handleAddNew = () => {
    setEditingResource(null);
    setFormData({ name: '', description: '', url: '' });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            资料分享管理
          </h1>
          <p className="mt-3 text-xl text-zinc-300">
            管理和分享您的学习资源
          </p>
        </div>

        <div className="bg-zinc-900 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              资源列表
            </h2>
            <Button
              onClick={handleAddNew}
              className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
            >
              添加资源
            </Button>
          </div>

          {showForm && (
            <div className="px-6 py-6 border-b border-zinc-700 bg-zinc-800">
              <h3 className="text-lg font-medium text-white mb-4">
                {editingResource ? '编辑资源' : '添加新资源'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                    资源名称
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">
                    资源描述
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="url" className="block text-sm font-medium text-zinc-300 mb-1">
                    资源链接
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingResource(null);
                    }}
                    className="bg-zinc-600 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                  >
                    {editingResource ? '更新资源' : '添加资源'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="divide-y divide-zinc-700">
            {resources.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-zinc-400">
                  暂无资源，请添加您的第一个资源
                </p>
              </div>
            ) : (
              resources.map((resource) => (
                <div key={resource.id} className="px-6 py-4 hover:bg-zinc-800 transition duration-150">
                  <div className="flex justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-white truncate">
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
                    <div className="ml-4 flex items-center space-x-2">
                      <Button
                        onClick={() => handleCopy(resource.url, resource.id)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-1 px-3 rounded transition duration-300"
                      >
                        {copiedId === resource.id ? '已复制!' : '复制链接'}
                      </Button>
                      <Button
                        onClick={() => handleEdit(resource)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-300"
                      >
                        编辑
                      </Button>
                      <Button
                        onClick={() => handleDelete(resource.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-300"
                      >
                        删除
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