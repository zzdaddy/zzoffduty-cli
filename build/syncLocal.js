// 用本地配置覆盖config.json
import chalk from "chalk"
 import ora from 'ora'
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { writeFileContent, genConfig } from "../src/utils/common.js"
import path from 'node:path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let localConfigPath = path.resolve(__dirname, '../config.local.json')
let spinner = ora()
genConfig(localConfigPath).then( config => {
    writeFileContent(path.resolve(__dirname, "../src/config.json"), JSON.stringify(config, null, 4), (spinner, isOk) => {
        if (isOk) {
            spinner.succeed('已更新config.json')
        } else {
            spinner.fail('更新失败')
        }
    })
})

