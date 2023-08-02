const shell = require("shelljs");
const { log } = require("../utils/common")
let msgIndex = process.argv.indexOf('msg');
if (msgIndex > -1) {
    let msg = process.argv[msgIndex+1]
    shell.exec('git add .')
    shell.exec(`git commit -m ${msg}`)
    shell.exec(`git pull`)
    shell.exec(`git push`)
} else {
    log.error("请输入commit message")
}
