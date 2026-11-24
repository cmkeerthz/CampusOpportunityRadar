const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const branch = document.getElementById("branch").value;
    const year = Number(document.getElementById("year").value);

    const skills = document.getElementById("skills").value
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill !== "");

    const interests = document.getElementById("interests").value
        .split(",")
        .map(interest => interest.trim())
        .filter(interest => interest !== "");

    if (password !== confirmPassword) {
        signupMessage.textContent = "Passwords do not match.";
        return;
    }

    const student = {
        name,
        email,
        password,
        role: "student",
        branch,
        year,
        skills,
        interests
    };

    try {

        const response = await fetch("/api/signup", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(student)

        });

        const result = await response.json();

        if (!response.ok) {
            signupMessage.textContent = result.message;
            return;
        }

        alert("Account created successfully!");

        window.location.href = "user-login.html";

    } catch (error) {

        console.error(error);

        signupMessage.textContent =
            "Unable to create account.";

    }

});