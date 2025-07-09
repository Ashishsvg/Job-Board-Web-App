document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;  // Capture the username from the form
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  });

  const data = await res.json();

  if (data.success) {
    
    localStorage.setItem("username", username);  // Storing the username

    
    if (data.role === "admin") {
      window.location.href = "/admin/home.html";
    } else {
      window.location.href = "/student/student2.html";
    }
  } else {
    
    alert(data.message);
  }
});
