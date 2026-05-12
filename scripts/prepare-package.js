#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

function commandName(name) {
  return isWindows ? `${name}.cmd` : name;
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    stdio: options.stdio ?? "inherit",
    shell: false,
  });
}

function npmCommand(args) {
  if (process.env.npm_execpath) {
    return {
      command: process.execPath,
      args: [process.env.npm_execpath, ...args],
    };
  }

  return {
    command: commandName("npm"),
    args,
  };
}

function runNpm(args) {
  const npm = npmCommand(args);
  return run(npm.command, npm.args);
}

function hasLocalBin(name) {
  const binName = commandName(name);
  const binPath = path.join(root, "node_modules", ".bin", binName);
  return fs.existsSync(binPath);
}

function hasCommand(name) {
  const probe = isWindows ? "where" : "command";
  const args = isWindows ? [name] : ["-v", name];
  const result = spawnSync(probe, args, {
    cwd: root,
    stdio: "ignore",
    shell: isWindows,
  });

  return result.status === 0;
}

function runOptional(label, command, args) {
  const result = run(command, args);
  if (result.status !== 0) {
    console.log(`Skipping ${label} (${command} exited with status ${result.status ?? "unknown"})`);
  }
}

function isLocalRepositoryInstall() {
  return fs.existsSync(path.join(root, ".git")) && process.env.npm_config_global !== "true";
}

if (hasCommand("tsc") || hasLocalBin("tsc")) {
  const result = runNpm(["run", "build:cli"]);
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!isLocalRepositoryInstall()) {
  const productionInstall = npmCommand(["install", "--omit=dev", "--ignore-scripts"]);
  runOptional("production dependency refresh", productionInstall.command, productionInstall.args);
}

if (fs.existsSync(path.join(root, ".git"))) {
  if (hasCommand("prek") || hasLocalBin("prek")) {
    runOptional("git hook setup", commandName("prek"), ["install"]);
  } else {
    console.log("Skipping git hook setup (prek not installed)");
  }
}
