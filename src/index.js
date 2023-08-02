#!/usr/bin/env node
import { Command } from "commander";
// const pkg = require("./package.json");
import { registerCommand } from "./command/index.js";
import { translateCmd } from "./command/translate.js";
import { setCmd } from './command/set.js'
const program = new Command();

// program.usage("<command> [options]");
// program.version(pkg.version);
registerCommand(program, translateCmd);
registerCommand(program, setCmd);

// program
//   .arguments("<cmd> [options]")
//   .description("=====")
//   .action(function (cmd, a) {
//     console.log("=====");
//   });

program.parse(process.argv);
