import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onMainMenu }) => {
  return (
    <div id="pause-modal" className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-stone-900/95 border-2 border-stone-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-black text-white tracking-widest font-mono mb-6 uppercase">
          GAME PAUSED
        </h2>

        <div className="flex flex-col gap-3 w-full">
          <button
            id="btn-resume-game"
            onClick={onResume}
            className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME</span>
          </button>

          <button
            id="btn-restart-game"
            onClick={onRestart}
            className="w-full py-3.5 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl border border-stone-600 shadow flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RESTART RUN</span>
          </button>

          <button
            id="btn-pause-mainmenu"
            onClick={onMainMenu}
            className="w-full py-3.5 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl border border-stone-600 shadow flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Home className="w-5 h-5" />
            <span>QUIT TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
