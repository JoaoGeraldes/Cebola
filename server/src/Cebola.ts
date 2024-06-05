import fs from "fs/promises";
import fs2 from "fs";
import path from "path";

import { createId } from "@paralleldrive/cuid2";
import { absolutePath, copyFile, deleteFile } from "./utils/utils.ts";
import { Entry } from "../../types.ts";
import { relativePath } from "./config.ts";

export class Cebola {
  static async createEntry(
    obj: Omit<
      Entry,
      "date" | "previousEntryId" | "nextEntryId" | "keywords" | "id"
    >,
    _id: string | null = null
  ) {
    if (!obj)
      throw new Error("createEntry() - Missing data. Can't create entry!");

    const uniqueID = _id ? _id : createId();
    const filePath = absolutePath(relativePath.entry(uniqueID));
    const tailFilePath = absolutePath(relativePath.tail);
    const lastInsertedEntryId = await this.getTailId();

    if (lastInsertedEntryId) {
      await this.smartBackup(lastInsertedEntryId);
    }

    try {
      // Prepare Entry structure to be stored
      const newEntry: Entry = {
        id: uniqueID,
        domain: obj.domain,
        username: obj.username,
        password: obj.password,
        description: obj.description,
        nextEntryId: null,
        previousEntryId: lastInsertedEntryId ? lastInsertedEntryId : null,
        date: new Date().toISOString(),
        keywords: [],
      };

      const jsonString = JSON.stringify(newEntry, null, 2);

      await fs.mkdir(path.dirname(filePath), { recursive: true });

      await fs.writeFile(filePath, jsonString, "utf8");

      // Create copy for linked list Head
      await fs.writeFile(tailFilePath, jsonString, "utf8");

      // Link previous entry to this new entry
      if (lastInsertedEntryId) {
        await this.updateEntry(lastInsertedEntryId, {
          nextEntryId: uniqueID,
        });
      }

      return true;
    } catch (error) {
      console.error(
        `createEntry() - Error creating JSON file at ${filePath}:`,
        error.message
      );
      throw error;
    }
  }

  static async getEntry(entryId: string) {
    if (!entryId) {
      return;
    }

    const filePath = absolutePath(relativePath.entry(entryId));

    try {
      const entryJson = await fs.readFile(filePath, "utf8");
      const entryData: Partial<Entry> = JSON.parse(entryJson);
      return entryData;
    } catch (error) {
      console.log(`getEntry() - Failed to retrieve JSON file at ${filePath}:`);
      return false;
    }
  }

  static async updateEntry(entryId: string, updates: Partial<Entry>) {
    if (!entryId || !updates) {
      throw new Error("updateEntry() - Missing entryId or updates.");
    }

    const filePath = absolutePath(relativePath.entry(entryId));

    await this.smartBackup(entryId);

    try {
      const entryJson = await fs.readFile(filePath, "utf8");
      const entryData: Partial<Entry> = JSON.parse(entryJson);

      const newEntryData = { ...entryData, ...updates };

      const jsonString = JSON.stringify(newEntryData, null, 2);

      await fs.mkdir(path.dirname(filePath), { recursive: true });

      await fs.writeFile(filePath, jsonString, "utf8");

      return true;
    } catch (error) {
      console.log(`updateEntry() - Error updating JSON file at ${filePath}:`);
      throw error;
    }
  }

  /**
   * Creates a tail.json file, which should be a copy of the latest entry.
   */
  static async createTail(entry: Partial<Entry>) {
    try {
      // Create copy for linked list Head
      await fs.writeFile(
        absolutePath(relativePath.tail),
        JSON.stringify(entry),
        "utf8"
      );
    } catch (error) {
      console.log("createTail() - fail", error.message);
      throw error.message;
    }
  }

  static async deleteEntry(entryId: string) {
    if (!entryId) {
      throw new Error(`deleteEntry() - Invalid entryId -> ${entryId}`);
    }

    const entryToBeDeletedFilePath = absolutePath(relativePath.entry(entryId));

    const entryJSON = await fs.readFile(
      absolutePath(relativePath.entry(entryId)),
      "utf8"
    );
    const entry: Partial<Entry> = JSON.parse(entryJSON);

    await this.smartBackup(entryId);

    try {
      const entryPosition = this.entryPosition(entry);

      switch (entryPosition) {
        case "single":
          await deleteFile(entryToBeDeletedFilePath);
          break;

        case "head":
          await this.updateEntry(entry.nextEntryId, {
            previousEntryId: null,
          });
          await deleteFile(entryToBeDeletedFilePath);
          break;

        case "body":
          await this.updateEntry(entry.previousEntryId, {
            nextEntryId: entry.nextEntryId,
          });
          await this.updateEntry(entry.nextEntryId, {
            previousEntryId: entry.previousEntryId,
          });
          await deleteFile(entryToBeDeletedFilePath);
          break;

        case "tail":
          await this.updateEntry(entry.previousEntryId, {
            nextEntryId: null,
          });
          await deleteFile(entryToBeDeletedFilePath);
          const prevEntry = await this.getEntry(entry.previousEntryId);
          if (prevEntry) await this.createTail(prevEntry);
          break;

        default:
          break;
      }

      // Delete backups after entry deletion is successful
      await deleteFile(relativePath.entryBackup(entryId));
    } catch (error) {
      console.error(
        `deleteEntry() - Error deleting JSON file at ${entryToBeDeletedFilePath}:`,
        error.message
      );
      throw error;
    }
  }

  static async getTailId(): Promise<string | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const filePath = absolutePath(relativePath.tail);
        const fileContent = await fs.readFile(filePath, { encoding: "utf8" });
        const data: Entry = JSON.parse(fileContent);

