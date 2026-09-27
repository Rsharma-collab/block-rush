import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Globe,
  User,
  Calendar,
  Zap,
  Mountain,
  Trash2,
  LogIn,
  LogOut,
  RefreshCw,
  Award,
  Crown,
  Medal,
} from 'lucide-react';
import { HighScoreRecord } from '../types';
import {
  LeaderboardEntry,
  subscribeToLeaderboard,
  DEFAULT_CHAMPIONS,
  deleteScore,
} from '../firebase/leaderboardService';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface LeaderboardModalProps {
  records: HighScoreRecord[];
  onClose: () => void;
  onClearRecords: () => void;
  initialTab?: 'global' | 'personal';
}

const AVATAR_MAP: Record<string, { label: string; icon: string; bg: string }> = {
  miner: { label: 'Voxel Miner', icon: '⛏️', bg: 'bg-amber-600/30 text-amber-300' },
  knight: { label: 'Iron Knight', icon: '⚔️', bg: 'bg-cyan-600/30 text-cyan-300' },
  engineer: { label: 'Redstone Tech', icon: '⚡', bg: 'bg-red-600/30 text-red-300' },
  volt: { label: 'Volt Walker', icon: '🔮', bg: 'bg-purple-600/30 text-purple-300' },
  scout: { label: 'Ender Scout', icon: '🧭', bg: 'bg-emerald-600/30 text-emerald-300' },
};

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  records,
  onClose,
  onClearRecords,
  initialTab = 'global',
}) => {
  const [tab, setTab] = useState<'global' | 'personal'>(initialTab);
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>(DEFAULT_CHAMPIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Monitor auth status
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to real-time global leaderboard
  useEffect(() => {
    setIsLoading(true);
    try {
      const unsub = subscribeToLeaderboard((entries) => {
        if (entries && entries.length > 0) {
          setGlobalEntries(entries);
        } else {
          // Fall back to default champions if no entries exist yet
          setGlobalEntries(DEFAULT_CHAMPIONS);
        }
        setIsLoading(false);
      }, 50);

      return () => unsub();
    } catch {
      setIsLoading(false);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was interrupted';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError(msg);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    }
  };

  const handleDeleteScore = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to remove this score from the leaderboard?')) {
      return;
    }
    setDeletingId(entryId);
    try {
      await deleteScore(entryId);
    } catch (err: unknown) {
      console.error('Failed to delete score:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      id="leaderboard-modal"
      className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-40 select-none animate-fadeIn"
    >
      <div className="w-full max-w-2xl bg-stone-900/95 border-2 border-stone-700 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-2xl border border-amber-500/40 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                BLOCK RUSH LEADERBOARD
              </h3>
              <p className="text-xs text-stone-400 font-mono">Compete with voxel runners worldwide</p>
            </div>
          </div>

          <button
            id="btn-close-leaderboard"
            onClick={onClose}
            className="p-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account / Auth Bar */}
        <div className="my-3 px-4 py-2.5 bg-stone-950/70 border border-stone-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-2">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Player'}
                  className="w-8 h-8 rounded-full border border-emerald-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs">
                  {(currentUser.displayName || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <span>{currentUser.displayName || 'Voxel Champion'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 truncate max-w-[200px]">{currentUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
              <User className="w-4 h-4 text-stone-500" />
              <span>Sign in with Google to post your high scores to the global leaderboard!</span>
            </div>
          )}

          <div>
            {currentUser ? (
              <button
                id="btn-auth-signout"
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                id="btn-auth-signin"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl text-xs font-mono flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSigningIn ? 'Connecting...' : 'Sign In with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="mb-2 px-3 py-1.5 bg-red-950/60 border border-red-700/60 rounded-xl text-red-300 text-xs font-mono">
            {authError}
          </div>
        )}

        {/* Tabs Control */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-2 mb-3">
          <button
            id="tab-global-leaderboard"
            onClick={() => setTab('global')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
              tab === 'global'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-800/60 text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>GLOBAL TOP SCORES</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
              {globalEntries.length}
            </span>
          </button>

          <button
            id="tab-personal-records"
            onClick={() => setTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer ${
              tab === 'personal'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-800/60 text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>MY LOCAL RUNS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20">
              {records.length}
            </span>
          </button>
        </div>

        {/* Content List Area */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[250px] max-h-[50vh]">
          {tab === 'global' ? (
            /* GLOBAL LEADERBOARD */
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400 font-mono text-xs gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span>Loading latest global scores...</span>
              </div>
            ) : globalEntries.length === 0 ? (
              <div className="text-center py-12 text-stone-400 font-mono text-sm">
                <Trophy className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                <p>No global entries yet.</p>
                <p className="text-xs text-stone-500 mt-1">Be the first champion to submit a run!</p>
              </div>
            ) : (
              globalEntries.map((entry, idx) => {
                const isUserEntry = currentUser && entry.userId === currentUser.uid;
                const avatarInfo = AVATAR_MAP[entry.avatar] || AVATAR_MAP['miner'];

                return (
                  <div
                    key={entry.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/40 border-amber-500/70 shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
                        : idx === 1
                        ? 'bg-gradient-to-r from-stone-800/80 to-stone-900 border-stone-400/50'
                        : idx === 2
                        ? 'bg-gradient-to-r from-amber-900/40 to-stone-900 border-amber-700/50'
                        : isUserEntry
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                    }`}
                  >
                    {/* Rank & Player Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Badge */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black font-mono text-sm shrink-0 shadow ${
                          idx === 0
                            ? 'bg-amber-400 text-stone-950'
                            : idx === 1
                            ? 'bg-stone-300 text-stone-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {idx === 0 ? (
                          <Crown className="w-5 h-5 fill-stone-950" />
                        ) : idx === 1 ? (
                          <Medal className="w-5 h-5 text-stone-950" />
                        ) : idx === 2 ? (
                          <Medal className="w-5 h-5 text-amber-200" />
                        ) : (
                          `#${idx + 1}`
                        )}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border border-white/10 ${avatarInfo.bg}`}
                        title={avatarInfo.label}
                      >
                        <span>{avatarInfo.icon}</span>
                      </div>

                      {/* Name & Sub details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-mono truncate">
                            {entry.playerName}
                          </span>
                          {isUserEntry && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 font-mono font-bold rounded border border-emerald-500/40 shrink-0">
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono mt-0.5">
                          <span className="text-sky-300 flex items-center gap-0.5">
                            <Mountain className="w-3 h-3" />
                            {(entry.distance / 1000).toFixed(2)} KM
                          </span>
                          <span>•</span>
                          <span className="text-cyan-300 flex items-center gap-0.5">
                            💎 {entry.gCores}
                          </span>
                          <span>•</span>
                          <span className="text-amber-300 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" />
                            ×{entry.maxCombo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Actions */}
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <div className="text-base sm:text-lg font-black text-amber-300 font-mono tabular-nums leading-tight">
                          {entry.score.toLocaleString()}
                          <span className="text-[10px] text-amber-400/80 font-normal ml-1">PTS</span>
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {isUserEntry && (
                        <button
                          onClick={() => handleDeleteScore(entry.id)}
                          disabled={deletingId === entry.id}
                          className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete My Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* PERSONAL LOCAL RUNS */
            records.length === 0 ? (
              <div className="text-center py-12 text-stone-400 font-mono text-sm">
                <Award className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                <p>No local runs saved yet.</p>
                <p className="text-xs text-stone-500 mt-1">Play Block Rush to set your personal records!</p>
              </div>
            ) : (
              records.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    idx === 0
                      ? 'bg-amber-950/40 border-amber-500/50 shadow-md'
                      : 'bg-stone-950/60 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-mono text-xs ${
                        idx === 0
                          ? 'bg-amber-500 text-stone-950'
                          : idx === 1
                          ? 'bg-stone-300 text-stone-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm sm:text-base font-black text-white font-mono leading-tight">
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

                  <div className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(rec.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between mt-auto">
          {tab === 'personal' && records.length > 0 ? (
            <button
              id="btn-clear-local-records"
              onClick={onClearRecords}
              className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer font-mono"
            >
              Clear Local Records
            </button>
          ) : (
            <span className="text-[11px] text-stone-500 font-mono">
              ⚡ Top 50 global records synced live
            </span>
          )}

          <button
            id="btn-close-modal-bottom"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs sm:text-sm font-mono"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
