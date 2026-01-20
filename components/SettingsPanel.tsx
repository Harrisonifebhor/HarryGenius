
import React from 'react';
import { Tone, ReplyLength, GenerationSettings } from '../types.ts';

interface SettingsPanelProps {
  settings: GenerationSettings;
  setSettings: (s: GenerationSettings) => void;
  theme: 'dark' | 'light';
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, theme }) => {
  const tones = Object.values(Tone);
  const lengths = Object.values(ReplyLength);
  const isDark = theme === 'dark';

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl relative overflow-hidden group h-full space-y-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl -z-10 group-hover:bg-purple-600/20 transition-all duration-500"></div>
      
      <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-purple-500' : 'text-purple-700'}`}>
        <i className="fas fa-wand-magic-sparkles"></i>
        Model settings
      </h2>
      
      <div className="space-y-8">
        <div>
          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>desired tone</label>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setSettings({ ...settings, tone: t })}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                  settings.tone === t
                    ? 'btn-purple-gradient text-white border-transparent shadow-lg'
                    : isDark 
                      ? 'bg-white/5 text-slate-400 border-white/5 hover:bg-purple-900/20 hover:text-purple-400' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>reply length</label>
          <div className={`flex p-1.5 rounded-xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
            {lengths.map((l) => (
              <button
                key={l}
                onClick={() => setSettings({ ...settings, length: l })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  settings.length === l
                    ? 'btn-purple-gradient text-white shadow-lg'
                    : isDark
                      ? 'text-slate-400 hover:text-purple-400'
                      : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>custom prompt DNA</label>
          <textarea
            value={settings.customPrompt}
            onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
            placeholder="e.g. mention my product 'Flux' or avoid using emojis..."
            className={`w-full h-24 border rounded-xl p-3 text-xs transition-all resize-none leading-relaxed focus:ring-4 focus:ring-purple-500/5 focus:outline-none ${isDark ? 'bg-black/40 border-white/10 text-purple-50 placeholder:text-white/20' : 'bg-white border-purple-100 text-slate-900 placeholder:text-slate-400'}`}
          />
          <p className={`mt-2 text-[9px] font-medium leading-tight ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
            Override or add specific behaviors to the AI's logic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
