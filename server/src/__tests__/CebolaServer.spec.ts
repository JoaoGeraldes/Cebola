import { CebolaServer } from "../CebolaServer.ts";
import fs from "fs";
import path from "path";
import { auth, relativePath } from "../config.ts";
import { absolutePath } from "../utils/utils.ts";

const dummyEntryIds = ["entry1", "entry2", "entry3"];
const dummyEntryIds2 = [
  "entry1",
  "entry2",
  "entry3",
  "entry4",
  "entry5",
  "entry6",
  "entry7",
  "entry8",
  "entry9",
  "entry10",
];
const privateKey = `${auth.adminCredentials.username}+${auth.adminCredentials.password}`;

describe.skip("3 ENTRIES SUITE", () => {
  it("Should delete all entries and backups before proceed...", async () => {
    const hasDeletedAll = await deleteAllEntries();
    expect(hasDeletedAll).toBe(true);
  });

  it("Should create 7 files (3 new entries + 1 tail + 3 backup files).", async () => {
    const dummyEntry = {
      id: undefined,
      domain: undefined,
      password: undefined,
      username: undefined,
      description: undefined,
      date: undefined,
      keywords: undefined,
      tail: undefined,
    };
    for await (const entryId of dummyEntryIds) {
      await CebolaServer.createEntry(dummyEntry, entryId, privateKey);
    }

    const entriesCount = await filesInDirectoryCount(relativePath.entries);
    expect(entriesCount).toBe(7);
  });

  it("Should have the right pointers on each entry.", async () => {
    for (const entryId of dummyEntryIds) {
      const entryData = await CebolaServer.getEntry(entryId);

      const isFirstEntry = entryId === dummyEntryIds[0];
      const isLastEntry = entryId === dummyEntryIds[dummyEntryIds.length - 1];

      if (isFirstEntry) {
        expect(entryData).toMatchObject({
          nextEntryId: "entry2",
          previousEntryId: null,
        });
      }
      if (isLastEntry) {
        expect(entryData).toMatchObject({
          nextEntryId: null,
          previousEntryId: "entry2",
        });
      }

      if (!isFirstEntry && !isLastEntry) {
        expect(entryData).toMatchObject({
          nextEntryId: "entry3",
          previousEntryId: "entry1",
        });
      }
    }
  });

  it("Should delete all entries from /database/entries", async () => {
    for (const id of dummyEntryIds) {
      await CebolaServer.deleteEntry(id);
    }
  });
});

describe.skip("10 ENTRIES SUITE", () => {
  it("Should delete all entries and backups before proceed...", async () => {
    const hasDeletedAll = await deleteAllEntries();
    expect(hasDeletedAll).toBe(true);
  });

  it.only("Should create 21 files (10 new entries + 1 tail + 10 backup files).", async () => {
    const dummyEntry = {
      id: undefined,
      domain: undefined,
      password: undefined,
      username: undefined,
      description: undefined,
      date: undefined,
      keywords: undefined,
      tail: undefined,
    };
    for await (const entryId of dummyEntryIds2) {
      await CebolaServer.createEntry(dummyEntry, entryId, privateKey);
    }

    const entriesCount = await filesInDirectoryCount(relativePath.entries);
    expect(entriesCount).toBe(21);
  });

  it("The tail should be `entry10`", async () => {
    const tail = await CebolaServer.getTailId();

    expect(tail).toBe("entry10");
  });

  it("Tail should be `entry9` upon deleting `entry10`", async () => {
    await CebolaServer.deleteEntry("entry10");

    const tail = await CebolaServer.getTailId();

    expect(tail).toBe("entry9");
  });

  it("Head should be `entry2` upon deleting `entry1`", async () => {
    await CebolaServer.deleteEntry("entry1");

    const entry2 = await CebolaServer.getEntry("entry2");

    if (entry2) {
      expect(entry2.previousEntryId).toBe(null);
      expect(entry2.nextEntryId).toBe("entry3");
    } else {
      expect(false).toBe(true);
    }
  });

  it("Should have the right pointers on each entry.", async () => {
    for (const entryId of dummyEntryIds2) {
      const entryData = await CebolaServer.getEntry(entryId);

      const isFirstEntry = entryId === dummyEntryIds2[0];
      const isLastEntry = entryId === dummyEntryIds2[dummyEntryIds2.length - 1];

      if (isFirstEntry) {
        expect(entryData).toMatchObject({
          nextEntryId: "entry2",
          previousEntryId: null,
        });
      }
      if (isLastEntry) {
        expect(entryData).toMatchObject({
          nextEntryId: null,
          previousEntryId: "entry2",
        });
      }

      if (!isFirstEntry && !isLastEntry) {
        expect(entryData).toMatchObject({
          nextEntryId: "entry3",
          previousEntryId: "entry1",
        });
      }
    }
  });

  it("Should delete all entries from /database/entries", async () => {
    for (const id of dummyEntryIds) {
      await CebolaServer.deleteEntry(id);
    }
  });
});

// Utils
/**
 * Deletes all files within /entries
 */
async function deleteAllEntries() {
  return new Promise((resolve, reject) => {
    const entriesRelativePath = relativePath.entries;
    /* const absoluteEntriesPath = path.resolve(entriesRelativePath); */
    const absoluteEntriesPath = absolutePath(entriesRelativePath);

    // Read the contents of the folder
    fs.readdir(absoluteEntriesPath, (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err}`);
        reject(false);
      }

      for (const file of files) {
        const filePath = path.join(absoluteEntriesPath, file);
        const totalFiles = files.length;
        let filesDeleted = 0;

        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
            reject(false);
            return;
          }
          console.log(`Deleted file: ${filePath}`);
        });

        if (filesDeleted >= totalFiles) {
          resolve(true);
        }
      }

      resolve(true);
    });
  });
}

async function filesInDirectoryCount(directory: string) {
  return new Promise((resolve, reject) => {
    fs.readdir(relativePath.entries, (err, files) => {
      if (err) {
        console.log(err);
        reject(false);
      } else {
        resolve(files.length);
      }
    });
  });
}
