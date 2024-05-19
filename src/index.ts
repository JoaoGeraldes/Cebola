import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Entry } from "./database-model.js";
import { createId } from "@paralleldrive/cuid2";

export class Cebola {
  static async createEntry(
    obj: Omit<Entry, "date" | "previousEntryId" | "nextEntryId" | "keywords">
  ) {
    const uniqueID = createId();
    const filePath = absolutePath(`./database/entries/${uniqueID}.json`);

    try {
      const lastInsertedEntryId = await this.getLastInsertedEntryId();

      // Prepare Entry structure to be stored
      const newEntry: Entry = {
        domain: obj.domain,
        username: obj.username,
        password: obj.password,
        description: obj.description,
        nextEntryId: null,
        previousEntryId: lastInsertedEntryId ? lastInsertedEntryId : null,
        date: new Date().toISOString(),
        keywords: [],
      };

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(newEntry, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      // Link previous entry to this new entry
      if (lastInsertedEntryId) {
        await this.updateEntry(lastInsertedEntryId, {
          nextEntryId: uniqueID,
        });
      }

      // Update the lastInsertedEntryId to last-inserted-entry-id.json
      await this.updateLastInsertedEntryId(uniqueID);

      console.log(`JSON file created successfully at ${filePath}`);
    } catch (error) {
      console.error(`Error creating JSON file at ${filePath}:`, error.message);
    }
  }

  static async updateEntry(entryId: string, updates: Partial<Entry>) {
    const filePath = absolutePath(`./database/entries/${entryId}.json`);

    try {
      const entryJson = await fs.readFile(filePath, "utf8");
      const entryData: Partial<Entry> = JSON.parse(entryJson);

      const newEntryData = { ...entryData, ...updates };

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(newEntryData, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      console.log(`JSON file updated successfully at ${filePath}`);
    } catch (error) {
      throw new Error(
        `Error updating JSON file at ${filePath}:`,
        error.message
      );
    }
  }

  private static async updateLastInsertedEntryId(newId: string) {
    const filePath = absolutePath(`./database/last-inserted-entry-id.json`);

    try {
      const data = await fs.readFile(filePath, "utf8");
      const parsedData: Record<"lastInsertedEntryId", null | string> =
        JSON.parse(data);

      parsedData.lastInsertedEntryId = newId;

      // Convert the object to a JSON string
      const jsonString = JSON.stringify(parsedData, null, 2);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write the JSON string to the file
      await fs.writeFile(filePath, jsonString, "utf8");

      console.log(`Success updating LastInsertedEntryId at ${filePath}`);
    } catch (error) {
      throw new Error(
        `Error updating LastInsertedEntryId JSON file at ${filePath}:`,
        error.message
      );
    }
  }

  static async getLastInsertedEntryId() {
    const pathToFile = absolutePath("./database/last-inserted-entry-id.json");

    try {
      const data = await fs.readFile(pathToFile, "utf8");
      const parsedData: Record<"lastInsertedEntryId", null | string> =
        JSON.parse(data);

      return parsedData.lastInsertedEntryId;
    } catch (error) {
      console.error(`Error reading JSON file at ${pathToFile}:`, error.message);
      throw error;
    }
  }
}

/* const lastEntryId = Cebola.getLastEntryId().then((sd) =>
  console.log("lastEntryId", sd)
);
 */
Cebola.createEntry({
  domain: "domain.com",
  password: "pwd123",
  username: "username",
  description: "some description here",
});

// Utils
function absolutePath(relativeFilePath: string) {
  try {
    // Convert import.meta.url to a file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Construct the absolute file path
    const absoluteFilePath = path.join(__dirname, relativeFilePath);
    return absoluteFilePath;
  } catch {
    throw new Error("Failed to calculate absolute path.");
  }
}
