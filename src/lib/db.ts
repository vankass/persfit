import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { UserProfile } from "@/types/profile";
import type { WorkoutHistoryEntry } from "@/types/workout";

const DB_NAME = "PersFitDB";
const PROFILE_STORE = "user_profile";
const HISTORY_STORE = "workout_history";
const PROFILE_KEY = "current_user";

interface PersFitDB extends DBSchema {
  [PROFILE_STORE]: {
    key: string;
    value: UserProfile;
  };
  [HISTORY_STORE]: {
    key: string;
    value: WorkoutHistoryEntry;
    indexes: { "by-finished": string };
  };
}

let dbPromise: Promise<IDBPDatabase<PersFitDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PersFitDB>(DB_NAME, 2, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(PROFILE_STORE)) {
          db.createObjectStore(PROFILE_STORE);
        }
        if (oldVersion < 2 && !db.objectStoreNames.contains(HISTORY_STORE)) {
          const store = db.createObjectStore(HISTORY_STORE, { keyPath: "id" });
          store.createIndex("by-finished", "finishedAt");
        }
      },
    });
  }
  return dbPromise;
};

export const saveProfile = async (profileData: UserProfile) => {
  const db = await initDB();
  await db.put(PROFILE_STORE, profileData, PROFILE_KEY);
};

export const getProfile = async (): Promise<UserProfile | undefined> => {
  const db = await initDB();
  return db.get(PROFILE_STORE, PROFILE_KEY);
};

export const saveWorkoutHistory = async (entry: WorkoutHistoryEntry) => {
  const db = await initDB();
  await db.put(HISTORY_STORE, entry);
};

export const getWorkoutHistory = async (): Promise<WorkoutHistoryEntry[]> => {
  const db = await initDB();
  const all = await db.getAllFromIndex(HISTORY_STORE, "by-finished");
  return all.sort(
    (a, b) =>
      new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
  );
};

export const getWorkoutById = async (
  id: string
): Promise<WorkoutHistoryEntry | undefined> => {
  const db = await initDB();
  return db.get(HISTORY_STORE, id);
};
