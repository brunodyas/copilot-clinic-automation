import { beforeEach, describe, expect, it, vi } from "vitest";

const openDBMock = vi.fn();

vi.mock("idb", () => ({
	openDB: openDBMock,
}));

describe("offline db and queue", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it("throws on server-side access", async () => {
		vi.stubGlobal("window", undefined);
		const { getDB } = await import("@/lib/offline-db");
		expect(() => getDB()).toThrow("IndexedDB is only available in the browser");
	});

	it("initializes db once and creates tasks store when missing", async () => {
		vi.stubGlobal("window", {} as Window & typeof globalThis);
		const db = {
			objectStoreNames: { contains: vi.fn(() => false) },
			createObjectStore: vi.fn(),
			put: vi.fn(),
			getAll: vi.fn(() => [{ id: "1" }]),
			clear: vi.fn(),
		};

		openDBMock.mockImplementation(async (_name, _version, opts) => {
			opts.upgrade(db);
			return db;
		});

		const { getDB } = await import("@/lib/offline-db");
		const d1 = await getDB();
		const d2 = await getDB();

		expect(d1).toBe(db);
		expect(d2).toBe(db);
		expect(openDBMock).toHaveBeenCalledTimes(1);
		expect(db.createObjectStore).toHaveBeenCalledWith("tasks", {
			keyPath: "id",
		});

		const { addtoQueue, getQueue, clearQueue } =
			await import("@/lib/offline-queue");
		await addtoQueue({
			__typename: "Task",
			id: "1",
			title: "t",
			status: "TODO",
			projectId: "p",
		});
		await getQueue();
		await clearQueue();

		expect(db.put).toHaveBeenCalledWith(
			"tasks",
			expect.objectContaining({ id: "1" }),
		);
		expect(db.getAll).toHaveBeenCalledWith("tasks");
		expect(db.clear).toHaveBeenCalledWith("tasks");
	});

	it("does not create store when it already exists", async () => {
		vi.stubGlobal("window", {} as Window & typeof globalThis);
		const db = {
			objectStoreNames: { contains: vi.fn(() => true) },
			createObjectStore: vi.fn(),
		};
		openDBMock.mockImplementation(async (_name, _version, opts) => {
			opts.upgrade(db);
			return db;
		});

		const { getDB } = await import("@/lib/offline-db");
		await getDB();

		expect(db.createObjectStore).not.toHaveBeenCalled();
	});
});
