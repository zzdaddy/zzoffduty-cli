import fs from "node:fs";
export const readJsonFile = async (filePath) => {
  let jsonData;
  try {
    let jsonStr = fs.readFileSync(filePath);
    jsonData = JSON.parse(jsonStr);
  } catch (err) {
    jsonData = {};
  }
  return jsonData;
};
