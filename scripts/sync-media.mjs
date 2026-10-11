// Builds data/media.json: for every Drive folder linked in data/places.js, the list of
// photos and videos inside it. Reads Drive's public folder page, so the folder must be
// shared as "anyone with the link". Run by .github/workflows/media.yml.
import fs from "node:fs";
import vm from "node:vm";

const MEDIA_PATH = "data/media.json";

function loadTravel() {
  const win = {};
  vm.runInNewContext(fs.readFileSync("data/places.js", "utf8"), { window: win });
  return win.TRAVEL;
}

function folderId(url) {
  const m = String(url || "").match(/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/|open\?id=)([\w-]+)/);
  return m ? m[1] : null;
}

const decode = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// Parse Drive's embedded folder view: one .flip-entry per file, with a type icon
async function listFolder(id, depth = 0) {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const items = [];
  for (const chunk of html.split('class="flip-entry" id="entry-').slice(1)) {
    const fileId = chunk.slice(0, chunk.indexOf('"'));
    const type = (chunk.match(/\/type\/([\w.+-]+\/[\w.+-]+)/) || [])[1] || "";
    const name = decode((chunk.match(/flip-entry-title">([^<]*)/) || [])[1] || "");
    if (type === "application/vnd.google-apps.folder") {
      if (depth < 2) items.push(...await listFolder(fileId, depth + 1));
    } else if (type.startsWith("image/")) {
      items.push({ id: fileId, name });
    } else if (type.startsWith("video/")) {
      items.push({ id: fileId, name, video: true });
    }
  }
  return items;
}

const travel = loadTravel();
const folders = [...new Set([...travel.places, ...travel.countries].map(o => folderId(o.album)).filter(Boolean))];
const previous = fs.existsSync(MEDIA_PATH) ? JSON.parse(fs.readFileSync(MEDIA_PATH, "utf8")) : {};
const media = {};

for (const id of folders) {
  try {
    const items = await listFolder(id);
    items.sort((a, b) => a.name.localeCompare(b.name));
    media[id] = items;
    console.log(`${id}: ${items.length} items`);
  } catch (e) {
    // keep what we had (e.g. a temporary Drive error) rather than wiping the gallery
    if (previous[id]) media[id] = previous[id];
    console.log(`${id}: failed (${e.message})${previous[id] ? ", kept previous list" : ""}`);
  }
}

fs.writeFileSync(MEDIA_PATH, JSON.stringify(media, null, 1) + "\n");
