"use client";

const DB_NAME = "setgoria-offline";
const DB_VERSION = 1;
const STORE = "matches";

export interface OfflinePrediction {
  id: string;
  matchId?: string;
  type: string;
  probability: number;
  isPremium: boolean;
}

export interface OfflineMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string; 
  sport: string;
  // 👈 Nuevos campos
  status?: "NS" | "LIVE" | "HT" | "FT" | "CANC";
  homeScore?: number | null;
  awayScore?: number | null;
  elapsed?: number | null;
  predictions: OfflinePrediction[];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no disponible"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMatchesOffline(matches: OfflineMatch[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    matches.forEach((m) => store.put(m));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMatchesOffline(): Promise<OfflineMatch[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as OfflineMatch[]);
    req.onerror = () => reject(req.error);
  });
}
