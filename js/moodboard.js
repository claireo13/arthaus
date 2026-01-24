// js/moodboard.js
// Loads and manages the user's moodboard items from Supabase.

document.addEventListener("DOMContentLoaded", async () => {
  const client = window.supabaseClient;
  if (!client) {
    console.error("supabaseClient missing. Make sure supabaseClient.js is loaded after the Supabase CDN.");
    return;
  }

  const grid = document.getElementById("mbGrid");
  const empty = document.getElementById("mbEmpty");
  const summary = document.getElementById("mbSummary");
  const statusBox = document.getElementById("mbStatus");

  const qInput = document.getElementById("mbSearch");
  const pageSel = document.getElementById("mbPage");
  const roomSel = document.getElementById("mbRoom");
  const styleSel = document.getElementById("mbStyle");
  const sortSel = document.getElementById("mbSort");

  const logoutLink = document.getElementById("logoutLink");

  let session = null;
  let allItems = [];
  let filtered = [];

  function setStatus(msg, type = "info") {
    if (!statusBox) return;
    statusBox.hidden = !msg;
    statusBox.textContent = msg;
    statusBox.style.borderColor =
      type === "error" ? "rgba(220,38,38,.35)" :
      type === "success" ? "rgba(16,185,129,.35)" :
      "rgba(0,0,0,.12)";
  }

  async function requireSession() {
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error(error);
      window.location.href = "login.html";
      return null;
    }
    if (!data?.session) {
      window.location.href = "login.html";
      return null;
    }
    return data.session;
  }

  function uniqueSorted(values) {
    const s = new Set(values.filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }

  function refillSelect(selectEl, values, allLabel) {
    const current = selectEl.value || "all";
    selectEl.innerHTML = "";
    const optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = allLabel;
    selectEl.appendChild(optAll);

    for (const v of values) {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      selectEl.appendChild(o);
    }

    // restore if possible
    selectEl.value = Array.from(selectEl.options).some(o => o.value === current) ? current : "all";
  }

  function normalize(s) {
    return String(s || "").trim().toLowerCase();
  }

  function applyFilters() {
    const q = normalize(qInput.value);
    const page = pageSel.value;
    const room = roomSel.value;
    const style = styleSel.value;

    filtered = allItems.filter((it) => {
      if (page !== "all" && it.page !== page) return false;
      if (room !== "all" && it.room !== room) return false;
      if (style !== "all" && it.style !== style) return false;

      if (!q) return true;
      const hay = normalize(`${it.title || ""} ${it.room} ${it.style} ${it.page}`);
      return hay.includes(q);
    });

    // sort
    const sort = sortSel.value;
    filtered.sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sort === "room") return String(a.room).localeCompare(String(b.room));
      if (sort === "style") return String(a.style).localeCompare(String(b.style));
      return 0;
    });

    render();
  }

  function render() {
    grid.innerHTML = "";

    if (!filtered.length) {
      empty.hidden = allItems.length !== 0; // show empty only when truly none
      summary.textContent = allItems.length
        ? "No matches for your current filters."
        : "";
      return;
    }

    empty.hidden = true;
    summary.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} shown`;

    for (const it of filtered) {
      const card = document.createElement("article");
      card.style.border = "1px solid rgba(0,0,0,.08)";
      card.style.background = "var(--color-bg-alt)";
      card.style.boxShadow = "var(--shadow-soft)";
      card.style.overflow = "hidden";
      card.style.borderRadius = "0";

      const img = document.createElement("img");
      img.src = it.image_url;
      img.alt = it.title || `${it.room} • ${it.style}`;
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.height = "220px";
      img.style.objectFit = "cover";
      img.style.display = "block";

      const body = document.createElement("div");
      body.style.padding = ".7rem .8rem .8rem";

      const meta = document.createElement("div");
      meta.style.fontSize = ".72rem";
      meta.style.letterSpacing = ".12em";
      meta.style.textTransform = "uppercase";
      meta.style.opacity = ".7";
      meta.textContent = `${it.page} • ${it.room} • ${it.style}`;

      const title = document.createElement("div");
      title.style.fontSize = ".92rem";
      title.style.marginTop = ".25rem";
      title.style.fontWeight = "600";
      title.textContent = it.title || "Saved inspiration";

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = ".5rem";
      actions.style.marginTop = ".7rem";
      actions.style.alignItems = "center";
      actions.style.justifyContent = "space-between";

      const open = document.createElement("a");
      open.href = it.image_url;
      open.target = "_blank";
      open.rel = "noopener";
      open.textContent = "Open image";
      open.style.fontSize = ".85rem";
      open.style.textDecoration = "underline";
      open.style.textUnderlineOffset = "4px";
      open.style.opacity = ".85";
      open.style.color = "inherit";

      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "Remove";
      del.style.border = "1px solid rgba(0,0,0,.14)";
      del.style.background = "#fff";
      del.style.color = "var(--color-text)";
      del.style.padding = ".45rem .65rem";
      del.style.cursor = "pointer";
      del.style.borderRadius = "0";
      del.addEventListener("click", async () => {
        const ok = confirm("Remove this item from your moodboard?");
        if (!ok) return;

        del.disabled = true;
        try {
          const { error } = await client
            .from("moodboard_items")
            .delete()
            .eq("id", it.id);

          if (error) throw error;

          // remove locally
          allItems = allItems.filter(x => x.id !== it.id);
          // rebuild filters (rooms/styles might change)
          refillSelect(roomSel, uniqueSorted(allItems.map(x => x.room)), "All rooms");
          refillSelect(styleSel, uniqueSorted(allItems.map(x => x.style)), "All styles");

          setStatus("Removed.", "success");
          applyFilters();
        } catch (err) {
          console.error(err);
          setStatus(err?.message || "Could not remove item.", "error");
          del.disabled = false;
        }
      });

      actions.appendChild(open);
      actions.appendChild(del);

      body.appendChild(meta);
      body.appendChild(title);
      body.appendChild(actions);

      card.appendChild(img);
      card.appendChild(body);

      grid.appendChild(card);
    }
  }

  // Events
  [qInput, pageSel, roomSel, styleSel, sortSel].forEach((el) => {
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });

  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await client.auth.signOut();
      window.location.href = "login.html";
    });
  }

  // 1) Require login
  session = await requireSession();
  if (!session) return;

  // 2) Load items
  try {
    setStatus("Loading your moodboard…");
    const { data, error } = await client
      .from("moodboard_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    allItems = Array.isArray(data) ? data : [];
    setStatus("");

    // Fill filter dropdowns based on data
    refillSelect(roomSel, uniqueSorted(allItems.map(x => x.room)), "All rooms");
    refillSelect(styleSel, uniqueSorted(allItems.map(x => x.style)), "All styles");

    // Show empty or items
    filtered = [...allItems];
    applyFilters();
  } catch (err) {
    console.error(err);
    setStatus(err?.message || "Could not load moodboard items.", "error");
  }
});
