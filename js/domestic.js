// js/domestic.js
// Filters + sorting + pager behavior for the Domestic ideas page.

(function () {
  const styleGroupsWrap = document.getElementById("style-groups");
  if (!styleGroupsWrap) return;

  const roomWrapper = document.getElementById("room-wrapper");
  const styleWrapper = document.getElementById("style-wrapper");
  const roomPill = document.getElementById("room-pill");
  const stylePill = document.getElementById("style-pill");
  const roomMenu = document.getElementById("room-menu");
  const styleMenu = document.getElementById("style-menu");
  const roomLabel = document.getElementById("room-pill-label");
  const styleLabel = document.getElementById("style-pill-label");
  const sortSelect = document.getElementById("sort-select");

  let roomFilter = "all";
  let styleFilter = "all";
  let sortMode = "default";

  // IMPORTANT: gallery is rendered dynamically, so always query fresh
  const getAllCards = () => Array.from(document.querySelectorAll(".gallery-thumb"));
  const getAllSections = () => Array.from(document.querySelectorAll(".style-group"));

  // ----- Dropdown behaviour (overlays, no layout shift) -----
  function openMenu(wrapper, pill, menu) {
    wrapper.classList.add("is-open");
    pill.setAttribute("aria-expanded", "true");
    menu.classList.add("filter-menu--open");
  }

  function closeMenu(wrapper, pill, menu) {
    wrapper.classList.remove("is-open");
    pill.setAttribute("aria-expanded", "false");
    menu.classList.remove("filter-menu--open");
  }

  function toggleMenu(wrapper, pill, menu) {
    const isOpen = menu.classList.contains("filter-menu--open");
    if (isOpen) closeMenu(wrapper, pill, menu);
    else {
      closeMenu(roomWrapper, roomPill, roomMenu);
      closeMenu(styleWrapper, stylePill, styleMenu);
      openMenu(wrapper, pill, menu);
    }
  }

  if (roomPill) roomPill.addEventListener("click", () => toggleMenu(roomWrapper, roomPill, roomMenu));
  if (stylePill) stylePill.addEventListener("click", () => toggleMenu(styleWrapper, stylePill, styleMenu));

  document.addEventListener("click", (e) => {
    if (roomWrapper && !roomWrapper.contains(e.target)) closeMenu(roomWrapper, roomPill, roomMenu);
    if (styleWrapper && !styleWrapper.contains(e.target)) closeMenu(styleWrapper, stylePill, styleMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (roomWrapper) closeMenu(roomWrapper, roomPill, roomMenu);
      if (styleWrapper) closeMenu(styleWrapper, stylePill, styleMenu);
    }
  });

  // ----- Filtering + section hiding -----
  function cardMatches(card) {
    const r = card.getAttribute("data-room");
    const s = card.getAttribute("data-style");
    const roomOk = (roomFilter === "all") || (r === roomFilter);
    const styleOk = (styleFilter === "all") || (s === styleFilter);
    return roomOk && styleOk;
  }

  function applyVisibility() {
    getAllCards().forEach(card => {
      card.style.display = cardMatches(card) ? "inline-block" : "none";
    });

    getAllSections().forEach(section => {
      const visible = section.querySelectorAll('.gallery-thumb:not([style*="display: none"])');
      section.style.display = visible.length ? "" : "none";
    });
  }

  // ----- Sorting (within each section, only visible cards) -----
  function sortVisibleWithinSections() {
    if (sortMode === "default") return;

    getAllSections().forEach(section => {
      const grid = section.querySelector(".style-group__grid");
      if (!grid) return;

      const cards = Array.from(grid.querySelectorAll(".gallery-thumb"))
        .filter(c => c.style.display !== "none");

      const keyFn = (c) => {
        if (sortMode === "room") return (c.getAttribute("data-room") || "").toLowerCase();
        if (sortMode === "title") return (c.getAttribute("data-title") || "").toLowerCase();
        return "";
      };

      cards.sort((a, b) => keyFn(a).localeCompare(keyFn(b)));
      cards.forEach(c => grid.appendChild(c));
    });
  }

  function applyAll() {
    applyVisibility();
    sortVisibleWithinSections();

    // keep URL in sync (room/style only; we keep p as-is)
    const url = new URL(window.location.href);
    if (roomFilter === "all") url.searchParams.delete("room"); else url.searchParams.set("room", roomFilter);
    if (styleFilter === "all") url.searchParams.delete("style"); else url.searchParams.set("style", styleFilter);
    window.history.replaceState({}, "", url);
  }

  // ----- Menu item clicks -----
  if (roomMenu) {
    roomMenu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-room-value]");
      if (!btn) return;
      roomFilter = btn.getAttribute("data-room-value");
      if (roomLabel) roomLabel.textContent = btn.textContent;
      closeMenu(roomWrapper, roomPill, roomMenu);
      applyAll();
      styleGroupsWrap.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (styleMenu) {
    styleMenu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-style-value]");
      if (!btn) return;
      styleFilter = btn.getAttribute("data-style-value");
      if (styleLabel) styleLabel.textContent = btn.textContent;
      closeMenu(styleWrapper, stylePill, styleMenu);
      applyAll();
      styleGroupsWrap.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      sortMode = sortSelect.value || "default";
      applyAll();
    });
  }

  // ----- Room strip click: filter without reloading (still works if JS off) -----
  document.querySelectorAll("[data-room-link]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      roomFilter = link.getAttribute("data-room-link") || "all";

      const btn = roomMenu ? roomMenu.querySelector(`[data-room-value="${roomFilter}"]`) : null;
      if (roomLabel) roomLabel.textContent = btn ? btn.textContent : "All rooms";

      applyAll();
      styleGroupsWrap.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ----- Apply from URL on first load -----
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get("room");
  const styleFromUrl = params.get("style");

  if (roomFromUrl && roomMenu && roomMenu.querySelector(`[data-room-value="${roomFromUrl}"]`)) {
    roomFilter = roomFromUrl;
    if (roomLabel) roomLabel.textContent = roomMenu.querySelector(`[data-room-value="${roomFromUrl}"]`).textContent;
  }

  if (styleFromUrl && styleMenu && styleMenu.querySelector(`[data-style-value="${styleFromUrl}"]`)) {
    styleFilter = styleFromUrl;
    if (styleLabel) styleLabel.textContent = styleMenu.querySelector(`[data-style-value="${styleFromUrl}"]`).textContent;
  }

  // ----- Pager rules: compute total pages from gallery length, 24 per page -----
   // ----- Pager: auto-generate page numbers, 24 per page -----
  const pageParam = Math.max(1, parseInt(params.get("p") || "1", 10));
  const perPage = 24;

  const total = (window.domesticGallery && Array.isArray(window.domesticGallery))
    ? Math.max(1, Math.ceil(window.domesticGallery.length / perPage))
    : 1;

  const pager = document.querySelector("[data-pager]");
  const prev = document.querySelector("[data-pager-prev]");
  const next = document.querySelector("[data-pager-next]");
  const nums = document.querySelector("[data-pager-nums]");

  const baseUrl = new URL(window.location.href);

  const buildHref = (p) => {
    const u = new URL(baseUrl.toString());
    u.searchParams.set("p", String(p));
    return u.pathname.split("/").pop() + u.search; // relative file + query
  };

  // Prev/Next hrefs
  if (prev) prev.href = buildHref(Math.max(1, pageParam - 1));
  if (next) next.href = buildHref(Math.min(total, pageParam + 1));

  // Disable prev/next on ends
  if (prev) {
    const disabled = pageParam <= 1;
    prev.classList.toggle("is-disabled", disabled);
    prev.setAttribute("aria-disabled", disabled ? "true" : "false");
    prev.tabIndex = disabled ? -1 : 0;
    if (disabled) prev.href = "#";
  }

  if (next) {
    const disabled = pageParam >= total;
    next.classList.toggle("is-disabled", disabled);
    next.setAttribute("aria-disabled", disabled ? "true" : "false");
    next.tabIndex = disabled ? -1 : 0;
    if (disabled) next.href = "#";
  }

  // Auto-generate numbers
  if (pager && nums) {
    nums.innerHTML = "";

    const windowSize = 2;
    const start = Math.max(1, pageParam - windowSize);
    const end = Math.min(total, pageParam + windowSize);

    const makeLink = (p) => {
      const a = document.createElement("a");
      a.className = "pager__link";
      a.href = buildHref(p);
      a.textContent = String(p);
      if (p === pageParam) a.classList.add("pager__link--current");
      return a;
    };

    const makeDots = () => {
      const s = document.createElement("span");
      s.className = "pager__dots";
      s.textContent = "…";
      return s;
    };

    nums.appendChild(makeLink(1));

    if (start > 2) nums.appendChild(makeDots());

    for (let p = Math.max(2, start); p <= Math.min(total - 1, end); p++) {
      nums.appendChild(makeLink(p));
    }

    if (end < total - 1) nums.appendChild(makeDots());

    if (total > 1) nums.appendChild(makeLink(total));
  }


  // initial apply
  applyAll();
})();


