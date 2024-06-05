import fs from "fs/promises";
import fs2 from "fs";
import path from "path";

export async function copyFile(source: string, destination: string) {
  try {
    await fs.copyFile(source, destination);
    console.log(`${source} was copied to ${destination}`);
    return true;
  } catch (error) {
    console.error("Error copying file:", error);
    throw error.message;
  }
}

export async function deleteFile(filePath: string) {
  try {
    const fileExists = fs2.existsSync(filePath);

    if (!fileExists) {
      console.log(`${filePath} NOT found. Skipping...`);
      return;
    }

    await fs.unlink(filePath);
    console.log(`${filePath} was deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export function absolutePath(relativeFilePath: string) {
  try {
    const absoluteFilePath = path.resolve(relativeFilePath);
    return absoluteFilePath;
  } catch {
    console.log("absolutePath() - Failed to calculate absolute path.");
    throw new Error("Failed to calculate absolute path.");
  }
}
