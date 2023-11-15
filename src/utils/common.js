import fs from "node:fs";
import ora from "ora";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function genConfig(configPath) {
  let _path = configPath || path.join(__dirname, "../config.json");
  let config = await readJsonFile(_path);
  // console.log(path.resolve(__dirname, "../config.json"));
  return config;
}

/**
 * 写入文件
 * @param filePath 文件路径
 * @param fileContent 文件内容
 * @param onFinally 完成时回调
 */
export function writeFileContent(filePath, fileContent, onFinally = () => {}) {
  let spinner = ora();
  fs.writeFile(filePath, fileContent, "utf-8", (error) => {
    if (!error) {
      //   spinner.succeed(`已写入${chalk.yellow(filePath)}`);
      onFinally && onFinally(spinner, true);
    } else {
      console.log(error);
      //   spinner.fail(`写入${chalk.red(filePath)}文件失败, 请重试`);
      onFinally && onFinally(spinner, false);
    }
  });
}
//   log: {
//     ...genLogOptions(),
//   },

// function genLogOptions() {
//   let options = Object.keys(emoji);
//   let logFns: any = {};
//   options.forEach((key) => {
//     logFns[key] = (info: string) => {
//       console.log(`${emoji[key]}  ` + info);
//     };
//   });
//   return logFns;
// }
export const readJsonFile = async (filePath) => {
  let jsonData;
  try {
    let jsonStr = fs.readFileSync(filePath);
    jsonData = JSON.parse(jsonStr.toString());
  } catch (err) {
    jsonData = {};
  }
  return jsonData;
};
