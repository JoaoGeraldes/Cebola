import fs from "fs/promises";
import fs2 from "fs";
import path from "path";

import { createId } from "@paralleldrive/cuid2";
import { absolutePath, copyFile, deleteFile } from "./utils/utils.ts";
import { Entry, UpdateEntry } from "../../types.ts";
import { relativePath } from "./config.ts";
import { decrypt, encrypt } from "./utils/crypto.ts";
import crypto from "crypto";

export class CebolaServer {
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
    const lastInsertedEntryId = await this.getTailId();

    if (lastInsertedEntryId) {
      // Create backup for tail.json (if present)
      await copyFile(
        absolutePath(relativePath.tail),
        absolutePath(relativePath.tailBackup)
      );
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
        iv: obj.iv,
      };

      const jsonString = JSON.stringify(newEntry, null, 2);

      await fs.mkdir(path.dirname(filePath), { recursive: true });

      await fs.writeFile(filePath, jsonString, "utf8");

      // Create clone to tail.json
      await fs.writeFile(absolutePath(relativePath.tail), jsonString, "utf8");

      // Link previous entry to this new entry
      if (lastInsertedEntryId) {
        await this.updateEntry(lastInsertedEntryId, {
          nextEntryId: uniqueID,
        });
      }

      // Delete backup
      await deleteFile(absolutePath(relativePath.tailBackup));

      return newEntry;
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

    const fileExists = fs2.existsSync(filePath);

    if (!fileExists) return null;

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

    const fileExists = fs2.existsSync(filePath);

    if (!fileExists) return;

    // Create backup
    await copyFile(
      absolutePath(relativePath.entry(entryId)),
      absolutePath(relativePath.entryBackup(entryId))
    );

    try {
      const entryJson = await fs.readFile(filePath, "utf8");
      const entryData: Partial<Entry> = JSON.parse(entryJson);

      const newEntryData = { ...entryData, ...updates };

      const jsonString = JSON.stringify(newEntryData, null, 2);

      await fs.mkdir(path.dirname(filePath), { recursive: true });

      await fs.writeFile(filePath, jsonString, "utf8");

      // Delete backup
      await deleteFile(absolutePath(relativePath.entryBackup(entryId)));

      return JSON.parse(jsonString);
    } catch (error) {
      // Recover backup
      await copyFile(
        absolutePath(relativePath.entryBackup(entryId)),
        absolutePath(relativePath.entry(entryId))
      );
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

    try {
      // Create backups
      await copyFile(
        relativePath.entry(entry.id),
        relativePath.entryBackup(entry.id)
      );

      // Create backups
      if (entry.previousEntryId) {
        await copyFile(
          relativePath.entry(entry.previousEntryId),
          relativePath.entryBackup(entry.previousEntryId)
        );
      }

      // Create backups
      if (entry.nextEntryId) {
        await copyFile(
          relativePath.entry(entry.nextEntryId),
          relativePath.entryBackup(entry.nextEntryId)
        );
      }

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
      await deleteFile(absolutePath(relativePath.entryBackup(entryId)));
      await deleteFile(
        absolutePath(relativePath.entryBackup(entry.previousEntryId))
      );
      await deleteFile(
        absolutePath(relativePath.entryBackup(entry.nextEntryId))
      );

      // Delete tail files (original + backup) if this is the last entry
      if (!entry.previousEntryId && !entry.nextEntryId) {
        await deleteFile(absolutePath(relativePath.tail));
        await deleteFile(absolutePath(relativePath.tailBackup));
      }

      return entry;
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
        const fileExists = fs2.existsSync(filePath);

        if (!fileExists) {
          resolve(null);
          return;
        }

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
