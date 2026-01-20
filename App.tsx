
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Tone, ReplyLength, TweetReply, GenerationSettings } from './types.ts';
import SettingsPanel from './components/SettingsPanel.tsx';
import TweetCard from './components/TweetCard.tsx';
import { generateTwitterReply } from './services/geminiService.ts';

const App: React.FC = () => {
  const [linksInput, setLinksInput] = useState('');
  const [replies, setReplies] = useState<TweetReply[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    tone: Tone.CASUAL,
    length: ReplyLength.MEDIUM,
    customPrompt: '',
  });
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const processingCount = useMemo(() => 
    replies.filter(r => r.status === 'analyzing' || r.status === 'generating').length
  , [replies]);

  const extractTweetId = (url: string) => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : '';
  };

  const handleAddLinks = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = linksInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('http') && (line.includes('twitter.com') || line.includes('x.com')));

    const newReplies: TweetReply[] = urls.slice(0, 50).map(url => ({
      id: uuidv4(),
      originalUrl: url,
      tweetId: extractTweetId(url),
      generatedText: '',
      status: 'idle',
    }));

    setReplies(prev => {
      const combined = [...prev, ...newReplies];
      return combined.slice(0, 50);
    });
    setLinksInput('');
  };

  const generateReply = useCallback(async (id: string) => {
    setReplies(prev => prev.map(r => r.id === id ? { ...r, status: 'generating', error: undefined } : r));

    try {
      let targetUrl = '';
      setReplies(prev => {
        const found = prev.find(r => r.id === id);
        if (found) targetUrl = found.originalUrl;
        return prev;
      });

      const result = await generateTwitterReply(targetUrl, settings.tone, settings.length, settings.customPrompt);
      setReplies(prev => prev.map(r => r.id === id ? { ...r, generatedText: result, status: 'completed' } : r));
    } catch (err: any) {
      setReplies(prev => prev.map(r => r.id === id ? { ...r, status: 'error', error: err.message } : r));
    }
  }, [settings]);

  const handleGenerateAll = async () => {
    if (isGeneratingAll) return;
    setIsGeneratingAll(true);
    
    const pendingReplies = replies.filter(r => r.status !== 'completed' && r.status !== 'generating');
    
    try {
      await Promise.all(pendingReplies.map(reply => generateReply(reply.id)));
    } catch (e) {
      console.error("Batch processing error", e);
    }
    
    setIsGeneratingAll(false);
  };

  const handleRemove = (id: string) => {
    setReplies(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateText = (id: string, text: string) => {
    setReplies(prev => prev.map(r => r.id === id ? { ...r, generatedText: text } : r));
  };

  const clearAll = () => {
    if (window.confirm('Discard all drafts and clear links?')) {
      setReplies([]);
    }
  };

  const isDark = theme === 'dark';

  const BrandName = () => (
    <div className="flex items-center leading-none select-none">
      <div className="flex items-baseline rotate-[-2deg]">
        <span className={`font-graffiti text-3xl lg:text-5xl brand-glow ${isDark ? 'text-white' : 'text-purple-950'}`}>H</span>
        <span className={`font-graffiti text-2xl lg:text-4xl brand-glow -ml-0.5 ${isDark ? 'text-white' : 'text-purple-900'}`}>arry</span>
      </div>
      <div className="flex items-baseline ml-1 mt-1">
        <span className={`font-drip inline-block bg-clip-text text-transparent text-3xl lg:text-5xl ${isDark ? 'bg-gradient-to-b from-fuchsia-400 to-purple-600' : 'bg-gradient-to-b from-purple-600 to-purple-900'}`}>G</span>
        <span className={`font-drip inline-block bg-clip-text text-transparent text-2xl lg:text-4xl -ml-1 ${isDark ? 'bg-gradient-to-b from-fuchsia-400 to-purple-600' : 'bg-gradient-to-b from-purple-700 to-purple-950'}`}>enius</span>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col selection:bg-purple-500/30 selection:text-purple-200 transition-colors duration-500`}>
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-900/10 blur-[120px] rounded-full -z-10"></div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-4 transition-colors duration-300 ${isDark ? 'bg-[#030014]/60 border-white/5' : 'bg-white/60 border-purple-100'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <BrandName />
          </div>

          <button 
            onClick={toggleTheme}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border ${isDark ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 shadow-sm'}`}
          >
            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
          </button>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-12 space-y-12">
        {/* Top Section */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <section className="glass-card rounded-2xl p-8 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-800 via-purple-600 to-fuchsia-800 rounded-t-2xl"></div>
              <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-purple-950'}`}>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                   <i className="fas fa-link text-purple-600 text-sm"></i>
                </div>
                target url intake
              </h2>
              <form onSubmit={handleAddLinks} className="space-y-6">
                <div className="relative group">
                  <textarea
                    value={linksInput}
                    onChange={(e) => setLinksInput(e.target.value)}
                    placeholder="paste tweet links here... (one per line)"
                    className={`w-full h-40 border rounded-2xl p-5 transition-all resize-none leading-relaxed font-mono text-sm focus:ring-4 focus:ring-purple-500/5 focus:outline-none ${isDark ? 'bg-black/40 border-white/10 text-purple-50 placeholder:text-white/20' : 'bg-white border-purple-100 text-slate-900 placeholder:text-slate-400'}`}
                  />
                  <div className={`absolute bottom-4 right-4 text-[10px] font-bold tracking-widest ${isDark ? 'text-white/10' : 'text-slate-300'}`}>
                    limit: 50 / session
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!linksInput.trim()}
                  className={`w-full py-4 text-white font-bold rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 tracking-widest text-sm btn-purple-gradient`}
                >
                  <i className="fas fa-radar"></i>
                  ingest threads
                </button>
              </form>
            </section>
          </div>

          <div className="lg:col-span-4 h-full">
            <SettingsPanel settings={settings} setSettings={setSettings} theme={theme} />
          </div>
        </div>

        {/* Replies Section */}
        {replies.length > 0 && (
          <div className="space-y-8 animate-in fade-in duration-1000">
            <div className={`flex items-center justify-between border-b pb-6 ${isDark ? 'border-white/5' : 'border-purple-200'}`}>
              <div className="space-y-1">
                <h3 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-purple-950'}`}>
                  <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <i className="fas fa-layer-group text-purple-600 text-xs"></i>
                  </span>
                  drafting queue
                </h3>
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/30' : 'text-slate-500'}`}>
                  {replies.length} items collected • {processingCount} in process
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={clearAll}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border tracking-widest active:scale-95 ${isDark ? 'bg-white/5 hover:bg-red-500/10 text-white/40 border-white/5 hover:text-red-400' : 'bg-slate-100 hover:bg-red-50 text-slate-600 border-slate-200 hover:text-red-600'}`}
                >
                  purge all
                </button>
                <button
                  onClick={handleGenerateAll}
                  disabled={isGeneratingAll || replies.every(r => r.status === 'completed')}
                  className="px-8 py-2.5 btn-purple-gradient text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:grayscale tracking-widest active:scale-95 flex items-center gap-2"
                >
                  {isGeneratingAll ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-bolt"></i>}
                  ignite batch
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {replies.map((reply) => (
                <TweetCard
                  key={reply.id}
                  reply={reply}
                  theme={theme}
                  onRemove={handleRemove}
                  onGenerate={generateReply}
                  onUpdateText={handleUpdateText}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {replies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in zoom-in duration-1000">
            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border float-animation relative ${isDark ? 'bg-white/5 border-white/5' : 'bg-purple-50 border-purple-100'}`}>
              <div className="absolute inset-0 blur-2xl bg-purple-600/10 rounded-full"></div>
              <i className={`fa-brands fa-x-twitter text-5xl ${isDark ? 'text-white/10' : 'text-purple-300'}`}></i>
            </div>
            <div className="space-y-2">
              <h3 className={`text-2xl font-bold tracking-tighter ${isDark ? 'text-white' : 'text-purple-950'}`}>engage with intelligence</h3>
              <p className={`text-sm max-w-sm mx-auto font-medium leading-relaxed ${isDark ? 'text-purple-300/40' : 'text-slate-500'}`}>
                Our ai analyzes thread context and trends to draft hyper-relevant replies that drive conversion and reach.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className={`py-12 border-t mt-auto ${isDark ? 'border-white/5 bg-[#030014]/40' : 'border-purple-100 bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>crafted by</span>
            <a 
              href="https://x.com/Ui_webharry" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`font-syne text-sm font-bold bg-clip-text text-transparent transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400' : 'bg-gradient-to-r from-purple-700 via-fuchsia-700 to-purple-900'}`}
            >
              ʊɨ_աɛɮɦǟʀʀʏ⚡
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
