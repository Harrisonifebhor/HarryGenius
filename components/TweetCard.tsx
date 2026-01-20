
import React, { useState } from 'react';
import { TweetReply } from '../types.ts';

interface TweetCardProps {
  reply: TweetReply;
  theme: 'dark' | 'light';
  onRemove: (id: string) => void;
  onGenerate: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

const TweetCard: React.FC<TweetCardProps> = ({ reply, theme, onRemove, onGenerate, onUpdateText }) => {
  const [copied, setCopied] = useState(false);

  const handlePostReply = () => {
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(reply.generatedText)}&in_reply_to=${reply.tweetId}`;
    window.open(intentUrl, '_blank');
  };

  const handleLikeTweet = () => {
    const intentUrl = `https://twitter.com/intent/like?tweet_id=${reply.tweetId}`;
    window.open(intentUrl, '_blank');
  };

  const handleCopyError = () => {
    const errorText = reply.error || "unknown structural failure in the architect's logic.";
    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = reply.status === 'analyzing' || reply.status === 'generating';

  const truncateUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname + parsed.pathname.substring(0, 15) + '...';
    } catch {
      return url.substring(0, 30) + '...';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 group flex flex-col h-full transform hover:-translate-y-1 hover:border-purple-500/50 ${isDark ? 'hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]' : 'hover:shadow-[0_15px_40px_rgba(139,92,246,0.1)]'}`}>
      <div className={`px-5 py-3 flex justify-between items-center border-b transition-colors ${isDark ? 'bg-white/5 border-white/5 group-hover:bg-white/[0.08]' : 'bg-slate-50 border-purple-100 group-hover:bg-purple-50/50'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${isDark ? 'bg-purple-600/20 text-purple-400 border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white' : 'bg-purple-100 text-purple-700 border-purple-200 group-hover:bg-purple-600 group-hover:text-white'}`}>
            <i className="fa-brands fa-x-twitter"></i>
          </div>
          <span className={`text-[11px] font-bold truncate tracking-tight transition-colors ${isDark ? 'text-purple-300/60 group-hover:text-purple-300' : 'text-slate-700 group-hover:text-purple-900'}`}>
            {truncateUrl(reply.originalUrl)}
          </span>
        </div>
        <button 
          onClick={() => onRemove(reply.id)}
          className={`transition-all p-1.5 rounded-lg active:scale-90 ${isDark ? 'text-white/20 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
        >
          <i className="fas fa-trash-can text-sm"></i>
        </button>
      </div>

      <div className="p-6 flex-grow flex flex-col justify-center">
        {reply.status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border group-hover:scale-110 transition-all duration-500 shadow-inner ${isDark ? 'bg-white/5 border-white/10 group-hover:border-purple-500/40' : 'bg-purple-50 border-purple-200 group-hover:border-purple-500/50'}`}>
              <i className="fas fa-sparkles text-purple-600 text-xl group-hover:animate-pulse"></i>
            </div>
            <button
              onClick={() => onGenerate(reply.id)}
              className={`px-8 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98] border shadow-sm ${isDark ? 'bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border-purple-500/20' : 'bg-white hover:btn-purple-gradient text-purple-700 hover:text-white border-purple-200'}`}
            >
              draft intelligence
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-6">
            <div className="relative">
               <div className="w-12 h-12 border-2 border-purple-500/10 border-t-purple-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 blur-xl bg-purple-600/30 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-bold text-purple-600 tracking-[0.3em] uppercase">processing data</p>
              <p className={`text-xs italic font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>syncing with the architect...</p>
            </div>
          </div>
        )}

        {reply.status === 'completed' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative group/text">
              <textarea
                value={reply.generatedText}
                onChange={(e) => onUpdateText(reply.id, e.target.value)}
                className={`w-full border rounded-xl p-5 text-sm min-h-[140px] focus:ring-0 focus:outline-none transition-all resize-none leading-relaxed custom-scrollbar shadow-inner font-medium ${isDark ? 'bg-black/40 border-white/5 text-purple-50 focus:border-purple-500/50 group-hover/text:bg-black/60' : 'bg-slate-50 border-purple-100 text-slate-900 focus:border-purple-400 group-hover/text:bg-white'}`}
                placeholder="drafting brilliance..."
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover/text:opacity-100 transition-opacity">
                <div className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-widest border ${isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
                  editable
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePostReply}
                className="col-span-2 py-3.5 btn-purple-gradient text-white rounded-xl text-sm font-bold tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <i className="fa-brands fa-x-twitter text-lg"></i>
                post reply
              </button>
              <button
                onClick={handleLikeTweet}
                className={`py-3 rounded-xl text-[11px] font-bold tracking-widest transition-all border flex items-center justify-center gap-2 active:scale-95 ${isDark ? 'bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 border-white/5' : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-200 shadow-sm'}`}
              >
                <i className="fas fa-heart text-red-500"></i>
                like
              </button>
              <button
                onClick={() => onGenerate(reply.id)}
                className={`py-3 rounded-xl text-[11px] font-bold tracking-widest transition-all border flex items-center justify-center gap-2 active:scale-95 ${isDark ? 'bg-white/5 hover:bg-purple-500/10 text-white/70 hover:text-purple-400 border-white/5' : 'bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border-slate-200 shadow-sm'}`}
              >
                <i className="fas fa-arrows-rotate"></i>
                re-draft
              </button>
            </div>
          </div>
        )}

        {reply.status === 'error' && (
          <div className={`p-6 rounded-2xl space-y-5 animate-in shake duration-500 border ${isDark ? 'bg-red-500/[0.03] border-red-500/20' : 'bg-red-50 border-red-100'}`}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
                <i className="fas fa-ghost text-red-500 text-xl"></i>
              </div>
              <div>
                <h4 className="text-red-500 text-sm font-bold tracking-[0.2em] mb-1 uppercase">architectural rift</h4>
                <p className={`text-xs leading-relaxed max-w-[220px] font-medium ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
                  apologies, the ai encountered a data storm. the target post might be restricted or deleted.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onGenerate(reply.id)}
                className="py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all border border-red-600 tracking-widest active:scale-[0.98]"
              >
                recalibrate
              </button>
              <button
                onClick={handleCopyError}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/5' : 'bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border-slate-200 shadow-sm'} ${copied ? 'border-green-500/30 text-green-600' : ''}`}
              >
                {copied ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
                {copied ? 'copied' : 'logs'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetCard;
