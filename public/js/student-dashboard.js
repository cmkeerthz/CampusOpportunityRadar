const studentName = document.getElementById("studentName");

const totalOpportunities =
    document.getElementById("totalOpportunities");

const totalApplications =
    document.getElementById("totalApplications");

const closingSoon =
    document.getElementById("closingSoon");

const recommendedContainer =
    document.getElementById("recommendedContainer");

const deadlineContainer =
    document.getElementById("deadlineContainer");

const logoutButton =
    document.getElementById("logoutButton");


let opportunities = [];


// Get logged-in student

const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInUser"));


if (!loggedInUser) {

    window.location.href = "user-login.html";

} else {

    studentName.textContent =
        loggedInUser.name;

}


// Load opportunities

async function loadDashboard() {

    try {

        const response =
            await fetch("/api/opportunities");

        if (!response.ok) {

            throw new Error(
                "Failed to load opportunities"
            );

        }

        opportunities =
            await response.json();


        displayStatistics();

        displayRecommended();

        displayDeadlines();

    }

    catch (error) {

        console.error(error);

        recommendedContainer.innerHTML =
            "<p>Unable to load opportunities.</p>";

        deadlineContainer.innerHTML =
            "<p>Unable to load deadlines.</p>";

    }

}


// Dashboard statistics

function displayStatistics() {

    totalOpportunities.textContent =
        opportunities.length;


    // For now applications are stored locally.
    const applications =
        JSON.parse(
            localStorage.getItem("applications")
        ) || [];


    totalApplications.textContent =
        applications.length;


    const today =
        new Date();


    const closingCount =
        opportunities.filter(opportunity => {

            const deadline =
                new Date(opportunity.deadline);

            const difference =
                deadline - today;

            const days =
                difference /
                (1000 * 60 * 60 * 24);

            return days >= 0 && days <= 7;

        }).length;


    closingSoon.textContent =
        closingCount;

}


// Display recommended opportunities

function displayRecommended() {

    const recommended =
        opportunities.slice(0, 4);


    if (recommended.length === 0) {

        recommendedContainer.innerHTML =
            "<p>No opportunities available.</p>";

        return;

    }


    recommendedContainer.innerHTML =
        recommended.map(opportunity => {

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


                    <a
                        href="opportunity-details.html?id=${opportunity.id}"
                        class="details-button"
                    >
                        View Details
                    </a>

                </article>

            `;

        }).join("");

}


// Display deadlines

function displayDeadlines() {

    const sorted =
        [...opportunities]
            .sort(
                (a, b) =>
                    new Date(a.deadline) -
                    new Date(b.deadline)
            )
            .slice(0, 5);


    if (sorted.length === 0) {

        deadlineContainer.innerHTML =
            "<p>No upcoming deadlines.</p>";

        return;

    }


    deadlineContainer.innerHTML =
        sorted.map(opportunity => {

            return `

                <div class="deadline-item">

                    <div>

                        <strong>
                            ${opportunity.title}
                        </strong>

                        <p>
                            ${opportunity.organization}
                        </p>

                    </div>


                    <span class="deadline">
                        ${formatDate(opportunity.deadline)}
                    </span>

                </div>

            `;

        }).join("");

}


// Format date

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// Logout

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "loggedInUser"
        );

        window.location.href =
            "user-login.html";

    }
);


loadDashboard();