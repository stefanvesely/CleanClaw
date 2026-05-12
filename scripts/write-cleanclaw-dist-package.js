#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const packagePath = path.resolve(__dirname, "..", "dist", "cleanclaw", "package.json");

fs.mkdirSync(path.dirname(packagePath), { recursive: true });
fs.writeFileSync(packagePath, `${JSON.stringify({ type: "module" }, null, 2)}\n`);
