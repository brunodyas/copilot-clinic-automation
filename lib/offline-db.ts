import { IDBPDatabase, openDB } from "idb";
let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
	if (typeof window === "undefined") {
		throw new Error("IndexedDB is only available in the browser");
	}

	if (!dbPromise) {
		dbPromise = openDB("offline-db", 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains("tasks")) {
					db.createObjectStore("tasks", { keyPath: "id" });
				}
			},
		});
	}

	return dbPromise;
}
