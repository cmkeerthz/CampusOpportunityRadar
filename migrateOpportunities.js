
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Opportunity = require("./models/Opportunity");

async function migrateOpportunities() {
    try {
        await connectDB();

        // Read opportunities from the JSON file
        const filePath = path.join(
            __dirname,
            "data",
            "opportunities.json"
        );

        const fileData = fs.readFileSync(filePath, "utf8");
        const opportunities = JSON.parse(fileData);

        if (!Array.isArray(opportunities)) {
            throw new Error(
                "opportunities.json must contain an array."
            );
        }

        if (opportunities.length === 0) {
            console.log("No opportunities to migrate.");
            return;
        }

        // Convert DD/MM/YYYY deadlines into YYYY-MM-DD
        const normalizedOpportunities = opportunities.map(
            (opportunity) => {
                const deadline = opportunity.deadline;

                if (
                    typeof deadline === "string" &&
                    /^\d{2}\/\d{2}\/\d{4}$/.test(deadline)
                ) {
                    const [day, month, year] = deadline.split("/");
                    opportunity.deadline = `${year}-${month}-${day}`;
                }

                return opportunity;
            }
        );

        // Avoid inserting duplicates
        const existingCount =
            await Opportunity.countDocuments();

        if (existingCount > 0) {
            console.log(
                "MongoDB already contains opportunities. Migration skipped to avoid duplicates."
            );
            return;
        }

        // Save opportunities to MongoDB
        await Opportunity.insertMany(normalizedOpportunities);

        console.log(
            `${normalizedOpportunities.length} opportunities migrated successfully.`
        );
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

migrateOpportunities();
