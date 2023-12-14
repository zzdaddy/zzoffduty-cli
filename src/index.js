#!/usr/bin/env node
import { Command } from "commander";
// const pkg = require("./package.json");
import { registerCommand, initProgram } from "./command/index.js";
import { translateCmd } from "./command/translate.js";
import { configCmd } from "./command/config.js";
import { setCmd } from "./command/set.js";
import { tinyCmd } from "./command/tiny.js";
const program = new Command();

initProgram(program, () => {
  registerCommand(program, translateCmd);

  registerCommand(program, setCmd);

  registerCommand(program, configCmd);

  registerCommand(program, tinyCmd);

  program.parse(process.argv);
});
