
const opportunityForm = document.getElementById("opportunityForm");
const adminMessage = document.getElementById("adminMessage");
const adminOpportunityContainer = document.getElementById(
    "adminOpportunityContainer"
);
const logoutLink = document.getElementById("logoutLink");

const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null"
);

// Only allow the admin interface to be displayed to an admin user.
if (!loggedInUser || loggedInUser.role !== "admin") {
    window.location.href = "admin-login.html";
}

// Get an opportunity's MongoDB ID or older JSON ID.
function getOpportunityId(opportunity) {
    return opportunity._id ?? opportunity.id;
}

// Escape text before inserting it into HTML.
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Convert a date to YYYY-MM-DD for the edit prompt.
function dateForInput(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        // Preserve an existing date string if it cannot be parsed.
        return String(value);
    }

    return date.toISOString().slice(0, 10);
}

// Display a date in a readable format.
function formatDate(value) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not specified";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}

// Convert comma-separated text into an array.
function parseList(value) {
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

// Convert comma-separated year values into numbers.
function parseYears(value) {
    return value
        .split(",")
        .map((year) => year.trim())
        .filter(Boolean)
        .map(Number)
        .filter((year) => Number.isInteger(year) && year > 0);
}

// Read the server response safely.
async function readResponse(response) {
    const text = await response.text();

    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

// Load opportunities from the backend.
async function loadOpportunities() {
    adminOpportunityContainer.innerHTML =
        "<p>Loading opportunities...</p>";

    try {
        const response = await fetch("/api/opportunities");

        const result = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to load opportunities."
            );
        }

        if (!Array.isArray(result)) {
            throw new Error(
                "The server did not return an opportunity list."
            );
        }

        displayOpportunities(result);
    } catch (error) {
        console.error("Loading opportunities failed:", error);

        adminOpportunityContainer.innerHTML =
            "<p>Unable to load opportunities. Check the backend server.</p>";
    }
}

// Display opportunity cards with Edit and Delete buttons.
function displayOpportunities(opportunities) {
    if (opportunities.length === 0) {
        adminOpportunityContainer.innerHTML =
            "<p>No opportunities available.</p>";
        return;
    }

    adminOpportunityContainer.innerHTML = opportunities.map((item) => {
        const id = getOpportunityId(item);

        return `
            <article class="card">
                <span class="badge">
                    ${escapeHtml(item.category || "Opportunity")}
                </span>

                <h3>${escapeHtml(item.title || "Untitled Opportunity")}</h3>

                <p class="organization">
                    ${escapeHtml(item.organization || "Organization not specified")}
                </p>

                <p>
                    Deadline: ${escapeHtml(formatDate(item.deadline))}
                </p>

                <div class="admin-actions">
                    <button
                        type="button"
                        data-action="edit"
                        data-id="${escapeHtml(id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        data-action="delete"
                        data-id="${escapeHtml(id)}"
                    >
                        Delete
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

// Add a new opportunity.
opportunityForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newOpportunity = {
        title: document.getElementById("title").value.trim(),
        organization: document.getElementById("organization").value.trim(),
        category: document.getElementById("category").value,
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        deadline: document.getElementById("deadline").value,
        skills: parseList(document.getElementById("skills").value),
        eligibleBranches: parseList(
            document.getElementById("branches").value
        ),
        eligibleYears: parseYears(
            document.getElementById("years").value
        ),
        applicationUrl: document.getElementById("applicationUrl").value.trim()
    };

    try {
        adminMessage.textContent = "Adding opportunity...";

        const response = await fetch("/api/opportunities", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newOpportunity)
        });

        const result = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to add opportunity."
            );
        }

        adminMessage.textContent = "Opportunity added successfully.";
        opportunityForm.reset();

        await loadOpportunities();
    } catch (error) {
        console.error("Adding opportunity failed:", error);
        adminMessage.textContent = error.message;
    }
});

// Delete an opportunity.
async function deleteOpportunity(id) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this opportunity?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `/api/opportunities/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        const result = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to delete opportunity."
            );
        }

        adminMessage.textContent = "Opportunity deleted successfully.";
        await loadOpportunities();
    } catch (error) {
        console.error("Deleting opportunity failed:", error);
        window.alert(error.message);
    }
}

