import { Cebola } from "../index.ts";
import fs from "fs";
import path from "path";

const dummyEntryIds = ["entry1", "entry2", "entry3"];

describe("Add and remove entries and test their connections - pointers", () => {
  it("Should delete all entries from /database/entries", async () => {
    const hasDeletedAll = await Cebola.updateLastInsertedEntryId(null);
    expect(hasDeletedAll).toBe(true);
  });

  it("Should create 3 new entries.", async () => {
    const dummyEntry = {
      domain: undefined,
      password: undefined,
      username: undefined,
      description: undefined,
      date: undefined,
      keywords: undefined,
    };

    for (const entryId of dummyEntryIds) {
      await Cebola.createEntry(dummyEntry, entryId);
    }
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

      // Iterate over each file in the directory
      files.forEach((file) => {
        const filePath = path.join(absoluteFilePath, file);

        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
            return;
          }
          console.log(`Deleted file: ${filePath}`);
        });
      });

      resolve(true);
    });
  });
}

/**
 * Deletes all files within /entries
 */
function resetLastInsertedEntryId() {}
