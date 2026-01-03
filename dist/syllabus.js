document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("dams_token");
  if (!token) {
    location.href = "/login.html";
    return;
  }

  const classSelect = document.getElementById("classSelect");
  const syllabusDiv = document.getElementById("syllabus");
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

  function parseToken(t) {
    try {
      return JSON.parse(atob(t.split(".")[1]));
    } catch (e) {
      return {};
    }
  }
  const profile = parseToken(token);

  classSelect.addEventListener("change", async () => {
    const id = classSelect.value;
    if (!id) return;
    const res = await api("/syllabus?class_id=" + id);
    const rows = await res.json();
    if (!rows || rows.length === 0) {
      syllabusDiv.innerHTML = "<p>No syllabus</p>";
      return;
    }

    // Group by syllabus id / subject
    const grouped = {};
    for (const r of rows) {
      if (!grouped[r.id]) grouped[r.id] = { subject: r.subject, units: [] };
      grouped[r.id].units.push({
        id: r.unit_no + "-" + r.unit_title,
        unit_db_id: r.unit_id,
        unit_no: r.unit_no,
        title: r.unit_title,
        completed: r.completed,
      });
    }

    syllabusDiv.innerHTML = Object.keys(grouped)
      .map(
        (k) => `
      <div class="subject">
        <h3>${grouped[k].subject}</h3>
        ${grouped[k].units
          .map(
            (u) => `
          <div class="unit" data-id="${u.unit_db_id}">
            <label><input type="checkbox" ${u.completed ? "checked" : ""} ${
              profile.role === "STAFF" || profile.role === "ADVISOR"
                ? ""
                : "disabled"
            } class="unit-check"> ${u.unit_no} - ${u.title}</label>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("");

    // Attach handlers
    for (const cb of document.querySelectorAll(".unit-check")) {
      cb.addEventListener("change", async (e) => {
        const unitElem = e.target.closest(".unit");
        const id = unitElem.dataset.id;
        const completed = e.target.checked ? true : false;
        const res = await api("/syllabus/update", {
          method: "POST",
          body: JSON.stringify({ unit_id: id, completed }),
        });
        const data = await res.json();
        if (!res.ok) {
          msg.textContent = data.error || data.message || "Failed";
        } else {
          msg.textContent = "Updated";
        }
      });
    }
  });
});
