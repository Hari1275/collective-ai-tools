import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Plus, Code, Wrench, Terminal, X } from 'lucide-react';
import { Select } from './ui/select';

export default function SubmitTool() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // UI States
  const [activeTab, setActiveTab] = useState<'mcp' | 'tool'>('tool');
  const [mcpSubtype, setMcpSubtype] = useState<'server' | 'client'>('server');

  const [data, setData] = useState({
    name: '',
    description: '',
    url: '', // Website or Repo URL
    categories: [] as string[],
    pricing: '',
    tags: '',
    location: 'Remote' // Default for MCP queries
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableCategories, setAvailableCategories] = useState<{_id: string, name: string}[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    fetch('/api/filters')
      .then(res => res.json())
      .then(d => {
        if (d.categories) setAvailableCategories(d.categories);
      })
      .catch(console.error);
  }, []);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sign in to Submit</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You need an account to submit new tools or servers.</p>
        <button
          onClick={() => navigate('/login', { state: { from: location.pathname } })}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Determine the API submission type
    let finalType = 'tool';
    if (activeTab === 'mcp') {
        finalType = mcpSubtype === 'server' ? 'mcp' : 'client';
    }

    try {
        const submissionData = {
            ...data,
            tags: data.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: finalType,
                data: submissionData
            })
        });

        if (!res.ok) {
            throw new Error('Submission failed');
        }

        setSuccess(true);
        setData({ name: '', description: '', url: '', categories: [], pricing: '', tags: '', location: 'Remote' });
    } catch (err) {
        setError('Failed to submit. Please try again.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  if (success) {
    return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Submission Received!</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Thank you for contributing. Your submission is under review and will be listed once approved.
            </p>
            <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Submit Another
            </button>
        </div>
    );
  }

  // Helper properties for conditional rendering
  const isMcpServer = activeTab === 'mcp' && mcpSubtype === 'server';
  const isMcpClient = activeTab === 'mcp' && mcpSubtype === 'client';
  const isTool = activeTab === 'tool';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit a Resource</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Share a new AI tool or MCP resource with the community.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setActiveTab('tool')}
                className={`flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'tool' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                <Wrench className="h-5 w-5" />
                AI Tool
            </button>
            <button
                onClick={() => setActiveTab('mcp')}
                className={`flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'mcp' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                <Code className="h-5 w-5" />
                MCP Resource
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {error}
                </div>
            )}

            {/* MCP Subtype Selection */}
            {activeTab === 'mcp' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg inline-flex relative w-full border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setMcpSubtype('server')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mcpSubtype === 'server' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Code className="h-4 w-4" />
                            MCP Server
                        </button>
                        <button
                            type="button"
                            onClick={() => setMcpSubtype('client')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mcpSubtype === 'client' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-gray-200 dark:ring-gray-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Terminal className="h-4 w-4" />
                            MCP Client
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {mcpSubtype === 'server' 
                            ? 'A server that provides context or capabilities to an AI model.' 
                            : 'An application (like Claude Desktop) that connects to MCP servers.'}
                    </p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData({...data, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder={`e.g. ${isMcpServer ? 'PostgreSQL MCP Server' : isMcpClient ? 'Claude Desktop' : 'ChatGPT'}`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                    required
                    value={data.description}
                    onChange={(e) => setData({...data, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Briefly describe what it does..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isMcpServer ? 'Repository URL' : isMcpClient ? 'Download/Repo URL' : 'Website URL'}
                </label>
                <input
                    type="url"
                    required
                    value={data.url}
                    onChange={(e) => setData({...data, url: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Categories (Select multiple)
                    </label>
                    <div className="flex flex-col gap-2">
                        {/* Selected Pills */}
                        {data.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {availableCategories.filter(cat => data.categories.includes(cat._id)).map(cat => (
                                    <span key={cat._id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {cat.name}
                                        <button 
                                            type="button"
                                            onClick={() => setData({ ...data, categories: data.categories.filter(id => id !== cat._id)})}
                                            className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors focus:outline-hidden"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Combobox */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search and select categories..."
                                value={categorySearch}
                                onChange={(e) => {
                                    setCategorySearch(e.target.value);
                                    setIsCategoryOpen(true);
                                }}
                                onFocus={() => setIsCategoryOpen(true)}
                                onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                            
                            {isCategoryOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {availableCategories.length === 0 ? (
                                        <div className="p-3 text-sm text-gray-500 text-center">Loading categories...</div>
                                    ) : (
                                        (() => {
                                            const filtered = availableCategories.filter(cat => 
                                                cat.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
                                                !data.categories.includes(cat._id)
                                            );
                                            
                                            if (filtered.length === 0) {
                                                return <div className="p-3 text-sm text-gray-500 text-center">No categories found.</div>;
                                            }
                                            
                                            return filtered.map(cat => (
                                                <button
                                                    key={cat._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setData({ ...data, categories: [...data.categories, cat._id] });
                                                        setCategorySearch('');
                                                        setIsCategoryOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                                                >
                                                    {cat.name}
                                                </button>
                                            ));
                                        })()
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {activeTab === 'mcp' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                         <Select
                            value={data.location}
                            onChange={(val) => setData({...data, location: val})}
                            options={[
                                { value: 'Remote', label: 'Remote' },
                                { value: 'Local', label: 'Local' }
                            ]}
                            buttonClassName="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                )}

                {isTool && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pricing</label>
                         <Select
                            value={data.pricing}
                            onChange={(val) => setData({...data, pricing: val})}
                            options={[
                                { value: '', label: 'Select pricing' },
                                { value: 'Free', label: 'Free' },
                                { value: 'Freemium', label: 'Freemium' },
                                { value: 'Paid', label: 'Paid' },
                                { value: 'Trial', label: 'Free Trial' }
                            ]}
                            buttonClassName="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                        />
                    </div>
                )}
            </div>

            <div className="">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input
                    type="text"
                    value={data.tags}
                    onChange={(e) => setData({...data, tags: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma separated tags (e.g. free, open source)"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Resource'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
