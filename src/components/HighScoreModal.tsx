import React from 'react';
import { X, Trophy, Calendar, Sparkles } from 'lucide-react';
import { HighScoreRecord } from '../types';

interface HighScoreModalProps {
  records: HighScoreRecord[];
  onClose: () => void;
  onClearRecords: () => void;
}

export const HighScoreModal: React.FC<HighScoreModalProps> = ({ records, onClose, onClearRecords }) => {
  return (
    <div id="high-score-modal" className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-stone-900/95 border-2 border-stone-700 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-black text-white font-mono uppercase tracking-wider">HALL OF FAME</h3>
          </div>
          <button
            id="btn-close-highscores"
            onClick={onClose}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
          {records.length === 0 ? (
            <div className="text-center py-8 text-stone-400 font-mono text-sm">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
              <p>No runs recorded yet.</p>
              <p className="text-xs text-stone-500 mt-1">Jump into the runner to set your high score!</p>
            </div>
          ) : (
            records.slice(0, 10).map((rec, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  idx === 0
                    ? 'bg-amber-950/40 border-amber-500/50 shadow-md'
                    : 'bg-stone-950/60 border-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-mono text-sm ${
                      idx === 0
                        ? 'bg-amber-500 text-black'
                        : idx === 1
                        ? 'bg-stone-300 text-stone-900'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-base font-black text-white font-mono leading-tight">
                      {rec.score.toLocaleString()} <span className="text-xs font-normal text-amber-300">PTS</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono mt-0.5">
                      <span>{(rec.distance / 1000).toFixed(2)} KM</span>
                      <span>•</span>
                      <span>💎 {rec.gCores}</span>
                      <span>•</span>
                      <span>×{rec.maxCombo} Combo</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(rec.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
          {records.length > 0 ? (
            <button
              id="btn-clear-records"
              onClick={onClearRecords}
              className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Clear Records
            </button>
          ) : (
            <span />
          )}
          <button
            id="btn-close-records"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-sm"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
