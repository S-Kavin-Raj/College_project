document.addEventListener("DOMContentLoaded", () => {
  const loginType = document.getElementById("loginType");
  const yearContainer = document.getElementById("yearContainer");
  const teacherRoleContainer = document.getElementById("teacherRoleContainer");
  const loginForm = document.getElementById("loginForm");
  const msg = document.getElementById("msg");

  function update() {
    const type = loginType.value;
    if (type === "ADMIN") {
      yearContainer.style.display = "none";
      teacherRoleContainer.style.display = "none";
    } else if (type === "TEACHER") {
      yearContainer.style.display = "block";
      teacherRoleContainer.style.display = "block";
    } else {
      yearContainer.style.display = "block";
      teacherRoleContainer.style.display = "none";
    }
  }

  loginType.addEventListener("change", update);
  update();

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const department = document.getElementById("department").value;
    const academicYear = document.getElementById("academicYear").value;
    const teacherRole = document.getElementById("teacherRole").value;
    const type = loginType.value;

    msg.textContent = "";

    if (!email || !password || !department) {
      msg.textContent = "Please fill required fields";
      return;
    }

    const payload = { email, password, department_id: department };
    if (type === "TEACHER")
      (payload.academic_year_id = academicYear), (payload.role = teacherRole);
    if (type === "STUDENT") payload.academic_year_id = academicYear;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("dams_token", data.token);
        msg.textContent = "Login successful — redirecting...";
        setTimeout(() => (window.location.href = "/dashboard.html"), 800);
      } else {
        msg.textContent = data.error || data.message || "Login failed";
      }
    } catch (err) {
      msg.textContent = "Network error";
    }
  });
});
