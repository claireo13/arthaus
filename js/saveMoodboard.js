// js/saveMoodboard.js
document.addEventListener("DOMContentLoaded", async () => {
  const client = window.supabaseClient;
  if (!client) {
    console.error("supabaseClient missing. Load supabaseClient.js after the Supabase CDN.");
    return;
  }

  // Find gallery items that have the required data
  const items = Array.from(document.querySelectorAll("[data-mb-image]"));
  if (!items.length) return;

  // Get session (if not logged in we still show buttons, but clicking redirects to login)
  const { data: sessData } = await client.auth.getSession();
  const session = sessData?.session || null;

  // If logged in, fetch existing saved image_urls for quick duplicate check
  let savedSet = new Set();
  if (session) {
    const { data, error } = await client
      .from("moodboard_items")
      .select("image_url")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      savedSet = new Set(data.map(x => x.image_url));
    }
  }

  function ensurePositioned(el){
    const style = window.getComputedStyle(el);
    if (style.position === "static") el.style.position = "relative";
  }

  function makeButton(el){
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "save-btn";
    btn.innerHTML = `<span aria-hidden="true">☆</span><span>Save</span>`;
    btn.setAttribute("aria-label", "Save to moodboard");

    const image_url = el.dataset.mbImage;
    if (savedSet.has(image_url)) {
      btn.classList.add("is-saved");
      btn.innerHTML = `<span aria-hidden="true">✓</span><span>Saved</span>`;
    }

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // If not logged in, go to login and come back
      if (!session) {
        const returnTo = encodeURIComponent(window.location.href);
        window.location.href = `login.html?returnTo=${returnTo}`;
        return;
      }

      // Prevent double-saving in UI
      if (btn.classList.contains("is-saved")) return;

      btn.disabled = true;

      try {
        const payload = {
          user_id: session.user.id,
          page: el.dataset.mbPage || "domestic",
          room: el.dataset.mbRoom || "unknown",
          style: el.dataset.mbStyle || "unknown",
          title: el.dataset.mbTitle || "",
          image_url
        };

        const { error } = await client.from("moodboard_items").insert(payload);
        if (error) throw error;

        savedSet.add(image_url);
        btn.classList.add("is-saved");
        btn.innerHTML = `<span aria-hidden="true">✓</span><span>Saved</span>`;
      } catch (err) {
        console.error(err);
        alert(err?.message || "Could not save item.");
        btn.disabled = false;
        return;
      }

      btn.disabled = false;
    });

    return btn;
  }

  // Inject buttons
  items.forEach((el) => {
    // choose a sensible overlay host: the image wrapper / card inner
    const host =
      el.querySelector(".gallery-thumb__inner") ||
      el.querySelector(".gallery-thumb__media") ||
      el;

    ensurePositioned(host);
    // avoid duplicates if script runs twice
    if (host.querySelector(".save-btn")) return;

    host.appendChild(makeButton(el));
  });
});
