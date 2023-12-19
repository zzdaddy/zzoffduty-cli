import fs from "node:fs";
// 导出一个异步函数，用于读取JSON文件
export const readJsonFile = async (filePath) => {
  let jsonData;
  try {
    // 使用fs.readFileSync读取文件内容
    let jsonStr = fs.readFileSync(filePath);
    // 将文件内容转换为JSON对象
    jsonData = JSON.parse(jsonStr);
  } catch (err) {
    // 如果读取文件失败，则将jsonData初始化为空对象
    jsonData = {};
  }
  // 返回JSON对象
  return jsonData;
};

// 用于获取格式化的文件大小
export const getFormatedFileSize = (byte) => {
  if (byte === 0) return "0 Bytes";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = parseInt(Math.floor(Math.log(byte) / Math.log(1024)), 10);
  if (i === 0) return byte + " " + sizes[i];
  return (byte / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

// 检测文件是否存在 且 是文件类型
export const checkFileExist = (filePath) => {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

// 获取文件信息, 没返回说明文件不存在, 或不是一个文件
export const getFileInfo = (filePath) => {
  let fileInfo = {};
  if (checkFileExist(filePath)) {
    fileInfo.fileName = filePath.split("/").pop();
    fileInfo.formatFileSize = getFormatedFileSize(fs.statSync(filePath).size);
    fileInfo.rawFileSize = fs.statSync(filePath).size;
    fileInfo.fileType = filePath.split(".").pop();
  }
  return fileInfo;
};

// 替换文件内的内容
// replaceMaps: [ {text: '1', newText: '2'}, {text: '45', newText: '112'},]
export const replaceFileContent = async (file, replaceMaps) => {
  try {
    let fileContent = fs.readFileSync(file, "utf8");
    replaceMaps.forEach((item) => {
      if (item.text && item.newText)
        fileContent = fileContent.replaceAll(item.text, item.newText);
    });
    return fileContent;
  } catch (err) {
    return null;
  }
};
