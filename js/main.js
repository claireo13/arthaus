document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (!header || !btn || !nav) {
    console.warn("Nav init failed:", { header: !!header, btn: !!btn, nav: !!nav });
    return;
  }

  // start closed
  header.classList.remove("nav-open");
  btn.setAttribute("aria-expanded", "false");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const open = header.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // close when tapping outside
  document.addEventListener("click", (e) => {
    if (!header.classList.contains("nav-open")) return;
    if (header.contains(e.target)) return;
    header.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
  });

  // close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    header.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
  });
});




