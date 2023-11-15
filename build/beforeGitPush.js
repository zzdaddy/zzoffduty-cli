// 提交前用默认配置覆盖config.json
// import chalk from 'chalk'
import path from "node:path";
import { writeFileContent, readJsonFile } from "../src/utils/common.js";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import ora from "ora";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

readJsonFile(path.resolve(__dirname, "../config.default.json")).then(
  (localConfig) => {
    let spinner = ora();
    fs.writeFile(
      path.resolve(__dirname, "../src/config.json"),
      JSON.stringify(localConfig, null, 2),
      "utf-8",
      (error) => {
        if (!error) {
          // console.log(`- 写入[${filePath}]成功`)
          spinner.succeed(`已重置config.json`);
        } else {
          spinner.fail(`- 写入config.json失败, 请重试`);
        }
      }
    );
  }
);
