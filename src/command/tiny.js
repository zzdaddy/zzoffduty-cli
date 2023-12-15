import { writeFileContent, genConfig } from "../utils/common.js";
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

    async function tinyFile(file) {
      try {
        let stats = fs.statSync(file);
        let isFile = stats.isFile();
        if (isFile) {
          // 文件类型
          let extname = path.extname(file);
          // 带后缀的文件名
          let fileName = path.basename(file).split(".")[0];
          // 文件路径
          let dirPath = path.dirname(file);
          // 文件类型
          let filetype = extname.slice(1);
          // 是否在支持的格式里
          if (true) {
            let customFileName =
              option.name || `${fileName}-zz-tiny-${new Date().getTime()}`;

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
              spinner.succeed(`压缩完成: ${outputPath}`);
            } else {
              if (sharp(inputPath)[filetype]) {
                await sharp(path.resolve(process.cwd(), file))
                  [filetype]({ quality: +quality })
                  .toFile(outputPath);
                spinner.succeed(`压缩完成: ${outputPath}`);
                process.exit(1);
              } else {
                spinner.fail(
                  `不支持此文件类型[${filetype || fileName || file}]!`
                );
              }
            }
          } else {
            spinner.fail("不支持此文件类型!");
          }
        }
      } catch (err) {
        // console.log(`err`, err);
        spinner.fail("出错啦, 文件不存在或不支持此类型 \n" + err);
      }
    }
    // 指定了文件, 压缩
    if (file) {
      await tinyFile(file);
    }

    // 指定文件夹, 翻译文件夹内所有文件
    if (dir || condition) {
      let inputDirPath = dir || "./";
      // 读取所有文件
      let files = fs.readdirSync(inputDirPath);
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let filePath = path.join(inputDirPath, file);
        let stats = fs.statSync(filePath);
        if (stats.isFile()) {
          if (condition) {
            let fileName = path.basename(file);
            if (fileName.indexOf(condition) > -1) {
              spinner.succeed(`${fileName}开始压缩...`);
              await tinyFile(filePath);
            }
          } else {
            await tinyFile(filePath);
          }
        }
      }
    }
  },
};
