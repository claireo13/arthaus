// ideas.js – shared behaviour for domestic & commercial inspiration pages
// UPDATED: supports URL filtering like ?room=bathroom

document.addEventListener("DOMContentLoaded", () => {
  // THEME TOGGLE
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const body = document.body;

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      body.classList.toggle("dark");
      const icon = themeBtn.querySelector("span");
      if (icon) icon.textContent = body.classList.contains("dark") ? "🌙" : "☀️";
    });
  }

  // FILTERS
  const filterButtons = document.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll("[data-room]");

  function applyFilter(filter) {
    items.forEach((item) => {
      const room = item.getAttribute("data-room");
      const match = filter === "all" || room === filter;
      item.style.display = match ? "inline-block" : "none";
    });
  }

  function setActiveButton(filter) {
    filterButtons.forEach((b) => b.classList.remove("is-active"));
    const matchBtn = Array.from(filterButtons).find(
      (b) => b.getAttribute("data-filter") === filter
    );
    if (matchBtn) matchBtn.classList.add("is-active");
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      // update active UI
      setActiveButton(filter);

      // apply filtering
      applyFilter(filter);

      // (optional) reflect state in URL without reloading
      const url = new URL(window.location.href);
      if (filter === "all") url.searchParams.delete("room");
      else url.searchParams.set("room", filter);
      window.history.replaceState({}, "", url);
    });
  });

  // ✅ Initial filter from URL (?room=bathroom)
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get("room");
  const initialFilter =
    roomFromUrl && Array.from(filterButtons).some((b) => b.getAttribute("data-filter") === roomFromUrl)
      ? roomFromUrl
      : "all";

  setActiveButton(initialFilter);
  applyFilter(initialFilter);

  // GLIGHTBOX
  if (typeof GLightbox === "function") {
    GLightbox({
      touchNavigation: true,
      loop: true,
      zoomable: true,
      keyboardNavigation: true,
      plyr: { css: "", js: "" },
    });
  }
});
