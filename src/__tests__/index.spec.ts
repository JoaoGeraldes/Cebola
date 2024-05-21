import { Cebola } from "../index.ts";
import fs from "fs";
import path from "path";

const dummyEntryIds = ["entry1", "entry2", "entry3"];

describe("Add and remove entries and test their connections - pointers", () => {
  it("Should create 3 new entries.", async () => {
    const dummyEntry = {
      domain: undefined,
      password: undefined,
      username: undefined,
      description: undefined,
      date: undefined,
      keywords: undefined,
    };

    for await (const entryId of dummyEntryIds) {
      await Cebola.createEntry(dummyEntry, entryId);
    }

    const entriesCount = await filesInDirectoryCount("./src/database/entries");
    expect(entriesCount).toBe(3);
  });

  it("Should have the right pointers on each entry.", async () => {
    for (const entryId of dummyEntryIds) {
      const entryData = await Cebola.getEntry(entryId);

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
    await Cebola.updateLastInsertedEntryId(null);
    /* const hasDeletedAll = await deleteAllEntries();
    expect(hasDeletedAll).toBe(true); */

    for (const id of dummyEntryIds) {
      await Cebola.deleteEntry(id);
    }
  });
});

// Utils
/**
 * Deletes all files within /entries
 */
async function deleteAllEntries() {
  return new Promise((resolve, reject) => {
    const relativeFilePath = "./src/database/entries/";
    const absoluteFilePath = path.resolve(relativeFilePath);

    // Read the contents of the folder
    fs.readdir(absoluteFilePath, (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err}`);
        reject(false);
      }

      for (const file of files) {
        const filePath = path.join(absoluteFilePath, file);
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

      // Iterate over each file in the directory
      /*     files.forEach((file) => {
        const filePath = path.join(absoluteFilePath, file);

        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
            reject(false);
            return;
          }
          console.log(`Deleted file: ${filePath}`);
        });
      }); */

      resolve(true);
    });
  });
}

/**
 * Deletes all files within /entries
 */
function resetLastInsertedEntryId() {}

async function filesInDirectoryCount(directory: string) {
  return new Promise((resolve, reject) => {
    fs.readdir("./src/database/entries", (err, files) => {
      if (err) {
        console.log(err);
        reject(false);
      } else {
        resolve(files.length);
      }
    });
  });
}
