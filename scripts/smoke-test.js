import fs from "node:fs";
import path from "node:path";

const VERSES_PATH = path.resolve("docs", "verses.txt");

function fail(msg) {
  console.error("SMOKE TEST FAILED:", msg);
  process.exit(1);
}

if (!fs.existsSync(VERSES_PATH)) {
  fail(`Missing verses file at ${VERSES_PATH}`);
}

const raw = fs.readFileSync(VERSES_PATH, "utf8").replace(/\r\n/g, "\n").trim();
if (!raw) fail("verses file is empty");

const blocks = raw.split(/\n(?=SEGMENT\s+\d+\s*\n)/g);

const segmentHeader = /^SEGMENT\s+(\d+)\s*$/;

let foundSegment = false;

for (const block of blocks) {
  const lines = block.split("\n").map(l => l.trimEnd());
  if (!lines[0]) continue;

  const m = lines[0].match(segmentHeader);
  if (!m) continue;

  foundSegment = true;

  const segNum = Number(m[1]);
  if (!Number.isInteger(segNum) || segNum <= 0) fail(`Bad segment number: "${lines[0]}"`);

  // Expect at least:
  // 0: SEGMENT N
  // 1: Scripture reference line (e.g., Jonah 1:12-14)
  // 2+: text/keywords lines
  if (lines.length < 3) {
    fail(`SEGMENT ${segNum} has too few lines (need >= 3, got ${lines.length}).`);
  }

  if (!lines[1]) {
    fail(`SEGMENT ${segNum} is missing scripture reference on line 2.`);
  }
}

if (!foundSegment) {
  fail("No SEGMENT blocks found. Expected lines like 'SEGMENT 14'.");
}

console.log("Smoke test passed.");
