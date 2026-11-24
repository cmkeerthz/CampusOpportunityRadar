
const express = require("express");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Opportunity = require("./models/Opportunity");

const app = express();
const PORT = 3000;

// JSON file used for student/admin login and signup for now.
const usersFilePath = path.join(
    __dirname,
    "data",
    "users.json"
);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Convert MongoDB documents to objects with an "id" field
// so the existing frontend can use opportunity.id.
function formatOpportunity(opportunity) {
    const data = typeof opportunity.toObject === "function"
        ? opportunity.toObject()
        : opportunity;

    return {
        ...data,
        id: String(data._id || data.id)
    };
}

// GET: Retrieve all opportunities from MongoDB
app.get("/api/opportunities", async (req, res) => {
    try {
        const opportunities = await Opportunity.find().sort({
            createdAt: -1
        });

        res.json(opportunities.map(formatOpportunity));
    } catch (error) {
        console.error("Error fetching opportunities:", error.message);

        res.status(500).json({
            message: "Failed to load opportunities."
        });
    }
});

// POST: Create an opportunity in MongoDB
app.post("/api/opportunities", async (req, res) => {
    try {
        const {
            title,
            organization,
            category,
            description,
            location,
            deadline,
            skills,
            eligibleBranches,
            eligibleYears,
            applicationUrl
        } = req.body;

        if (
            !title?.trim() ||
            !organization?.trim() ||
            !category ||
            !description?.trim() ||
            !location?.trim() ||
            !deadline
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields."
            });
        }

        const opportunity = await Opportunity.create({
            title: title.trim(),
            organization: organization.trim(),
            category,
            description: description.trim(),
            location: location.trim(),
            deadline,
            skills: skills || [],
            eligibleBranches: eligibleBranches || [],
            eligibleYears: eligibleYears || [],
            applicationUrl: applicationUrl || ""
        });

        res.status(201).json({
            message: "Opportunity created successfully.",
            opportunity: formatOpportunity(opportunity)
        });
    } catch (error) {
        console.error("Error creating opportunity:", error.message);

        res.status(
            error.name === "ValidationError" ||
            error.name === "CastError" ? 400 : 500
        ).json({
            message: error.name === "ValidationError" ||
                error.name === "CastError"
                ? error.message
                : "Failed to create opportunity."
        });
    }
});

// PUT: Update an existing opportunity in MongoDB
app.put("/api/opportunities/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid opportunity ID."
            });
        }

        const allowedFields = [
            "title",
            "organization",
            "category",
            "description",
            "location",
            "deadline",
            "skills",
            "eligibleBranches",
            "eligibleYears",
            "applicationUrl"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update."
            });
        }

        const opportunity = await Opportunity.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found."
            });
        }

        res.json({
            message: "Opportunity updated successfully.",
            opportunity: formatOpportunity(opportunity)
        });
    } catch (error) {
        console.error("Error updating opportunity:", error.message);

        res.status(
            error.name === "ValidationError" ||
            error.name === "CastError" ? 400 : 500
        ).json({
            message: error.name === "ValidationError" ||
                error.name === "CastError"
                ? error.message
                : "Failed to update opportunity."
        });
    }
});

// DELETE: Remove an opportunity from MongoDB
app.delete("/api/opportunities/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid opportunity ID."
            });
        }

        const opportunity = await Opportunity.findByIdAndDelete(id);

        if (!opportunity) {
            return res.status(404).json({
                message: "Opportunity not found."
            });
        }

        res.json({
            message: "Opportunity deleted successfully.",
            opportunity: formatOpportunity(opportunity)
        });
    } catch (error) {
        console.error("Error deleting opportunity:", error.message);

        res.status(500).json({
            message: "Failed to delete opportunity."
        });
    }
});

// LOGIN: Continue reading users from users.json
app.post("/api/login", (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            message: "Email, password and role are required."
        });
    }

    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading users:", err.message);

            return res.status(500).json({
                message: "Failed to load users."
            });
        }

        try {
            const users = JSON.parse(data);

            const user = users.find(
                item =>
                    item.email?.toLowerCase() === email.toLowerCase() &&
                    item.password === password &&
                    item.role === role
            );

            if (!user) {
                return res.status(401).json({
                    message: "Invalid email, password or role."
                });
            }

            res.json({
                message: "Login successful.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error("Error reading user data:", error.message);

            res.status(500).json({
                message: "Invalid user data."
            });
        }
    });
});

// SIGNUP: Continue saving students to users.json
app.post("/api/signup", (req, res) => {
    const newStudent = req.body;

    if (
        !newStudent.name?.trim() ||
        !newStudent.email?.trim() ||
        !newStudent.password ||
        !newStudent.branch ||
        !newStudent.year
    ) {
        return res.status(400).json({
            message: "Please provide all required signup fields."
        });
    }

    fs.readFile(usersFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading users:", err.message);

            return res.status(500).json({
                message: "Failed to load users."
            });
        }

        try {
            const users = JSON.parse(data);

            const email = newStudent.email.trim().toLowerCase();

            const existingUser = users.find(
                user => user.email?.toLowerCase() === email
            );

            if (existingUser) {
                return res.status(409).json({
                    message: "An account with this email already exists."
                });
            }

            const newId = users.length > 0
                ? Math.max(...users.map(user => Number(user.id) || 0)) + 1
                : 1;

            const student = {
                id: newId,
                name: newStudent.name.trim(),
                email,
                password: newStudent.password,
                role: "student",
                branch: newStudent.branch,
                year: Number(newStudent.year),
                skills: Array.isArray(newStudent.skills)
                    ? newStudent.skills
                    : [],
                interests: Array.isArray(newStudent.interests)
                    ? newStudent.interests
                    : []
            };

            users.push(student);

            fs.writeFile(
                usersFilePath,
                JSON.stringify(users, null, 2),
                "utf8",
                writeError => {
                    if (writeError) {
                        console.error(
                            "Error saving user:",
                            writeError.message
                        );

                        return res.status(500).json({
                            message: "Failed to create account."
                        });
                    }

                    res.status(201).json({
                        message: "Student account created successfully.",
                        user: {
                            id: student.id,
                            name: student.name,
                            email: student.email,
                            role: student.role
                        }
                    });
                }
            );
        } catch (error) {
            console.error("Error processing signup:", error.message);

            res.status(500).json({
                message: "Invalid user data."
            });
        }
    });
});

// Start the server only after MongoDB connects
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });
    })
    .catch(error => {
        console.error(
            "Failed to start server:",
            error.message
        );
        process.exit(1);
    });
