// js/auth.js
// Handles register + login using Supabase on static sites (GitHub Pages)

document.addEventListener("DOMContentLoaded", () => {
  const client = window.supabaseClient;
  if (!client) {
    console.error("supabaseClient missing. Make sure supabaseClient.js is loaded after the Supabase CDN script.");
    return;
  }

  const page = document.body.dataset.authPage; // "register" or "login"
  console.log("auth.js page:", page);

  if (!page) return;

  const form = document.querySelector("form[data-auth-form]");
  if (!form) {
    console.error("No form[data-auth-form] found.");
    return;
  }

  const statusBox = document.getElementById("authStatus");
  const submitBtn = document.getElementById("authSubmit");

 const moodboardUrl = new URL("moodboard.html", window.location.href).href;
const destination = safeReturnTo || moodboardUrl;


  function setStatus(msg, type = "info") {
    if (!statusBox) return;
    statusBox.hidden = !msg;
    statusBox.textContent = msg;
    statusBox.dataset.type = type;
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? "Please wait…" : submitBtn.dataset.label;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // IMPORTANT: stops the POST -> fixes 405
    console.log("auth submit fired");
    setStatus("");

    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "").trim();
    const passwordConfirm = String(fd.get("password_confirm") || "");

    if (!email || !password) {
      setStatus("Please enter your email and password.", "error");
      return;
    }

    if (page === "register") {
      if (!name) {
        setStatus("Please enter your name.", "error");
        return;
      }
      if (password.length < 8) {
        setStatus("Please use a password of at least 8 characters.", "error");
        return;
      }
      if (password !== passwordConfirm) {
        setStatus("Passwords do not match.", "error");
        return;
      }
    }

    setLoading(true);

    try {
      if (page === "register") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: moodboardUrl,
            data: { full_name: name }
          }
        });
        if (error) throw error;

        if (data?.session) {
          window.location.href = destination;
          return;
        }

        setStatus("Account created. Please check your email to confirm, then log in.", "success");
        form.reset();
      } else if (page === "login") {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data?.session) {
          window.location.href = destination;
          return;
        }

        setStatus("Login succeeded but no session returned. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
});
