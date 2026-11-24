const studentName = document.getElementById("studentName");

const totalOpportunities =
    document.getElementById("totalOpportunities");

const dashboardOpportunityContainer =
    document.getElementById(
        "dashboardOpportunityContainer"
    );

const logoutButton =
    document.getElementById("logoutButton");


// Check logged-in user
const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInUser"));


if (!loggedInUser) {

    window.location.href = "user-login.html";

}


// Display student name
studentName.textContent =
    loggedInUser.name;


// Load opportunities
async function loadDashboardOpportunities() {

    try {

        const response =
            await fetch("/api/opportunities");

        if (!response.ok) {

            throw new Error(
                "Failed to load opportunities"
            );

        }

        const opportunities =
            await response.json();


        totalOpportunities.textContent =
            opportunities.length;


        displayDashboardOpportunities(
            opportunities.slice(0, 4)
        );


    } catch (error) {

        console.error(error);

        dashboardOpportunityContainer.innerHTML = `
            <p>Unable to load opportunities.</p>
        `;

    }

}


// Display opportunities
function displayDashboardOpportunities(
    opportunities
) {

    if (opportunities.length === 0) {

        dashboardOpportunityContainer.innerHTML = `
            <p>No opportunities available.</p>
        `;

        return;

    }


    dashboardOpportunityContainer.innerHTML =
        opportunities.map(opportunity => {

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
        ${formatDate(
            opportunity.deadline
        )}
    </span>

</div>


<a
    href="opportunity-details.html?id=${opportunity.id}"
    class="view-details"
>
    View Details →
</a>

</article>
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


loadDashboardOpportunities();