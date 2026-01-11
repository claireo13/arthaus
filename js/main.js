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