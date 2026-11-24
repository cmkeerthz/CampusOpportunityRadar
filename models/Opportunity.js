
const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },
        organization: {
            type: String,
            required: [true, "Organization is required"],
            trim: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "Internship",
                "Hackathon",
                "Workshop",
                "Competition",
                "Certification"
            ]
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true
        },
        deadline: {
            type: Date,
            required: [true, "Deadline is required"]
        },
        skills: {
            type: [String],
            default: []
        },
        eligibleBranches: {
            type: [String],
            default: []
        },
        eligibleYears: {
            type: [Number],
            default: []
        },
        applicationUrl: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Opportunity",
    opportunitySchema
);
