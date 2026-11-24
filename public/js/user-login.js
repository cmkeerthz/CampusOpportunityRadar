const loginForm = document.getElementById("userLoginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password,
                role: "student"
            })
        });

        const result = await response.json();

        if (!response.ok) {
            loginMessage.textContent = result.message;
            return;
        }

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(result.user)
        );

        window.location.href = "student-dashboard.html";

    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            "Unable to connect to server.";
    }
});