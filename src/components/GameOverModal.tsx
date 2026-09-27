import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Home,
  Trophy,
  Zap,
  Mountain,
  Flame,
  Globe,
  CheckCircle2,
  LogIn,
  Send,
} from 'lucide-react';
import { HighScoreRecord, PlayerStats } from '../types';
import { auth, googleProvider, signInWithPopup } from '../firebase/config';
import { submitScore } from '../firebase/leaderboardService';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface GameOverModalProps {
  stats: PlayerStats;
  highScore: HighScoreRecord | null;
  isNewRecord: boolean;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onOpenLeaderboard: () => void;
}

const AVATAR_OPTIONS = [
  { key: 'miner', icon: '⛏️', name: 'Miner' },
  { key: 'knight', icon: '⚔️', name: 'Knight' },
  { key: 'engineer', icon: '⚡', name: 'Tech' },
  { key: 'volt', icon: '🔮', name: 'Volt' },
  { key: 'scout', icon: '🧭', name: 'Scout' },
];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  isNewRecord,
  onPlayAgain,
  onMainMenu,
  onOpenLeaderboard,
}) => {
  const distanceKm = (stats.distance / 1000).toFixed(2);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [runnerName, setRunnerName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('miner');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && !runnerName) {
        setRunnerName(user.displayName?.split(' ')[0] || 'VoxelRunner');
      }
    });
    return () => unsub();
  }, [runnerName]);

  const handleGoogleSignIn = async () => {
    setSubmitError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user && !runnerName) {
        setRunnerName(cred.user.displayName?.split(' ')[0] || 'VoxelRunner');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      if (!msg.includes('popup-closed-by-user')) {
        setSubmitError(msg);
      }
    }
  };

  const handleSubmitScore = async () => {
    if (!currentUser) return;
    if (stats.score <= 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitScore({
        userId: currentUser.uid,
        playerName: runnerName.trim() || currentUser.displayName || 'Voxel Champion',
        score: stats.score,
        distance: stats.distance,
        gCores: stats.gCores,
        maxCombo: stats.maxCombo,
        eventsSurvived: stats.eventsSurvived,
        avatar: selectedAvatar,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Submit score error:', err);
      setSubmitError('Failed to post score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="game-over-modal"
      className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-30 select-none animate-fadeIn overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-stone-900/95 border-2 border-stone-700 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center my-auto">
        {/* Header */}
        <div className="relative mb-2">
          {isNewRecord && (
            <div className="mb-2 px-3.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-lg animate-bounce inline-block">
              ⭐ NEW PERSONAL RECORD! ⭐
            </div>
          )}
          <h2 className="text-4xl sm:text-5xl font-black text-red-500 tracking-wider font-mono drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)]">
            RUN OVER!
          </h2>
        </div>

        {/* Final Score Hero */}
        <div className="w-full my-3 p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold font-mono">
            FINAL SCORE
          </span>
          <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-wider tabular-nums my-1">
            {stats.score.toLocaleString()}
          </span>
          {highScore && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300/80 mt-1 font-mono">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>ALL-TIME BEST: {highScore.score.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Detailed Run Statistics */}
        <div className="w-full grid grid-cols-4 gap-2 my-2 text-center">
          {/* Distance */}
          <div className="bg-stone-800/60 p-2 sm:p-2.5 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-400 text-[10px] font-semibold mb-0.5">
              <Mountain className="w-3 h-3 text-sky-400" />
              <span>DIST</span>
            </div>
            <span className="text-sm sm:text-base font-black text-white font-mono">{distanceKm} KM</span>
          </div>

          {/* G-Cores */}
          <div className="bg-stone-800/60 p-2 sm:p-2.5 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-400 text-[10px] font-semibold mb-0.5">
              <span>💎</span>
              <span>CORES</span>
            </div>
            <span className="text-sm sm:text-base font-black text-cyan-300 font-mono">{stats.gCores}</span>
          </div>

          {/* Highest Combo */}
          <div className="bg-stone-800/60 p-2 sm:p-2.5 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-400 text-[10px] font-semibold mb-0.5">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>COMBO</span>
            </div>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono">×{stats.maxCombo}</span>
          </div>

          {/* Events Survived */}
          <div className="bg-stone-800/60 p-2 sm:p-2.5 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-400 text-[10px] font-semibold mb-0.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>EVENTS</span>
            </div>
            <span className="text-sm sm:text-base font-black text-orange-300 font-mono">
              {stats.eventsSurvived}
            </span>
          </div>
        </div>

        {/* Global Leaderboard Submission Panel */}
        <div className="w-full my-2.5 p-3.5 bg-stone-950/90 rounded-2xl border border-amber-500/30 flex flex-col gap-2.5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase text-amber-300 font-mono tracking-wider">
                GLOBAL LEADERBOARD
              </span>
            </div>

            <button
              onClick={onOpenLeaderboard}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span>View Board</span>
            </button>
          </div>

          {submitted ? (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Score posted to Global Leaderboard!</span>
              </div>
              <button
                onClick={onOpenLeaderboard}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors"
              >
                View Rank
              </button>
            </div>
          ) : currentUser ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={25}
                  value={runnerName}
                  onChange={(e) => setRunnerName(e.target.value)}
                  placeholder="Your Runner Name"
                  className="flex-1 bg-stone-900 border border-stone-700 px-3 py-1.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />

                {/* Avatar selector */}
                <div className="flex items-center gap-1">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.key}
                      onClick={() => setSelectedAvatar(av.key)}
                      title={av.name}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                        selectedAvatar === av.key
                          ? 'bg-amber-500 ring-2 ring-amber-300 scale-105'
                          : 'bg-stone-800 hover:bg-stone-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-submit-score-gameover"
                onClick={handleSubmitScore}
                disabled={isSubmitting || stats.score <= 0}
                className="w-full py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl text-xs font-mono flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'SUBMIT SCORE TO LEADERBOARD'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
              <span className="text-[11px] text-stone-400 font-mono">
                Compete globally and immortalize this run!
              </span>
              <button
                id="btn-signin-gameover"
                onClick={handleGoogleSignIn}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl text-xs font-mono flex items-center gap-1.5 shrink-0 shadow cursor-pointer transition-transform active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in & Post</span>
              </button>
            </div>
          )}

          {submitError && (
            <div className="text-[11px] text-red-400 font-mono">{submitError}</div>
          )}
        </div>

        {/* Action Buttons Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 mt-2">
          {/* PLAY AGAIN */}
          <button
            id="btn-play-again"
            onClick={onPlayAgain}
            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          {/* LEADERBOARD */}
          <button
            id="btn-gameover-leaderboard"
            onClick={onOpenLeaderboard}
            className="py-3 px-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-amber-400/40"
          >
            <Trophy className="w-4 h-4" />
            <span>BOARD</span>
          </button>

          {/* MENU */}
          <button
            id="btn-gameover-menu"
            onClick={onMainMenu}
            className="py-3 px-3 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-stone-200 font-bold text-xs sm:text-sm rounded-xl border border-stone-600 shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
