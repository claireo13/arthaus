// js/main.js
header.classList.remove("nav-open");
btn.setAttribute("aria-expanded", "false");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (!header || !btn || !nav) return;

  btn.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // close when clicking outside
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




