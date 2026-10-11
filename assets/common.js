// Shared helpers for the viewer (index.html) and the editor (edit.html).
window.TravelCommon = (() => {
  const SEPARATE = { name: "כל אחד בנפרד", color: "#b388ff" };
  const regionNames = (() => { try { return new Intl.DisplayNames(["he"], { type: "region" }); } catch { return null; } })();

  const asList = w => Array.isArray(w) ? w : (w ? [w] : []);

  // the "strongest" category: together > each separately > one of us
  const category = whoSet => {
    if (whoSet.has("together")) return "together";
    if (whoSet.has("me") && whoSet.has("partner")) return "separate";
    if (whoSet.has("me")) return "me";
    return "partner";
  };

  const catInfo = (people, c) => c === "separate" ? SEPARATE : people[c];
  const whoLabel = (people, who) => asList(who).map(w => people[w].name).join(" + ");

  // code -> Set(who), from explicit countries plus the countries of places
  function aggregateCountries(data) {
    const map = new Map();
    const add = (code, who) => {
      if (!code) return;
      if (!map.has(code)) map.set(code, new Set());
      asList(who).forEach(w => map.get(code).add(w));
    };
    data.countries.forEach(c => add(c.code, c.who));
    data.places.forEach(p => add(p.code, p.who));
    return map;
  }

  function countryName(props) {
    if (regionNames && props.iso2) { try { return regionNames.of(props.iso2); } catch {} }
    return props.name;
  }

  // centroid of the largest ring — good enough to aim the camera
  function centroid(feature) {
    const g = feature.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    const ring = polys.map(p => p[0]).sort((a, b) => b.length - a.length)[0];
    let x = 0, y = 0;
    ring.forEach(([lng, lat]) => { x += lng; y += lat; });
    return { lng: x / ring.length, lat: y / ring.length };
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Photo-real Earth: NASA imagery, terrain relief, shiny oceans and a slowly drifting cloud layer.
  function realisticGlobe(globe) {
    globe
      .globeImageUrl("assets/earth.jpg")
      .bumpImageUrl("assets/earth-topology.png")
      .backgroundImageUrl("assets/night-sky.png")
      .atmosphereColor("#9cc8ff")
      .atmosphereAltitude(0.16);
    if (!window.THREE) return;
    const loader = new THREE.TextureLoader();
    loader.load("assets/earth-water.png", tex => {
      const mat = globe.globeMaterial();
      mat.specularMap = tex;
      mat.specular.setRGB(0.45, 0.45, 0.45);
      mat.shininess = 18;
      mat.needsUpdate = true;
    });
    loader.load("assets/clouds-alpha.jpg", tex => {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(globe.getGlobeRadius() * 1.006, 75, 75),
        new THREE.MeshPhongMaterial({ color: 0xffffff, alphaMap: tex, transparent: true, opacity: 0.85, depthWrite: false })
      );
      clouds.raycast = () => {}; // clicks go through to the globe
      globe.scene().add(clouds);
      (function drift() { clouds.rotation.y -= 0.00012; requestAnimationFrame(drift); })();
    });
  }

  // Load data/places.js bypassing the browser cache so edits show up quickly.
  function loadSiteData() {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "data/places.js?v=" + Date.now();
      s.onload = () => resolve(window.TRAVEL);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadCountries() {
    return fetch("data/countries.geojson")
      .then(r => r.json())
      .then(geo => geo.features.filter(f => f.properties.code !== "ATA"));
  }

  return { SEPARATE, asList, category, catInfo, whoLabel, aggregateCountries, countryName, centroid, hexA, esc, realisticGlobe, loadSiteData, loadCountries };
})();
