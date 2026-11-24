const opportunityContainer = document.getElementById(
    "opportunityContainer"
);

const opportunityCount = document.getElementById(
    "opportunityCount"
);

const searchInput = document.getElementById(
    "searchInput"
);

const categoryFilter = document.getElementById(
    "categoryFilter"
);

// Add these two
const opportunityForm = document.getElementById(
    "opportunityForm"
);

const formMessage = document.getElementById(
    "formMessage"
);

let opportunities = [];


async function loadOpportunities() {

    try {

        const response = await fetch("/api/opportunities");

        if (!response.ok) {
            throw new Error("Failed to fetch opportunities");
        }

        opportunities = await response.json();

        displayOpportunities(opportunities);

    } catch (error) {

        console.error(error);

        opportunityContainer.innerHTML = `
            <p>Unable to load opportunities.</p>
        `;
    }
}


function displayOpportunities(data) {

    opportunityCount.textContent =
        `${data.length} opportunities`;

    if (data.length === 0) {

        opportunityContainer.innerHTML = `
            <p>No opportunities found.</p>
        `;

        return;
    }

    opportunityContainer.innerHTML = data.map(opportunity => {

        return `
            <article class="card">

                <div class="card-top">

                    <span class="badge">
                        ${opportunity.category}
                    </span>

                </div>

                <h3>
                    ${opportunity.title}
                </h3>

                <p class="organization">
                    ${opportunity.organization}
                </p>

                <p class="description">
                    ${opportunity.description}
                </p>

                <div class="card-footer">

                    <span>
                        ${opportunity.location}
                    </span>

                    <span class="deadline">
                        Deadline:
                        ${formatDate(opportunity.deadline)}
                    </span>

                </div>

            </article>
        `;

    }).join("");
}


function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


function filterOpportunities() {

    const searchTerm =
        searchInput.value.toLowerCase().trim();

    const selectedCategory =
        categoryFilter.value;

    const filtered = opportunities.filter(opportunity => {

        const matchesSearch =
            opportunity.title.toLowerCase().includes(searchTerm) ||
            opportunity.organization.toLowerCase().includes(searchTerm) ||
            opportunity.skills.some(skill =>
                skill.toLowerCase().includes(searchTerm)
            );

        const matchesCategory =
            selectedCategory === "all" ||
            opportunity.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayOpportunities(filtered);
}


searchInput.addEventListener(
    "input",
    filterOpportunities
);


categoryFilter.addEventListener(
    "change",
    filterOpportunities
);


loadOpportunities();
opportunityForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const newOpportunity = {
        title: document.getElementById("title").value,
        organization: document.getElementById("organization").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        location: document.getElementById("location").value,
        deadline: document.getElementById("deadline").value,

        skills: document
            .getElementById("skills")
            .value
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill !== ""),

        eligibleBranches: document
            .getElementById("eligibleBranches")
            .value
            .split(",")
            .map(branch => branch.trim())
            .filter(branch => branch !== ""),

        eligibleYears: document
            .getElementById("eligibleYears")
            .value
            .split(",")
            .map(year => Number(year.trim()))
            .filter(year => !isNaN(year)),

        applicationUrl:
            document.getElementById("applicationUrl").value
    };

    try {

        const response = await fetch("/api/opportunities", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newOpportunity)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        formMessage.textContent =
            "Opportunity added successfully!";

        opportunityForm.reset();

        await loadOpportunities();

    } catch (error) {

        console.error(error);

        formMessage.textContent =
            "Failed to add opportunity.";
    }
});