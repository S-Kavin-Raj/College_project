document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("dams_token");
  if (!token) {
    location.href = "/login.html";
    return;
  }
  function parse(t) {
    try {
      return JSON.parse(atob(t.split(".")[1]));
    } catch (e) {
      return {};
    }
  }
  const profile = parse(token);
  document.getElementById("profile").textContent = profile.name
    ? `${profile.name} (${profile.role})`
    : profile.role || "";
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("dams_token");
    location.href = "/login.html";
  });
});
