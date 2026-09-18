import React from 'react';
import { X, Volume2, Music, Sun, Smartphone } from 'lucide-react';
import { GameSettings } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings, onClose }) => {
  return (
    <div id="settings-modal" className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-stone-900/95 border-2 border-stone-700 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <h3 className="text-xl font-black text-white font-mono uppercase tracking-wider">SETTINGS</h3>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-5 py-5">
          {/* Sound FX */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Sound Effects</span>
              </div>
              <input
                type="checkbox"
                id="toggle-sfx"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
            {settings.soundEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            )}
          </div>

          {/* Music */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm">
                <Music className="w-4 h-4 text-cyan-400" />
                <span>Chiptune BGM</span>
              </div>
              <input
                type="checkbox"
                id="toggle-music"
                checked={settings.musicEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, musicEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
            {settings.musicEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            )}
          </div>

          {/* Touch Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>On-Screen Touch Buttons</span>
            </div>
            <input
              type="checkbox"
              id="toggle-touch"
              checked={settings.touchControlsVisible}
              onChange={(e) => onUpdateSettings({ ...settings, touchControlsVisible: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Dynamic Shadows */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-200 font-semibold text-sm">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span>Dynamic Shadows</span>
            </div>
            <input
              type="checkbox"
              id="toggle-shadows"
              checked={settings.shadowsEnabled}
              onChange={(e) => onUpdateSettings({ ...settings, shadowsEnabled: e.target.checked })}
              className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 text-center">
          <button
            id="btn-settings-save"
            onClick={onClose}
            className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
