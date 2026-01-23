// js/supabaseClient.js
// Uses the Supabase JS CDN (no build tools needed)

const SUPABASE_URL = "https://oqyixgmnghcmujsqmgna.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_906BMOr21u0eM5mwyutZ7A_GPZ_y6Ni";

// Supabase library is loaded from CDN in your HTML before this file.
// This creates a reusable client.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

<script>
  console.log("SUPABASE_URL =", window.SUPABASE_URL);
  console.log("Has supabase?", !!window.supabase);
  console.log("Has client?", !!window.supabaseClient);
</script>
