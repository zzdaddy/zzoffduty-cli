import axios from "axios";
import ora from "ora";
import fs from "node:fs";
import { getFileInfo } from "./file.js";
import sharp from "sharp";
import chalk from "chalk";
// 检查文件是否超过最大值, 或不满足最小值
export const checkFileSize = (filePath, { max, min }) => {
  const fileInfo = getFileInfo(filePath);
  if (!fileInfo.fileName) {
    return {
      ok: false,
      msg: "文件不存在",
      fileInfo: {},
    };
  }
  const { rawFileSize: fileSize, fileName } = fileInfo;
  const kbValue = fileSize / 1024;
  if (max && kbValue > max) {
    return {
      ok: false,
      msg: `文件[${fileName}](${kbValue.toFixed(1)}kb)大小超过${max}kb`,
      fileInfo,
    };
  }
  if (min && kbValue < min) {
    return {
      ok: false,
      msg: `文件[${fileName}](${kbValue.toFixed(1)}kb)大小低于${min}kb`,
      fileInfo,
    };
  }

  return {
    ok: true,
    msg: "ok",
    fileInfo,
  };
};

// 检测所有文件, 并过滤出可以被上传的文件
export const checkFileSizeAndFilter = (filePaths, { max, min }) => {
  const okFiles = [],
    errFiles = [];
  if (filePaths && filePaths.length) {
    filePaths.forEach((filePath) => {
      let checkInfo = checkFileSize(filePath, { max, min });
      // 是一个文件, 并且可以被sharp处理, 则上传
      if (checkInfo.ok) {
        if (sharp(filePath)[checkInfo.fileInfo.fileType]) {
          okFiles.push(filePath);
        }
      } else {
        errFiles.push({
          errFile: filePath,
          fileInfo: checkInfo.fileInfo,
          errMsg: checkInfo.msg,
        });
      }
    });
  }
  return {
    okFiles,
    errFiles,
  };
};

// 请求picgo
export const requestPicGo = async (files) => {
  let spinner = ora();
  if (!files || !files.length) {
    spinner.fail(`上传失败: 未指定文件`);
    process.exit(1);
  }

  spinner.start("正在上传");
  let picgoRes = await axios
    .post("http://127.0.0.1:36677/upload", {
      list: files,
    })
    .catch((err) => {
      spinner.fail("上传失败!请启动PicGo后重试!");
      process.exit(1);
    });
  // 成功
  if (picgoRes.data && picgoRes.data.success) {
    spinner.succeed(`上传成功 ${chalk.green(picgoRes.data.result.length)} 个!`);
    // 返回上传后的url列表
    return picgoRes.data.result;
  } else {
    spinner.fail(`上传失败: ${picgoRes.data.message}`);
    process.exit(1);
  }
};

// 上传文件
export const uploadFileByPicGo = async (file, option) => {
  const spinner = ora();
  let filePth = path.resolve(process.cwd(), file);
  let checkResult = checkFileSize(filePth, { max: option.max });
  if (checkResult.ok) {
    let fileUrls = await requestPicGo([filePth]);
    spinner.succeed(`上传地址: \n ${fileUrls.join("\n")}`);
  } else {
    spinner.fail(`上传失败:  ${checkResult.msg}`);
  }
};

// 批量上传文件
export const batchUploadByPicGo = async (files, option) => {
  const spinner = ora();
  const { okFiles, errFiles } = checkFileSizeAndFilter(files, {
    max: option.max,
  });
  if (!okFiles.length) {
    spinner.fail(
      `该目录下没有${
        option.condition ? "名称含有[" + option.condition + "]的" : ""
      }图片文件(<=${option.max}kb)可以上传`
    );
    process.exit(1);
  }
  const fileUrls = await requestPicGo(okFiles);
  // 如果要替换, 重新组装map
  if (option.replace) {
    option.replaceMaps = option.replaceMaps.map((item) => {
      // obsidian里的文件名带空格, 所以需要编码一下
      // 因为上传后的url里空格被编码了
      let uploadedUrl = fileUrls.find(
        (url) => url.indexOf(encodeURIComponent(item.newText)) !== -1
      );
      return {
        text: item.text,
        newText: uploadedUrl ? `![](${uploadedUrl})` : "",
      };
    });
  }
  spinner.succeed(`上传地址: \n${fileUrls.join("\n")}`);
  let realErrFiles = errFiles.filter(
    (item) => item.fileInfo && item.fileInfo.fileName
  );
  if (realErrFiles.length) {
    spinner.fail(
      `未上传 ${chalk.red(realErrFiles.length)} 个: \n${realErrFiles
        .map((item) => item.errMsg)
        .join("\n")}`
    );
  }
};
