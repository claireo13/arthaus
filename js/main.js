// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
        yearElement.setAttribute('datetime', currentYear); // Set datetime attribute for semantic HTML [p. 99].
    }
});

// You could expand this to include:
// - A responsive navigation menu toggle for mobile (hamburger icon animation etc.) [p. 57, 58].
// - Image carousels or lightboxes for the portfolio items [p. 1].

// - Filtering/sorting options for the portfolio preview (e.g., by style, room type) [p. 1].
 (function(){
    const header = document.querySelector(".site-header");
    const btn = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#site-nav");
    if(!header || !btn || !nav) return;

    btn.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
      if(!header.classList.contains("nav-open")) return;
      if(header.contains(e.target)) return;
      header.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    });

    // close on Escape
    document.addEventListener("keydown", (e) => {
      if(e.key !== "Escape") return;
      header.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    });
  })();
