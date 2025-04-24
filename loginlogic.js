window.onload = async () => {

    const from = sessionStorage.getItem("redirectFrom");
    if (from === "shop") {
        sessionStorage.removeItem("redirectFrom");
        setTimeout(() => {
            alert("You must be logged in for that!");
        }, 100);
    }

    try {
        const res = await fetch("/currentuser");
        const userData = await res.json();

        if (userData.loggedIn) {
            // ✅ User already logged in, redirect to profile
            console.log("User is already logged in:", userData.user.username);
            window.location.href = "Profile/Profile.html";
        }
    } catch (err) {
        console.error("Error checking login state:", err);
    }
};

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.clear(); // Optional: clean old data
            console.log("Login successful:", data.username);

            localStorage.setItem("userId", data.userId);
            localStorage.setItem("user", data.username);

            window.location.href = "Profile/Profile.html";
        } else {
            alert(data.error);
        }

    } catch (error) {
        console.error("Login error:", error);
    }
});