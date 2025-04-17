import fs from "fs/promises";
import path from "path";

const dataDirectory = path.join(process.cwd(), "public", "data");

export async function readJsonData(filename) {
  const filePath = path.join(dataDirectory, filename);

  try {
    const jsonData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(`Data file not found: ${filename}. Returning null.`);
      return null;
    }
    console.error(`Error reading data file ${filename}:`, error);
    throw new Error(`Could not read data from ${filename}.`);
  }
}

export async function writeJsonData(filename, data) {
  const filePath = path.join(dataDirectory, filename);

  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, "utf-8");
    console.log(`Data successfully written to ${filename}.`);
  } catch (error) {
    console.error(`Error writing data file ${filename}:`, error);
    throw new Error(`Could not save data to ${filename}.`);
  }
}
