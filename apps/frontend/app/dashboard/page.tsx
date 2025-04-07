"use client"

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, X } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { API_BACKEND_URL } from '@/config';
import { useAuth } from '@clerk/nextjs';

interface Website {
  id: string;
  url: string;
  ticks: Tick[];
}

type UptimeStatus = 'Good' | 'Bad' | 'unknown';

interface Tick {
  id: string;
  status: UptimeStatus;
  createdAt: string;
  latency: number;
}

interface ProcessedWebsite {
  id: string;
  url: string;
  uptimeTicks: Tick[];
  status: UptimeStatus;
  uptimePercentage: number;
}

function StatusCircle({ status }: { status: UptimeStatus }) {
  return (
    <div className={`w-3 h-3 rounded-full ${status === 'Good' ? 'bg-green-500' : status === 'Bad' ? 'bg-red-500' : 'bg-gray-500'}`} />
  );
}

function aggregateTicksToWindows(ticks: Tick[]): UptimeStatus[] {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const windowSize = 3 * 60 * 1000; // 3 minutes in milliseconds
  const windows: UptimeStatus[] = Array(10).fill('unknown');

  ticks.forEach(tick => {
    const tickTime = new Date(tick.createdAt);
    if (tickTime >= thirtyMinutesAgo) {
      const timeAgo = now.getTime() - tickTime.getTime();
      const windowIndex = Math.floor(timeAgo / windowSize);
      if (windowIndex >= 0 && windowIndex < 10) {
        windows[9 - windowIndex] = tick.status;
      }
    }
  });

  return windows;
}

function UptimeGraph({ ticks }: { ticks: Tick[] }) {
  const windows = aggregateTicksToWindows(ticks);

  return (
    <div className="flex gap-1 mt-2">
      {windows.map((isUp, index) => (
        <div
          key={index}
          className={`w-8 h-4 rounded ${isUp === 'Good' ? 'bg-green-500/80' : isUp === 'Bad' ? 'bg-red-500/80' : 'bg-gray-500/80'}`}
          title={`${isUp === 'Good' ? 'Operational' : isUp === 'Bad' ? 'Down' : 'Unknown'} - Window ${index + 1}`}
        />
      ))}
    </div>
  );
}

function WebsiteCard({ website }: { website: ProcessedWebsite }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const latestTick = website.uptimeTicks[website.uptimeTicks.length - 1];

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <StatusCircle status={website.status} />
          <div className="text-left">
            <h3 className="font-semibold text-gray-100">{website.url}</h3>
            {latestTick && (
              <p className="text-sm text-gray-400">
                Latency: {latestTick.latency}ms
              </p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-4 border-t border-gray-700">
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Last 30 minutes uptime (3-minute windows)</h4>
            <UptimeGraph ticks={website.uptimeTicks} />
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>
              Status: <span className={latestTick?.status === 'Good' ? 'text-green-400' : latestTick?.status === 'Bad' ? 'text-red-400' : 'text-gray-400'}>
                {latestTick?.status === 'Good' ? 'Operational' : latestTick?.status === 'Bad' ? 'Down' : 'Unknown'}
              </span>
            </p>
            {website.uptimeTicks.length > 0 && (
              <p className="mt-1">
                First Check: {new Date(website.uptimeTicks[0].createdAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateWebsiteModal({ isOpen, onClose }: { 
  isOpen: boolean; 
  onClose: (url: string | null) => void;
}) {
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       // TODO: Implement website creation through API
//       setUrl('');
//       onClose(url);
//     } catch (error) {
//       console.error('Error creating website:', error);
//     }
//   };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">Add New Website</h2>
          <button
            onClick={() => onClose(url)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => onClose(url)}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
            >
              Add Website
            </button>
          </div>
      </div>
    </div>
  );
}

function processWebsite(website: Website): ProcessedWebsite {
  const latestTick = website.ticks[website.ticks.length - 1];
  return {
    id: website.id,
    url: website.url,
    uptimeTicks: website.ticks.map((tick: Tick) => ({
      ...tick,
      status: tick.status as UptimeStatus
    })),
    status: latestTick?.status as UptimeStatus,
    uptimePercentage: website.ticks.filter((tick: { status: UptimeStatus }) => tick.status === 'Good').length / website.ticks.length * 100 || 0
  };
}

function App() {
  const {websites, refreshWebsites} = useWebsites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getToken } = useAuth();

  const handleCreateWebsite = async (url: string | null) => {
    if (!url) {
      setIsModalOpen(false);
      return;
    }

    try {
      const token = await getToken();
      await axios.post(`${API_BACKEND_URL}/api/v1/website`, {
        url: url,
      }, {
        headers: {
          Authorization: token
        }
      });
      await refreshWebsites();
    } catch (error) {
      console.error('Error creating website:', error);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-100">Uptime Monitor</h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Website
          </button>
        </div>
        
        <div className="grid gap-4">
          {websites?.map(website => (
            <WebsiteCard key={website.id} website={processWebsite(website as Website)} />
          ))}
          {!websites && (
            <div className="text-gray-400 text-center py-8">
              Loading websites...
            </div>
          )}
        </div>

        <CreateWebsiteModal
          isOpen={isModalOpen}
          onClose={handleCreateWebsite}
        />
      </div>
    </div>
  );
}

export default App;