
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/opportunities";

const CATEGORY_IMAGES = {
  Internship:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
  Hackathon:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  Workshop:
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80",
  Competition:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
  Certification:
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";

function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Load opportunities from the Node.js backend.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchOpportunities() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load opportunities.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid opportunity data received.");
        }

        setOpportunities(data);
        setError("");
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Error loading opportunities:", err);

        setError(
          "Could not load opportunities. Please check the backend server."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchOpportunities();

    return () => controller.abort();
  }, []);

  // Build category options from the available opportunities.
  const categories = [
    "All",
    ...new Set(
      opportunities
        .map((item) => item.category)
        .filter(
          (value) =>
            typeof value === "string" && value.trim() !== ""
        )
    ),
  ];

  // Search by title, organization, description, or skills.
  const searchText = search.trim().toLowerCase();

  const filteredOpportunities = opportunities.filter((item) => {
    const matchesCategory =
      category === "All" || item.category === category;

    const searchableText = [
      item.title,
      item.organization,
      item.description,
      ...(Array.isArray(item.skills) ? item.skills : []),
    ]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .toLowerCase();

    return matchesCategory && searchableText.includes(searchText);
  });

  // Select an image based on the opportunity category.
  function getCategoryImage(categoryName) {
    return CATEGORY_IMAGES[categoryName] || DEFAULT_IMAGE;
  }

  // Format deadlines safely.
  function formatDate(deadline) {
    if (!deadline) {
      return "Not specified";
    }

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return (
    <div className="app">
      <header className="navbar">
        <a
          className="brand"
          href="#"
          aria-label="Opportunity Radar home"
        >
          Opportunity<span>Radar</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#">Home</a>
          <a href="#opportunities">Explore Opportunities</a>

          <a href="http://localhost:3000/user-login.html">
            Student Login
          </a>

          <a href="http://localhost:3000/admin-login.html">
            Admin Login
          </a>

          <a
            className="signup-link"
            href="http://localhost:3000/signup.html"
          >
            Sign Up
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR FUTURE STARTS HERE</p>

          <h1>
            Discover Opportunities.
            <br />
            <span>Build Your Future.</span>
          </h1>

          <p className="hero-description">
            Find internships, hackathons, workshops, competitions
            and certifications that match your interests and career goals.
          </p>

          <a className="primary-button" href="#opportunities">
            Explore Opportunities →
          </a>
        </section>

        <section className="opportunities" id="opportunities">
          <p className="eyebrow">EXPLORE AND GROW</p>

          <h2>Opportunities for You</h2>

          <p className="section-description">
            Discover your next learning experience and career opportunity.
          </p>

          <div className="filters">
            <input
              type="search"
              placeholder="Search opportunities..."
              aria-label="Search opportunities"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Categories" : item}
                </option>
              ))}
            </select>
          </div>

          {loading && <p>Loading opportunities...</p>}

          {!loading && error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && (
            <>
              {filteredOpportunities.length === 0 ? (
                <p className="empty-message">
                  {opportunities.length === 0
                    ? "No opportunities are available yet."
                    : "No matching opportunities found."}
                </p>
              ) : (
                <div className="opportunity-grid">
                  {filteredOpportunities.map((item, index) => (
                    <article
                      className="opportunity-card"
                      key={item._id || item.id || index}
                    >
                      <div className="opportunity-image">
                        <img
                          src={getCategoryImage(item.category)}
                          alt={`${item.category || "Student"} opportunity`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                      </div>

                      <span className="category-badge">
                        {item.category || "Opportunity"}
                      </span>

                      <h3>
                        {item.title || "Untitled Opportunity"}
                      </h3>

                      <p className="organization">
                        {item.organization ||
                          "Organization not specified"}
                      </p>

                      <p className="card-description">
                        {item.description ||
                          "No description available."}
                      </p>

                      <div className="card-meta">
                        <span>
                          {item.location ||
                            "Location not specified"}
                        </span>

                        <span>
                          Deadline: {formatDate(item.deadline)}
                        </span>
                      </div>

                      {item.applicationUrl && (
                        <a
                          className="details-link"
                          href={item.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Application →
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        Campus Opportunity Radar · Discover. Learn. Grow.
      </footer>
    </div>
  );
}

export default App;
