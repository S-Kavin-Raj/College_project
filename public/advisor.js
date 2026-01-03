document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("dams_token");
  if (!token) {
    location.href = "/login.html";
    return;
  }
  const requestsDiv = document.getElementById("requests");

  async function load() {
    const res = await fetch("/advisor/requests", {
      headers: { Authorization: "Bearer " + token },
    });
    const rows = await res.json();
    requestsDiv.innerHTML =
      rows
        .map(
          (r) => `
      <div class="req">
        <h3>${r.table_name} - ${r.change_type}</h3>
        <pre>${JSON.stringify(r.new_data, null, 2)}</pre>
        <button class="approve" data-id="${r.id}">Approve</button>
        <button class="reject" data-id="${r.id}">Reject</button>
      </div>
    `
        )
        .join("") || "<p>No pending requests</p>";

    for (const b of document.querySelectorAll(".approve")) {
      b.addEventListener("click", async () => {
        const id = b.dataset.id;
        const res = await fetch("/advisor/requests/process", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: id,
            action: "APPROVE",
            advisor_comment: "Approved via UI",
          }),
        });
        if (res.ok) load();
        else alert("Failed");
      });
    }
    for (const b of document.querySelectorAll(".reject")) {
      b.addEventListener("click", async () => {
        const id = b.dataset.id;
        const res = await fetch("/advisor/requests/process", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: id,
            action: "REJECT",
            advisor_comment: "Rejected via UI",
          }),
        });
        if (res.ok) load();
        else alert("Failed");
      });
    }
  }

  load();
});
