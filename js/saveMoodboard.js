
// js/saveMoodboard.js
// Injects "Save" overlays + saves to Supabase
// Bonus: if user tried to save while logged out, auto-saves after login via sessionStorage.

document.addEventListener("DOMContentLoaded", async () => {
  const client = window.supabaseClient;
  if (!client) {
    console.error("supabaseClient missing. Load supabaseClient.js after the Supabase CDN.");
    return;
  }

  const items = Array.from(document.querySelectorAll("[data-mb-image]"));
  if (!items.length) return;

  const { data: sessData } = await client.auth.getSession();
  const session = sessData?.session || null;

  // existing saved set (used for quick UI state)
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

  function ensurePositioned(el) {
    const style = window.getComputedStyle(el);
    if (style.position === "static") el.style.position = "relative";
  }

  function cardPayload(el, sess) {
    return {
      user_id: sess.user.id,
      page: el.dataset.mbPage || "domestic",
      room: el.dataset.mbRoom || "unknown",
      style: el.dataset.mbStyle || "unknown",
      title: el.dataset.mbTitle || "",
      image_url: el.dataset.mbImage
    };
  }

  async function insertIfNotSaved(payload) {
    if (savedSet.has(payload.image_url)) return { ok: true, already: true };

    const { error } = await client.from("moodboard_items").insert(payload);
    if (error) {
      // If you later add a unique constraint, you might get "duplicate key" here.
      throw error;
    }

    savedSet.add(payload.image_url);
    return { ok: true, already: false };
  }

  function setButtonSaved(btn) {
    btn.classList.add("is-saved");
    btn.innerHTML = `<span aria-hidden="true">✓</span><span>Saved</span>`;
  }

  function makeButton(el) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "save-btn";
    btn.innerHTML = `<span aria-hidden="true">☆</span><span>Save</span>`;
    btn.setAttribute("aria-label", "Save to moodboard");

    const imageUrl = el.dataset.mbImage;
    if (savedSet.has(imageUrl)) setButtonSaved(btn);

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // If not logged in, store pending save and redirect to login
      if (!session) {
        const pending = {
          mbPage: el.dataset.mbPage || "domestic",
          mbRoom: el.dataset.mbRoom || "unknown",
          mbStyle: el.dataset.mbStyle || "unknown",
          mbTitle: el.dataset.mbTitle || "",
          mbImage: el.dataset.mbImage || "",
          returnTo: window.location.href
        };
        sessionStorage.setItem("pendingMoodboardSave", JSON.stringify(pending));

        const returnTo = encodeURIComponent(window.location.href);
        window.location.href = `login.html?returnTo=${returnTo}`;
        return;
      }

      if (btn.classList.contains("is-saved")) return;

      btn.disabled = true;

      try {
        const payload = cardPayload(el, session);
        await insertIfNotSaved(payload);
        setButtonSaved(btn);
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
    const host =
      el.querySelector(".gallery-thumb__inner") ||
      el.querySelector(".gallery-thumb__media") ||
      el;

    ensurePositioned(host);
    if (host.querySelector(".save-btn")) return;

    host.appendChild(makeButton(el));
  });

  // ---- Auto-save pending item after login ----
  // If user came back from login and there is a pending save, save it now.
  if (session) {
    const pendingRaw = sessionStorage.getItem("pendingMoodboardSave");
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw);

        // Only auto-save if we're on the same page they came back to (safety)
        // (If you want it to save no matter what page, remove this if-block.)
        const samePage = pending?.returnTo && pending.returnTo.split("#")[0] === window.location.href.split("#")[0];

        if (samePage && pending?.mbImage) {
          // find matching element on page
          const match = items.find((el) => el.dataset.mbImage === pending.mbImage);

          // Build payload from pending (not from DOM) so it works even if card isn't found
          const payload = {
            user_id: session.user.id,
            page: pending.mbPage || "domestic",
            room: pending.mbRoom || "unknown",
            style: pending.mbStyle || "unknown",
            title: pending.mbTitle || "",
            image_url: pending.mbImage
          };

          await insertIfNotSaved(payload);

          // Update UI if card exists
          if (match) {
            const host =
              match.querySelector(".gallery-thumb__inner") ||
              match.querySelector(".gallery-thumb__media") ||
              match;

            const btn = host.querySelector(".save-btn");
            if (btn) setButtonSaved(btn);
          }
        }
      } catch (err) {
        console.error("Auto-save pending failed:", err);
      } finally {
        // Always clear pending so it doesn't keep trying
        sessionStorage.removeItem("pendingMoodboardSave");
      }
    }
  }
});
