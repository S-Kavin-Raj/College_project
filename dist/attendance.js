document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("dams_token");
  if (!token) {
    location.href = "/login.html";
    return;
  }

  const classSelect = document.getElementById("classSelect");
  const studentsDiv = document.getElementById("students");
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("msg");

  async function api(path, opts = {}) {
    const res = await fetch(
      "/attendance" + path,
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

  // Load classes
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

  classSelect.addEventListener("change", async () => {
    const id = classSelect.value;
    if (!id) return;
    studentsDiv.innerHTML = "Loading...";
    const res = await fetch(`/classes/${id}/students`, {
      headers: { Authorization: "Bearer " + token },
    });
    const students = await res.json();
    studentsDiv.innerHTML = students
      .map(
        (s) => `
      <div class="student-row" data-id="${s.id}">
        <strong>${s.full_name}</strong> <small>${s.email}</small>
        <label>FN <select class="fn"><option value="NA">NA</option><option value="PRESENT">PRESENT</option><option value="ABSENT">ABSENT</option></select></label>
        <label>AN <select class="an"><option value="NA">NA</option><option value="PRESENT">PRESENT</option><option value="ABSENT">ABSENT</option></select></label>
      </div>
    `
      )
      .join("");
  });

  submitBtn.addEventListener("click", async () => {
    const id = classSelect.value;
    if (!id) {
      msg.textContent = "Select class";
      return;
    }
    const entries = Array.from(document.querySelectorAll(".student-row")).map(
      (r) => {
        const sid = parseInt(r.dataset.id, 10);
        const fn = r.querySelector(".fn").value;
        const an = r.querySelector(".an").value;
        const day =
          (fn !== "NA" && fn !== null) || (an !== "NA" && an !== null)
            ? "PRESENT"
            : "NA";
        return {
          student_id: sid,
          fn_status: fn,
          an_status: an,
          day_result: day,
        };
      }
    );

    const res = await api("/mark", {
      method: "POST",
      body: JSON.stringify({
        class_id: parseInt(id, 10),
        entries,
        department_id: null,
        academic_year_id: null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      msg.textContent = data.message || "Attendance submitted";
    } else {
      msg.textContent = data.error || "Failed";
    }
  });
});
