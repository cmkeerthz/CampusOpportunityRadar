const opportunityDetails =
    document.getElementById("opportunityDetails");

const params =
    new URLSearchParams(window.location.search);

const opportunityId =
    params.get("id");


async function loadOpportunity() {

    try {

        const response =
            await fetch("/api/opportunities");

        if (!response.ok) {
            throw new Error("Failed to load opportunities");
        }

        const opportunities =
            await response.json();

        const opportunity =
            opportunities.find(
                item => String(item.id) === String(opportunityId)
            );


        if (!opportunity) {

            opportunityDetails.innerHTML = `
                <h2>Opportunity not found</h2>
                <p>
                    The opportunity you are looking for does not exist.
                </p>

                <a href="student-dashboard.html">
                    Back to Dashboard
                </a>
            `;

            return;
        }


        opportunityDetails.innerHTML = `

            <div class="details-card">

                <span class="badge">
                    ${opportunity.category}
                </span>

                <h1>
                    ${opportunity.title}
                </h1>

                <p class="organization">
                    ${opportunity.organization}
                </p>


                <div class="details-grid">

                    <div>
                        <strong>Location</strong>
                        <p>${opportunity.location}</p>
                    </div>

                    <div>
                        <strong>Deadline</strong>
                        <p>${formatDate(opportunity.deadline)}</p>
                    </div>

                </div>


                <div class="details-section">

                    <h3>Description</h3>

                    <p>
                        ${opportunity.description}
                    </p>

                </div>


                <div class="details-section">

                    <h3>Required Skills</h3>

                    <div class="skill-list">

                        ${opportunity.skills.map(skill => `
                            <span class="skill-tag">
                                ${skill}
                            </span>
                        `).join("")}

                    </div>

                </div>


                <div class="details-section">

                    <h3>Eligible Branches</h3>

                    <p>
                        ${opportunity.eligibleBranches.join(", ")}
                    </p>

                </div>


                <div class="details-section">

                    <h3>Eligible Years</h3>

                    <p>
                        ${opportunity.eligibleYears.join(", ")}
                    </p>

                </div>


                <div class="details-actions">

                    <a
                        href="${opportunity.applicationUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="apply-button"
                    >
                        Apply Now
                    </a>

                    <a
                        href="student-dashboard.html"
                        class="back-button"
                    >
                        Back to Dashboard
                    </a>

                </div>

            </div>
        `;
        

    } catch (error) {

        console.error(error);

        opportunityDetails.innerHTML = `
            <p>
                Unable to load opportunity details.
            </p>
        `;
    }
}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


loadOpportunity();