        if (data) {
          resolve(data.id);
        } else {
          resolve(null);
        }
      } catch (err) {
        resolve(null);
        console.log(err);
      }
    });
  }

  /**
   *
   * @param entryId
   *
   * Creates backups of all files that are linked to a given entry
   */
  static async smartBackup(entryId: string) {
    try {
      if (!entryId) throw new Error("Missing entry ID");

      const entryJSON = await fs.readFile(
        absolutePath(relativePath.entry(entryId)),
        "utf8"
      );

      const entry: Partial<Entry> = JSON.parse(entryJSON);

      const filesPath = {
        tailFile: {
          original: relativePath.tail,
          backup: relativePath.tailBackup,
        },
        entryFile: {
          original: relativePath.entry(entryId),
          backup: relativePath.entryBackup(entryId),
        },
        previousEntryFile: {
          original: relativePath.entry(entry.previousEntryId),
          backup: relativePath.entryBackup(entry.previousEntryId),
        },
        nextEntryFile: {
          original: relativePath.entryBackup(entry.nextEntryId),
          backup: relativePath.entryBackup(entry.nextEntryId),
        },
      };

      const hasTailFile = fs2.existsSync(filesPath.tailFile.original);
      if (hasTailFile) {
        await copyFile(filesPath.tailFile.original, filesPath.tailFile.backup);
      }

      switch (this.entryPosition(entry)) {
        case "single":
          await copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );
          break;
        case "head":
          await copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );

          await copyFile(
            filesPath.nextEntryFile.original,
            filesPath.nextEntryFile.backup
          );
          break;
        case "body":
          await copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );

          await copyFile(
            filesPath.previousEntryFile.original,
            filesPath.previousEntryFile.backup
          );

          await copyFile(
            filesPath.nextEntryFile.original,
            filesPath.nextEntryFile.backup
          );
          break;
        case "tail":
          await copyFile(
            filesPath.entryFile.original,
            filesPath.entryFile.backup
          );

          await copyFile(
            filesPath.previousEntryFile.original,
            filesPath.previousEntryFile.backup
          );
          break;

        default:
          break;
      }
    } catch (error) {
      console.trace("smartBackup() - failed to create backups.", error.message);
      throw error;
    }
  }

  /**
   *
   * @param entryId
   * The files linked to a given entry are modified to its previous state (which is held by _backup.json files)
   * Execute this to recover from previous state after a failure on any write (create or update) on entry(ies)
   */
  static async recoverFromSmartBackup(entryId: string) {
    try {
      const entryJSON = await fs.readFile(
        absolutePath(relativePath.entry(entryId)),
        "utf8"
      );
      const entry: Partial<Entry> = JSON.parse(entryJSON);

      const filesPath = {
        entryFile: {
          original: relativePath.entry(entryId),
          backup: relativePath.entryBackup(entryId),
        },
        previousEntryFile: {
          original: relativePath.entry(entry.previousEntryId),
          backup: relativePath.entryBackup(entry.previousEntryId),
        },
        nextEntryFile: {
          original: relativePath.entryBackup(entry.nextEntryId),
          backup: relativePath.entryBackup(entry.nextEntryId),
        },
      };

      switch (this.entryPosition(entry)) {
        case "single":
          await copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          break;

        case "head":
          await copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          await copyFile(
            filesPath.nextEntryFile.backup,
            filesPath.nextEntryFile.original
          );

          break;

        case "body":
          await copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          await copyFile(
            filesPath.previousEntryFile.backup,
            filesPath.previousEntryFile.original
          );

          await copyFile(
            filesPath.nextEntryFile.backup,
            filesPath.nextEntryFile.original
          );

          break;

        case "tail":
          await copyFile(
            filesPath.entryFile.backup,
            filesPath.entryFile.original
          );

          await copyFile(
            filesPath.previousEntryFile.backup,
            filesPath.previousEntryFile.original
          );

          break;

        default:
          break;
      }
    } catch (error) {
      console.log(
        "recoverFromSmartBackup() - Error resetting entry from backup.",
        error.message
      );
      throw error.message;
    }
  }

  static async smartBackupDelete(entryId: string) {
    try {
      if (!entryId) return;

      const entryJSON = await fs.readFile(
        absolutePath(relativePath.entry(entryId)),
        "utf8"
      );
      const entry: Partial<Entry> = JSON.parse(entryJSON);

      const filesPath = {
        entryFile: {
          backup: relativePath.entryBackup(entryId),
        },
        previousEntryFile: {
          backup: relativePath.entryBackup(entry.previousEntryId),
        },
        nextEntryFile: {
          backup: relativePath.entryBackup(entry.nextEntryId),
        },
      };
      console.log("ATTEEMMPT TO DELETE", filesPath.entryFile.backup)
      await deleteFile(filesPath.entryFile.backup);
     
    } catch (error) {
      console.log(
        "smartBackupDelete() - Error deleting backup!",
        error.message
      );
      throw error.message;
    }
  }

  static entryPosition(
    entry: Partial<Entry>
  ): "single" | "head" | "body" | "tail" {
    const isSingleEntry =
      entry.previousEntryId === null && entry.nextEntryId === null;

    const isHead = entry.previousEntryId === null;

    const isBody = entry.previousEntryId && entry.nextEntryId;

    const isTail = entry.previousEntryId && entry.nextEntryId === null;

    if (isSingleEntry) return "single";
    if (isHead) return "head";
    if (isBody) return "body";
    if (isTail) return "tail";
  }
}
