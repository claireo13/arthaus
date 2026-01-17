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

  const allCards = Array.from(document.querySelectorAll(".gallery-thumb"));
  const allSections = Array.from(document.querySelectorAll(".style-group"));

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

  roomPill.addEventListener("click", () => toggleMenu(roomWrapper, roomPill, roomMenu));
  stylePill.addEventListener("click", () => toggleMenu(styleWrapper, stylePill, styleMenu));

  document.addEventListener("click", (e) => {
    const clickedRoom = roomWrapper.contains(e.target);
    const clickedStyle = styleWrapper.contains(e.target);
    if (!clickedRoom) closeMenu(roomWrapper, roomPill, roomMenu);
    if (!clickedStyle) closeMenu(styleWrapper, stylePill, styleMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu(roomWrapper, roomPill, roomMenu);
      closeMenu(styleWrapper, stylePill, styleMenu);
    }
  });

  function cardMatches(card) {
    const r = card.getAttribute("data-room");
    const s = card.getAttribute("data-style");
    const roomOk = (roomFilter === "all") || (r === roomFilter);
    const styleOk = (styleFilter === "all") || (s === styleFilter);
    return roomOk && styleOk;
  }

  function applyVisibility() {
    allCards.forEach(card => {
      card.style.display = cardMatches(card) ? "inline-block" : "none";
    });

    allSections.forEach(section => {
      const visibleCards = section.querySelectorAll('.gallery-thumb:not([style*="display: none"])');
      section.style.display = visibleCards.length ? "" : "none";
    });
  }

  function sortVisibleWithinSections() {
    if (sortMode === "default") return;

    allSections.forEach(section => {
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

    const url = new URL(window.location.href);
    if (roomFilter === "all") url.searchParams.delete("room"); else url.searchParams.set("room", roomFilter);
    if (styleFilter === "all") url.searchParams.delete("style"); else url.searchParams.set("style", styleFilter);
    window.history.replaceState({}, "", url);
  }

  roomMenu.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-room-value]");
    if (!btn) return;
    roomFilter = btn.getAttribute("data-room-value");
    roomLabel.textContent = btn.textContent;
    closeMenu(roomWrapper, roomPill, roomMenu);
    applyAll();
    styleGroupsWrap.scrollIntoView({ behavior: "smooth" });
  });

  styleMenu.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-style-value]");
    if (!btn) return;
    styleFilter = btn.getAttribute("data-style-value");
    styleLabel.textContent = btn.textContent;
    closeMenu(styleWrapper, stylePill, styleMenu);
    applyAll();
    styleGroupsWrap.scrollIntoView({ behavior: "smooth" });
  });

  sortSelect.addEventListener("change", () => {
    sortMode = sortSelect.value || "default";
    applyAll();
  });

  document.querySelectorAll("[data-room-link]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      roomFilter = link.getAttribute("data-room-link") || "all";
      const btn = roomMenu.querySelector(`[data-room-value="${roomFilter}"]`);
      roomLabel.textContent = btn ? btn.textContent : "All spaces";
      applyAll();
      styleGroupsWrap.scrollIntoView({ behavior: "smooth" });
    });
  });

  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get("room");
  const styleFromUrl = params.get("style");

  if (roomFromUrl && roomMenu.querySelector(`[data-room-value="${roomFromUrl}"]`)) {
    roomFilter = roomFromUrl;
    roomLabel.textContent = roomMenu.querySelector(`[data-room-value="${roomFromUrl}"]`).textContent;
  }
  if (styleFromUrl && styleMenu.querySelector(`[data-style-value="${styleFromUrl}"]`)) {
    styleFilter = styleFromUrl;
    styleLabel.textContent = styleMenu.querySelector(`[data-style-value="${styleFromUrl}"]`).textContent;
  }

  const page = parseInt(document.body.getAttribute("data-page") || "1", 10);
  const total = parseInt(document.body.getAttribute("data-total-pages") || "1", 10);
  const prev = document.querySelector("[data-pager-prev]");
  const next = document.querySelector("[data-pager-next]");

  if (prev && page <= 1) {
    prev.classList.add("is-disabled");
    prev.setAttribute("aria-disabled", "true");
    prev.setAttribute("tabindex", "-1");
    prev.href = "#";
  }
  if (next && page >= total) {
    next.classList.add("is-disabled");
    next.setAttribute("aria-disabled", "true");
    next.setAttribute("tabindex", "-1");
    next.href = "#";
  }

  applyAll();
})();
