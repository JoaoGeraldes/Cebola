import fs from "fs/promises";
import fs2 from "fs";
import path from "path";
import archiver from "archiver";
import { relativePath } from "../config.ts";

export async function copyFile(source: string, destination: string) {
  try {
    const sourceExists = fs2.existsSync(source);

    console.log(
      `Did not find the source provided. The source provided is: ${source}`
    );

    if (!sourceExists) return null;

    await fs.copyFile(source, destination);
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

export async function zipDirectory(
  sourceDir: string = absolutePath(relativePath.database),
  outPath: string = absolutePath(relativePath.databaseBackup())
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to.
    const output = fs2.createWriteStream(outPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on("close", function () {
      console.log(archive.pointer() + " total bytes");
      console.log(
        "archiver has been finalized and the output file descriptor has closed."
      );
      resolve(outPath);
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on("end", function () {
      console.log("Data has been drained");
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        console.log("WARNING - zipDirectory()");
        reject(null);
      } else {
        reject(null);
        // throw error
        throw err;
      }
    });

    // good practice to catch this error explicitly
    archive.on("error", function (err) {
      reject(null);
      throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory and naming it `database` within the archive
    archive.directory(absolutePath(sourceDir), "database");

    // append files from a sub-directory, putting its contents at the root of archive
    // archive.directory("subdir/", false);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  });
}

export function getFileSize(filePath: string) {
  try {
    const stats = fs2.statSync(filePath);
    return stats.size;
  } catch (err) {
    console.error("Error getting file size:", err);
    return null;
  }
}
