document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("dams_token");
  if (!token) {
    location.href = "/login.html";
    return;
  }
  const list = document.getElementById("list");
  const emailInp = document.getElementById("email");
  const addBtn = document.getElementById("addBtn");
  const msg = document.getElementById("msg");

  async function api(path, opts = {}) {
    const res = await fetch(
      "/admin" + path,
      Object.assign(
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        },
        opts
      )
    );
    return res;
  }

  async function load() {
    const res = await api("/authorized-emails");
    if (!res.ok) {
      list.innerHTML = "Failed to load";
      return;
    }
    const rows = await res.json();
    list.innerHTML =
      rows
        .map(
          (r) =>
            `<div>${r.email} <button data-id="${r.id}" class="remove">Remove</button></div>`
        )
        .join("") || "<p>No authorized emails</p>";
    for (const b of document.querySelectorAll(".remove")) {
      b.addEventListener("click", async () => {
        const id = b.dataset.id;
        const r = await api("/authorized-emails/" + id, { method: "DELETE" });
        const d = await r.json();
        if (r.ok) load();
        else msg.textContent = d.error || "Failed";
      });
    }
  }

  addBtn.addEventListener("click", async () => {
    const em = emailInp.value.trim();
    if (!em) {
      msg.textContent = "Email required";
      return;
    }
    const res = await api("/authorized-emails", {
      method: "POST",
      body: JSON.stringify({ email: em }),
    });
    const data = await res.json();
    if (res.ok) {
      msg.textContent = data.message || "Added";
      emailInp.value = "";
      load();
    } else {
      msg.textContent = data.error || "Failed";
    }
  });

  load();
});
