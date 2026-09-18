import React from 'react';
import { X, Shield, Zap, Magnet, Feather, Hammer, Compass } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div id="how-to-play-modal" className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg bg-stone-900/95 border-2 border-stone-700 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-black text-white font-mono uppercase tracking-wider">HOW TO PLAY</h3>
          </div>
          <button
            id="btn-close-howtoplay"
            onClick={onClose}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 flex flex-col gap-4 text-stone-300 text-sm">
          {/* Controls Section */}
          <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400">
              <span>⌨️ CONTROLS</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="text-amber-300 font-bold">A / ◀ Arrow:</span> Move Left
              </div>
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="text-amber-300 font-bold">D / ▶ Arrow:</span> Move Right
              </div>
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="text-emerald-300 font-bold">Space / ▲:</span> Jump
              </div>
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <span className="text-blue-300 font-bold">S / ▼ Arrow:</span> Slide
              </div>
              <div className="col-span-2 bg-stone-900 p-2 rounded-lg border border-stone-800 text-center">
                <span className="text-yellow-300 font-bold">E / Tap Build:</span> Build Bridge (Block Builder)
              </div>
            </div>
          </div>

          {/* Unique Mechanic: Block Builder */}
          <div className="bg-amber-950/40 p-4 rounded-2xl border border-amber-500/30">
            <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Hammer className="w-4 h-4 text-amber-400" />
              <span>UNIQUE MECHANIC: BLOCK BUILDER</span>
            </h4>
            <p className="text-xs leading-relaxed text-amber-100/90 mb-2">
              Collect floating 🧱 <strong>Building Blocks</strong> along the track. When a void chasm appears with a <strong>GAP AHEAD!</strong> warning, press <strong>[E]</strong> to place a temporary glowing bridge and run across!
            </p>
          </div>

          {/* Collectibles & Combo */}
          <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
            <h4 className="font-bold text-cyan-300 mb-2 text-xs uppercase tracking-wider">
              💎 G-CORES & COMBO MULTIPLIER
            </h4>
            <p className="text-xs leading-relaxed mb-2 text-stone-300">
              G-Cores are glowing energy crystals (+10 score). Collecting them consecutively elevates your combo multiplier up to <strong>×4</strong>! Taking hits or missing too many resets the combo.
            </p>
          </div>

          {/* 4 Power-Ups */}
          <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800">
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              ⚡ POWER-UPS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sky-300 block">BLOCK SHIELD</strong>
                  <span>Absorbs one collision hit safely.</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                <Zap className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-300 block">REDSTONE BOOST</strong>
                  <span>Hyper speed & double score multiplier.</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                <Magnet className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-300 block">G-CORE MAGNET</strong>
                  <span>Draws nearby collectibles automatically.</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                <Feather className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block">ELYTRA BOOST</strong>
                  <span>Lifts you into flight over ground hazards!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800">
          <button
            id="btn-howtoplay-ok"
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            GOT IT! LET&apos;S RUN
          </button>
        </div>
      </div>
    </div>
  );
};
