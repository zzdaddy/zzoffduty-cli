import {
  writeFileContent,
  genConfig,
  setHighLightStr,
} from "../utils/common.js";

import { getFormatedFileSize } from "../utils/file.js";
import chalk from "chalk";
import ora from "ora";
import path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supportFileTypes = ["png", "jpg", "jpeg", "gif", "webp"];

export const tinyCmd = {
  name: "tiny",
  description: "压缩图片",
  options: [
    {
      flags: "-t, --type <fileType>",
      description: "转换后的图片类型",
      defaultValue: null,
    },
    {
      flags: "-f, --file <file>",
      description: "要压缩的图片文件",
      defaultValue: null,
    },
    {
      flags: "-d, --dir <dir>",
      description: "压缩文件夹内所有文件",
      defaultValue: null,
    },
    {
      flags: "-co, --condition <condition>",
      description: "压缩文件夹内所有名称包含[--condition]的图片文件",
      defaultValue: null,
    },
    {
      flags: "-q, --quality <quality>",
      description: "压缩质量(1-100)",
      defaultValue: 75,
    },
    {
      flags: "-c, --colours <colours>",
      description: "GIF色彩保留(2-256)",
      defaultValue: 128,
    },
    {
      flags: "-n, --name <name>",
      description: "指定文件名输出",
      defaultValue: "",
    },
  ],
  action: async (option) => {
    let spinner = ora();
    let config = await genConfig();
    // console.log(`OPTION`, option);
    let { type, file, dir, condition, quality, colours } = option;

    if (!file && !dir && !condition) {
      spinner.fail("请指定要压缩的文件(--file=xxx)或文件夹(--dir=/a/b)");
      process.exit(1);
    }

    async function tinyFile(file, statisticsCount, options = {}) {
      try {
        let stats = fs.statSync(file);
        let isFile = stats.isFile();
        if (isFile) {
          // 文件类型
          let extname = path.extname(file);
          // 带后缀的文件名
          let fileName = path.basename(file)?.split(".")[0];
          // 文件路径
          let dirPath = path.dirname(file);
          // 文件类型
          let filetype = extname.slice(1);
          let fileSize = stats.size;
          let beforeSize = getFormatedFileSize(fileSize);
          // 是否在支持的格式里
          // 如果正在批量压缩, 并且要求指定名称输出, 则加一个index后缀, 避免重名
          let customFileName;
          if (options.count && options.count > 1 && option.name) {
            customFileName = `${option.name}${options.order + 1}`;
          } else {
            customFileName =
              option.name || `${fileName}-zz-tiny-${new Date().getTime()}`;
          }

          let outputPath =
            path.resolve(process.cwd(), dirPath) +
            "/" +
            customFileName +
            extname;
          let inputPath = path.resolve(process.cwd(), file);
          if (extname.slice(1) === "gif") {
            //   console.log(`option.colours`, option.colours);
            await sharp(inputPath, {
              animated: true,
              limitInputPixels: false,
            })
              .gif({
                colours: +option.colours,
              })
              .toFile(outputPath);
            let afterStats = fs.statSync(outputPath);
            let afterSize = getFormatedFileSize(afterStats.size);
            let offPercent = ((1 - afterStats.size / fileSize) * 100).toFixed(
              2
            );
            spinner.succeed(
              `${chalk.red(beforeSize)} ${chalk.yellowBright(
                "=>"
              )} ${chalk.green(afterSize)} (${
                offPercent >= 0 ? chalk.green("↓") : chalk.red("↑")
              }${Math.abs(offPercent)}%)【 ${customFileName}${extname} 】`
            );
            statisticsCount.ok++;
          } else {
            if (sharp(inputPath)[filetype]) {
              await sharp(path.resolve(process.cwd(), file))
                [filetype]({ quality: +quality })
                .toFile(outputPath);
              let afterStats = fs.statSync(outputPath);
              let afterSize = getFormatedFileSize(afterStats.size);
              let offPercent = ((1 - afterStats.size / fileSize) * 100).toFixed(
                2
              );
              spinner.succeed(
                `${chalk.red(beforeSize)} ${chalk.yellowBright(
                  "=>"
                )} ${chalk.green(afterSize)} (${
                  offPercent >= 0 ? chalk.green("↓") : chalk.red("↑")
                }${Math.abs(offPercent)}%)【 ${customFileName}${extname} 】`
              );
              statisticsCount.ok++;
            } else {
              spinner.fail(
                `不支持此文件类型[${filetype || fileName || file}]!`
              );
              statisticsCount.error++;
            }
          }
        }
      } catch (err) {
        // console.log(`err`, err);
        spinner.fail("出错啦, 文件不存在或不支持此类型 \n" + err);
        statisticsCount.error++;
      }
    }
    // 指定了文件, 压缩
    if (file) {
      await tinyFile(file);
    }

    // 指定文件夹, 翻译文件夹内所有文件
    if (dir || condition) {
      let inputDirPath = dir || "./";
      let files;
      try {
        // 读取所有文件
        files = fs.readdirSync(inputDirPath);
        // spinner.succeed(`共有${files.length}个文件`);
      } catch (err) {
        spinner.fail("出错啦, 文件夹似乎不存在");
        process.exit(1);
      }
      let statisticsCount = {
        ok: 0,
        err: 0,
      };

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let filePath = path.join(inputDirPath, file);
        let stats = fs.statSync(filePath);
        if (stats.isFile()) {
          if (condition) {
            let fileName = path.basename(file);
            let index = fileName.indexOf(condition);
            if (index > -1) {
              let tip = setHighLightStr(fileName, condition);
              spinner.succeed(`${tip}正在压缩`);
              await tinyFile(filePath, statisticsCount, {
                count: files.length,
                order: i,
              });
            }
          } else {
            spinner.succeed(`正在压缩:${file}`);
            await tinyFile(filePath, statisticsCount, {
              count: files.length,
              order: i,
            });
          }
        } else {
          spinner.fail(`${filePath}不是文件`);
        }
      }
      spinner.succeed(`成功${chalk.green(statisticsCount.ok)}个`);
      process.exit(1);
    }
  },
};
