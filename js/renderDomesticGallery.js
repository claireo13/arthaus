// js/renderDomesticGallery.js
// Renders the style-group sections + gallery thumbs from window.domesticGallery.
// Keeps the same classes/attributes your current filters and moodboard code expect.

document.addEventListener("DOMContentLoaded", () => {
  const data = window.domesticGallery;
  const container = document.getElementById("style-groups");
  if (!container || !Array.isArray(data)) return;

  // Group by style
  const byStyle = new Map();
  for (const item of data) {
    const style = (item.style || "other").toLowerCase();
    if (!byStyle.has(style)) byStyle.set(style, []);
    byStyle.get(style).push(item);
  }

  // Style order (matches your site choices)
  const styleOrder = [
    "minimalist", "modern", "eclectic", "rustic", "contemporary", "traditional",
    "world", "coastal", "industrial", "country", "scandinavian", "victorian"
  ];

  const styles = [
    ...styleOrder.filter(s => byStyle.has(s)),
    ...Array.from(byStyle.keys()).filter(s => !styleOrder.includes(s))
  ];

  container.innerHTML = "";

  for (const style of styles) {
    const section = document.createElement("section");
    section.className = "style-group";
    section.dataset.styleGroup = style;

    const h3 = document.createElement("h3");
    h3.className = "style-group__title";
    h3.textContent = style;

    const grid = document.createElement("div");
    grid.className = "style-group__grid";

    for (const item of byStyle.get(style)) {
      const card = document.createElement("div");
      card.className = "gallery-thumb";

      // Existing filter attributes (your domestic.js uses these)
      card.dataset.room = item.room;
      card.dataset.style = item.style;

      // Moodboard attributes (saveMoodboard.js uses these)
      card.dataset.mbPage = "domestic";
      card.dataset.mbRoom = item.room;
      card.dataset.mbStyle = item.style;
      card.dataset.mbTitle = item.title;
      card.dataset.mbImage = item.image;

      card.innerHTML = `
        <div class="gallery-thumb__inner">
          <img src="${item.image}"
               alt="${(item.alt || item.title || "").replaceAll('"', '&quot;')}"
               loading="lazy"
               decoding="async" />
          <div class="gallery-thumb__body">
            <div class="gallery-thumb__room">${item.roomLabel || item.room}</div>
            <div class="gallery-thumb__title">${item.title || ""}</div>
            <div class="gallery-thumb__style">Style: ${capitalize(item.style)}</div>
          </div>
        </div>
      `;

      grid.appendChild(card);
    }

    section.appendChild(h3);
    section.appendChild(grid);
    container.appendChild(section);
  }

  function capitalize(s) {
    s = String(s || "");
    return s ? s[0].toUpperCase() + s.slice(1) : s;
  }
});
