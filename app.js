/**
 * verses.txt format (4 lines per block, blank line between blocks):
 *
 * SEGMENT 19
 * Jonah 1:12-14
 * Nevertheless, the men rowed hard to get back to dry land, but they couldn't because the sea was
 * rowed hard, dry land, raging, more and more
 *
 */

let segments = new Map(); // key: "SEGMENT 19" or "19" depending on parsing; we store display label.
let segmentKeysInOrder = [];
let activeSegmentKey = null;
let activeVerses = [];
let index = 0;
let revealed = false;

// ------- Helpers -------

function $(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  $(id).textContent = text;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a regex that matches the blank phrase with reasonable boundaries.
 * - Uses word boundaries for normal words
 * - For phrases with spaces (e.g., "dry land"), matches with \b ... \b around ends
 */
function buildBlankRegex(blankPhrase) {
  const phrase = blankPhrase.trim();
  const escaped = escapeRegex(phrase);

  // Put \b on both ends; works for "dry land" too because \b checks ends.
  // Example: \bdry land\b
  return new RegExp(`\\b${escaped}\\b`, "gi");
}

// ------- Parsing -------

function parseVersesTxt(text) {
  segments = new Map();
  segmentKeysInOrder = [];

  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/g)
    .map(b => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length < 4) continue;

    const segmentLine = lines[0]; // "SEGMENT 19"
    const reference = lines[1];
    const verseText = lines[2];
    const blanksLine = lines[3];

    // Segment key/display: preserve the full label, but also normalize spaces.
    const segLabel = segmentLine.replace(/\s+/g, " ").trim();
    if (!segments.has(segLabel)) {
      segments.set(segLabel, []);
      segmentKeysInOrder.push(segLabel);
    }

    const blanks = blanksLine
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    segments.get(segLabel).push({
      segment: segLabel,
      reference,
      text: verseText,
      blanks
    });
  }
}

// ------- UI Rendering -------

function populateSegmentDropdown() {
  const select = $("segmentSelect");
  select.innerHTML = "";

  // Default placeholder
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "— Select —";
  select.appendChild(placeholder);

  // Sort segments numerically if they look like "SEGMENT 19"
  const sorted = [...segmentKeysInOrder].sort((a, b) => {
    const na = parseInt(a.replace(/^\D+/g, ""), 10);
    const nb = parseInt(b.replace(/^\D+/g, ""), 10);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return a.localeCompare(b);
  });

  for (const segLabel of sorted) {
    const opt = document.createElement("option");
    opt.value = segLabel;
    opt.textContent = segLabel;
    select.appendChild(opt);
  }

  $("startBtn").disabled = true;
}

function showSegmentScreen(message = "") {
  $("segmentScreen").style.display = "block";
  $("practiceScreen").style.display = "none";
  setText("status", message);
}

function showPracticeScreen() {
  $("segmentScreen").style.display = "none";
  $("practiceScreen").style.display = "block";
}

function setPracticeButtonsEnabled(enabled) {
  $("revealBtn").disabled = !enabled;
  $("nextBtn").disabled = !enabled;
}

function renderActiveVerse() {
  if (!activeVerses.length) return;

  const v = activeVerses[index];
  setText("segmentLabel", v.segment);
  setText("reference", v.reference);

  let display = v.text;

  // Replace blanks either with blank underline or underlined revealed answer
  for (const blank of v.blanks) {
    const phrase = blank.trim();
    if (!phrase) continue;

    const regex = buildBlankRegex(phrase);

    if (revealed) {
      display = display.replace(regex, `<span class="revealed">$&</span>`);
    } else {
      display = display.replace(regex, `<span class="blank">&nbsp;</span>`);
    }
  }

  $("verse").innerHTML = display;

  $("revealBtn").textContent = revealed ? "Hide Answers" : "Reveal Answers";
  setText("progress", `Verse ${index + 1} of ${activeVerses.length}`);
}

// ------- Flow -------

function startSegment(segLabel) {
  activeSegmentKey = segLabel;
  activeVerses = segments.get(segLabel) || [];
  index = 0;
  revealed = false;

  if (activeVerses.length === 0) {
    showSegmentScreen(`No verses found for ${segLabel}. Check verses.txt formatting.`);
    setPracticeButtonsEnabled(false);
    return;
  }

  showPracticeScreen();
  setPracticeButtonsEnabled(true);
  renderActiveVerse();
}

// ------- Load -------

async function loadVerses() {
  try {
    showSegmentScreen("Loading verses…");

    const res = await fetch("verses.txt", { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not load verses.txt (HTTP ${res.status})`);

    const txt = await res.text();
    parseVersesTxt(txt);

    if (segments.size === 0) {
      populateSegmentDropdown();
      $("startBtn").disabled = true;
      showSegmentScreen("No segments found. Check verses.txt formatting.");
      return;
    }

    populateSegmentDropdown();
    showSegmentScreen(`Loaded ${segments.size} segment(s). Select one to begin.`);
  } catch (e) {
    populateSegmentDropdown();
    $("startBtn").disabled = true;
    showSegmentScreen(`Error: ${e.message}`);
  }
}

// ------- Events -------

$("segmentSelect").addEventListener("change", () => {
  const val = $("segmentSelect").value;
  $("startBtn").disabled = !val;
});

$("startBtn").addEventListener("click", () => {
  const seg = $("segmentSelect").value;
  if (!seg) return;
  startSegment(seg);
});

$("changeSegmentBtn").addEventListener("click", () => {
  // Return to segment picker; keep status minimal
  $("segmentSelect").value = "";
  $("startBtn").disabled = true;
  showSegmentScreen("Select a segment to practice:");
});

$("revealBtn").addEventListener("click", () => {
  revealed = !revealed;
  renderActiveVerse();
});

$("nextBtn").addEventListener("click", () => {
  if (!activeVerses.length) return;
  index = (index + 1) % activeVerses.length;
  revealed = false;
  renderActiveVerse();
});

// Boot
loadVerses();
