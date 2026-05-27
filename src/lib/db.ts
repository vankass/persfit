import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { UserProfile } from "@/types/profile";
import type { WorkoutHistoryEntry } from "@/types/workout";
import type { BodyMeasurement } from "@/types/measurement";

const DB_NAME = "PersFitDB";
const PROFILE_STORE = "user_profile";
const HISTORY_STORE = "workout_history";
const MEASUREMENTS_STORE = "body_measurements";
const PROFILE_KEY = "current_user";
const DB_VERSION = 2;

interface PersFitDB extends DBSchema {
  [PROFILE_STORE]: { key: string; value: UserProfile };
  [HISTORY_STORE]: {
    key: string;
    value: WorkoutHistoryEntry;
    indexes: { "by-finished": string };
  };
  [MEASUREMENTS_STORE]: {
    key: string;
    value: BodyMeasurement;
    indexes: { "by-recorded": string };
  };
}

let dbPromise: Promise<IDBPDatabase<PersFitDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PersFitDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PROFILE_STORE))
          db.createObjectStore(PROFILE_STORE);
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          db.createObjectStore(HISTORY_STORE, { keyPath: "id" }).createIndex(
            "by-finished",
            "finishedAt"
          );
        }
        if (!db.objectStoreNames.contains(MEASUREMENTS_STORE)) {
          db.createObjectStore(MEASUREMENTS_STORE, {
            keyPath: "id",
          }).createIndex("by-recorded", "recordedAt");
        }
      },
    });
  }
  return dbPromise;
};

async function getLastMeasurement(): Promise<BodyMeasurement | undefined> {
  const all = await getBodyMeasurements();
  return all[all.length - 1];
}

const measurementsEqual = (
  a: { weight: number; height: number },
  b: { weight: number; height: number }
) => a.weight === b.weight && a.height === b.height;

export const saveBodyMeasurement = async (measurement: BodyMeasurement) => {
  const db = await initDB();
  await db.put(MEASUREMENTS_STORE, measurement);
};

export const getBodyMeasurements = async (): Promise<BodyMeasurement[]> => {
  const db = await initDB();
  return db.getAllFromIndex(MEASUREMENTS_STORE, "by-recorded");
};

export const seedBodyMeasurementFromProfile = async (profile: UserProfile) => {
  const existing = await getBodyMeasurements();
  if (existing.length > 0) return;

  await saveBodyMeasurement({
    id: crypto.randomUUID(),
    recordedAt: profile.createdAt || new Date().toISOString(),
    weight: profile.weight,
    height: profile.height,
  });
};

export const saveProfile = async (profileData: UserProfile) => {
  const db = await initDB();
  const previous = await db.get(PROFILE_STORE, PROFILE_KEY);

  await db.put(PROFILE_STORE, profileData, PROFILE_KEY);

  const shouldRecord = !previous || !measurementsEqual(previous, profileData);

  if (shouldRecord) {
    const last = await getLastMeasurement();
    if (!last || !measurementsEqual(last, profileData)) {
      await saveBodyMeasurement({
        id: crypto.randomUUID(),
        recordedAt: new Date().toISOString(),
        weight: profileData.weight,
        height: profileData.height,
      });
    }
  }
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
  return all.reverse();
};

export const deleteWorkoutHistory = async (id: string) => {
  const db = await initDB();
  await db.delete(HISTORY_STORE, id);
};
