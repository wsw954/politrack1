import fs from "fs";
import path from "path";

// ANSI color codes
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

function printDirTree(dir, prefix = "") {
  const excludedDirs = new Set(["node_modules", ".next", ".git"]);
  const items = fs
    .readdirSync(dir)
    .filter((item) => {
      const fullPath = path.join(dir, item);
      const isHidden = item.startsWith(".");
      const isExcluded = excludedDirs.has(item);
      return !isHidden && !isExcluded && fs.existsSync(fullPath);
    })
    .sort();

  const output = [];

  items.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const isLast = index === items.length - 1;
    const pointer = isLast ? "└── " : "├── ";
    const childPrefix = prefix + (isLast ? "    " : "│   ");

    const isDirectory = fs.statSync(fullPath).isDirectory();
    const colorized = isDirectory ? `${CYAN}${item}${RESET}` : item;

    output.push(prefix + pointer + colorized);

    if (isDirectory) {
      output.push(...printDirTree(fullPath, childPrefix));
    }
  });

  return output;
}

// Use CLI argument or default to ./ (root folder)
const targetDir = process.argv[2] || "./";
const fullPath = path.resolve(targetDir);

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Directory not found: ${fullPath}`);
  process.exit(1);
}

const treeOutput = printDirTree(fullPath).join("\n");

// Save plain (no color) version to .txt file
const plainOutput = treeOutput.replace(/\x1b\[[0-9;]*m/g, ""); // strip ANSI codes
fs.writeFileSync("./folder-structure.txt", plainOutput, "utf8");

// Print color version to console
console.log(treeOutput);
