/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB } from "idb";

const DB_NAME = "PersFitDB";
const STORE_NAME = "user_profile";

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if(!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const saveProfile = async (profileData: any) => {
  const db = await initDB();
  await db.put(STORE_NAME, profileData, 'current_user');
};

export const getProfile = async () => {
  const db = await initDB();
  return db.get(STORE_NAME, 'current_user');
};