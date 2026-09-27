import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './error';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  playerName: string;
  score: number;
  distance: number;
  gCores: number;
  maxCombo: number;
  eventsSurvived: number;
  avatar: string;
  createdAt: string;
}

// Built-in Hall of Fame champions to populate the board if empty
export const DEFAULT_CHAMPIONS: LeaderboardEntry[] = [
  {
    id: 'champ-1',
    userId: 'bot-1',
    playerName: 'VoxelKnight',
    score: 48500,
    distance: 4250,
    gCores: 284,
    maxCombo: 6,
    eventsSurvived: 4,
    avatar: 'knight',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'champ-2',
    userId: 'bot-2',
    playerName: 'RedstoneAce',
    score: 36200,
    distance: 3120,
    gCores: 198,
    maxCombo: 5,
    eventsSurvived: 3,
    avatar: 'engineer',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'champ-3',
    userId: 'bot-3',
    playerName: 'CobbleCrafter',
    score: 29400,
    distance: 2680,
    gCores: 145,
    maxCombo: 4,
    eventsSurvived: 2,
    avatar: 'miner',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'champ-4',
    userId: 'bot-4',
    playerName: 'VoltStriker',
    score: 22100,
    distance: 1950,
    gCores: 110,
    maxCombo: 4,
    eventsSurvived: 2,
    avatar: 'volt',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'champ-5',
    userId: 'bot-5',
    playerName: 'EnderRunner',
    score: 16800,
    distance: 1480,
    gCores: 82,
    maxCombo: 3,
    eventsSurvived: 1,
    avatar: 'scout',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

const COLLECTION_NAME = 'leaderboard';

/**
 * Fetch top leaderboard entries from Firestore
 */
export async function fetchTopScores(limitCount = 30): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('score', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    const results: LeaderboardEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        userId: data.userId || '',
        playerName: data.playerName || 'Anonymous Runner',
        score: Number(data.score) || 0,
        distance: Number(data.distance) || 0,
        gCores: Number(data.gCores) || 0,
        maxCombo: Number(data.maxCombo) || 1,
        eventsSurvived: Number(data.eventsSurvived) || 0,
        avatar: data.avatar || 'miner',
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

/**
 * Real-time listener for leaderboard
 */
export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  limitCount = 30
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('score', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const results: LeaderboardEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          userId: data.userId || '',
          playerName: data.playerName || 'Anonymous Runner',
          score: Number(data.score) || 0,
          distance: Number(data.distance) || 0,
          gCores: Number(data.gCores) || 0,
          maxCombo: Number(data.maxCombo) || 1,
          eventsSurvived: Number(data.eventsSurvived) || 0,
          avatar: data.avatar || 'miner',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      callback(results);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
}

/**
 * Submit a score to the global leaderboard
 */
export async function submitScore(entry: Omit<LeaderboardEntry, 'id'>): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Player must be signed in to submit to the global leaderboard.');
  }

  // Generate safe document ID matching ^[a-zA-Z0-9_\-]+$
  const safeId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const cleanName = (entry.playerName || 'Voxel Runner').trim().slice(0, 30) || 'Voxel Runner';
  const cleanAvatar = (entry.avatar || 'miner').slice(0, 32);

  const payload = {
    userId: currentUser.uid,
    playerName: cleanName,
    score: Math.max(0, Math.floor(entry.score)),
    distance: Math.max(0, Math.floor(entry.distance)),
    gCores: Math.max(0, Math.floor(entry.gCores)),
    maxCombo: Math.max(1, Math.floor(entry.maxCombo)),
    eventsSurvived: Math.max(0, Math.floor(entry.eventsSurvived)),
    avatar: cleanAvatar,
    createdAt: new Date().toISOString(),
  };

  const docRef = doc(db, COLLECTION_NAME, safeId);

  try {
    await setDoc(docRef, payload);
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${safeId}`);
  }
}

/**
 * Delete a user's own score
 */
export async function deleteScore(entryId: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${entryId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