// Edit an opportunity, using its current values as prompt defaults.
async function editOpportunity(id) {
    try {
        // Get the latest record so the prompts contain current values.
        const listResponse = await fetch("/api/opportunities");
        const opportunities = await readResponse(listResponse);

        if (!listResponse.ok || !Array.isArray(opportunities)) {
            throw new Error("Could not retrieve the opportunity to edit.");
        }

        const opportunity = opportunities.find(
            (item) => String(getOpportunityId(item)) === String(id)
        );

        if (!opportunity) {
            throw new Error(
                "Opportunity not found. Refresh the page and try again."
            );
        }

        const title = window.prompt(
            "Title:",
            opportunity.title || ""
        );
        if (title === null) return;
        if (!title.trim()) {
            window.alert("Title cannot be empty.");
            return;
        }

        const organization = window.prompt(
            "Organization:",
            opportunity.organization || ""
        );
        if (organization === null) return;
        if (!organization.trim()) {
            window.alert("Organization cannot be empty.");
            return;
        }

        const category = window.prompt(
            "Category (Internship, Hackathon, Workshop, Competition, Certification):",
            opportunity.category || "Internship"
        );
        if (category === null) return;
        if (!category.trim()) {
            window.alert("Category cannot be empty.");
            return;
        }

        const description = window.prompt(
            "Description:",
            opportunity.description || ""
        );
        if (description === null) return;
        if (!description.trim()) {
            window.alert("Description cannot be empty.");
            return;
        }

        const location = window.prompt(
            "Location:",
            opportunity.location || ""
        );
        if (location === null) return;
        if (!location.trim()) {
            window.alert("Location cannot be empty.");
            return;
        }

        const deadline = window.prompt(
            "Deadline (YYYY-MM-DD):",
            dateForInput(opportunity.deadline)
        );
        if (deadline === null) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline.trim())) {
            window.alert("Enter the deadline in YYYY-MM-DD format.");
            return;
        }

        const skills = window.prompt(
            "Skills (comma separated):",
            Array.isArray(opportunity.skills)
                ? opportunity.skills.join(", ")
                : ""
        );
        if (skills === null) return;

        const branches = window.prompt(
            "Eligible Branches (comma separated):",
            Array.isArray(opportunity.eligibleBranches)
                ? opportunity.eligibleBranches.join(", ")
                : ""
        );
        if (branches === null) return;

        const years = window.prompt(
            "Eligible Years (comma separated):",
            Array.isArray(opportunity.eligibleYears)
                ? opportunity.eligibleYears.join(", ")
                : ""
        );
        if (years === null) return;

        const applicationUrl = window.prompt(
            "Application URL:",
            opportunity.applicationUrl || ""
        );
        if (applicationUrl === null) return;

        const updatedOpportunity = {
            title: title.trim(),
            organization: organization.trim(),
            category: category.trim(),
            description: description.trim(),
            location: location.trim(),
            deadline: deadline.trim(),
            skills: parseList(skills),
            eligibleBranches: parseList(branches),
            eligibleYears: parseYears(years),
            applicationUrl: applicationUrl.trim()
        };

        const response = await fetch(
            `/api/opportunities/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedOpportunity)
            }
        );

        const result = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to update opportunity."
            );
        }

        adminMessage.textContent = "Opportunity updated successfully.";
        await loadOpportunities();
    } catch (error) {
        console.error("Editing opportunity failed:", error);
        window.alert(`Edit failed: ${error.message}`);
    }
}

// Handle Edit and Delete button clicks.
adminOpportunityContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action][data-id]");

    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "edit") {
        editOpportunity(id);
    } else if (action === "delete") {
        deleteOpportunity(id);
    }
});

// Log out the administrator.
logoutLink.addEventListener("click", (event) => {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");
    window.location.href = "admin-login.html";
});

// Load records when the page opens.
loadOpportunities();
