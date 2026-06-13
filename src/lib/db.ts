import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { UserProfile, BodyMeasurement } from "@/types/profile";
import type { WorkoutHistoryEntry } from "@/types/workout";

const DB_NAME = "persfit";
const PROFILE_KEY = "current_user";

const STORES = {
  PROFILE: "profile",
  HISTORY: "history",
  MEASUREMENTS: "measurements",
} as const;

interface PersFitDB extends DBSchema {
  [STORES.PROFILE]: { key: string; value: UserProfile };
  [STORES.HISTORY]: {
    key: string;
    value: WorkoutHistoryEntry;
    indexes: { "by-finished": string };
  };
  [STORES.MEASUREMENTS]: {
    key: string;
    value: BodyMeasurement;
    indexes: { "by-recorded": string };
  };
}

let dbPromise: Promise<IDBPDatabase<PersFitDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PersFitDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORES.PROFILE);

        db.createObjectStore(STORES.HISTORY, { keyPath: "id" }).createIndex(
          "by-finished",
          "finishedAt"
        );

        db.createObjectStore(STORES.MEASUREMENTS, {
          keyPath: "id",
        }).createIndex("by-recorded", "recordedAt");
      },
    });
  }
  return dbPromise;
};

export const saveProfile = async (profileData: UserProfile) => {
  const db = await initDB();
  const previous = await db.get(STORES.PROFILE, PROFILE_KEY);

  await db.put(STORES.PROFILE, profileData, PROFILE_KEY);

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
  return db.get(STORES.PROFILE, PROFILE_KEY);
};

export const saveWorkoutHistory = async (entry: WorkoutHistoryEntry) => {
  const db = await initDB();
  await db.put(STORES.HISTORY, entry);
};

export const getWorkoutHistory = async (): Promise<WorkoutHistoryEntry[]> => {
  const db = await initDB();
  const all = await db.getAllFromIndex(STORES.HISTORY, "by-finished");
  return all.reverse();
};

export const deleteWorkoutHistory = async (id: string) => {
  const db = await initDB();
  await db.delete(STORES.HISTORY, id);
};

const measurementsEqual = (
  a: { weight: number; height: number },
  b: { weight: number; height: number }
) => a.weight === b.weight && a.height === b.height;

export const saveBodyMeasurement = async (measurement: BodyMeasurement) => {
  const db = await initDB();
  await db.put(STORES.MEASUREMENTS, measurement);
};

export const getBodyMeasurements = async (): Promise<BodyMeasurement[]> => {
  const db = await initDB();
  return db.getAllFromIndex(STORES.MEASUREMENTS, "by-recorded");
};

async function getLastMeasurement(): Promise<BodyMeasurement | undefined> {
  const all = await getBodyMeasurements();
  return all[all.length - 1];
}
