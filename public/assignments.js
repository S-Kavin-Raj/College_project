document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("dams_token");
  if (!token) {
    location.href = "/login.html";
    return;
  }

  const classSelect = document.getElementById("classSelect");
  const assignmentsDiv = document.getElementById("assignments");
  const createForm = document.getElementById("createForm");
  const createBtn = document.getElementById("createBtn");
  const msg = document.getElementById("msg");

  async function api(path, opts = {}) {
    const res = await fetch(
      path,
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

  const classesRes = await fetch("/classes", {
    headers: { Authorization: "Bearer " + token },
  });
  const classes = await classesRes.json();
  classSelect.innerHTML =
    '<option value="">Select a class</option>' +
    classes
      .map(
        (c) => `<option value="${c.id}">${c.department} - ${c.year}</option>`
      )
      .join("");

  // Determine role from token payload (naive decode)
  function parseToken(t) {
    try {
      return JSON.parse(atob(t.split(".")[1]));
    } catch (e) {
      return {};
    }
  }
  const profile = parseToken(token);
  if (profile.role === "STAFF") createForm.style.display = "block";

  classSelect.addEventListener("change", async () => {
    const id = classSelect.value;
    if (!id) {
      assignmentsDiv.innerHTML = "";
      return;
    }
    const res = await api("/assignments?class_id=" + id);
    const rows = await res.json();
    assignmentsDiv.innerHTML =
      rows
        .map(
          (a) => `
      <div class="assignment">
        <h4>${a.title} <small>(due ${new Date(
            a.due_date
          ).toLocaleDateString()})</small></h4>
        <p>${a.description || ""}</p>
        ${
          profile.role === "STUDENT"
            ? `<button data-id="${a.id}" class="submit">Submit</button>`
            : ""
        }
      </div>
    `
        )
        .join("") || "<p>No assignments</p>";

    for (const b of document.querySelectorAll(".submit")) {
      b.addEventListener("click", async () => {
        const id = b.dataset.id;
        const res = await api("/assignments/submit", {
          method: "POST",
          body: JSON.stringify({ assignment_id: parseInt(id, 10) }),
        });
        const data = await res.json();
        if (res.ok) msg.textContent = "Submitted: " + data.status;
        else msg.textContent = data.error || "Failed";
      });
    }
  });

  createBtn.addEventListener("click", async () => {
    const id = classSelect.value;
    if (!id) {
      msg.textContent = "Select class";
      return;
    }
    const title = document.getElementById("title").value.trim();
    const due_date = document.getElementById("due_date").value;
    const description = document.getElementById("description").value.trim();
    if (!title || !due_date) {
      msg.textContent = "Title and due date required";
      return;
    }
    const res = await api("/assignments/create", {
      method: "POST",
      body: JSON.stringify({
        class_id: parseInt(id, 10),
        title,
        description,
        due_date,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      msg.textContent = "Created (or request submitted)";
      classSelect.dispatchEvent(new Event("change"));
    } else {
      msg.textContent = data.error || data.message || "Failed";
    }
  });
});
