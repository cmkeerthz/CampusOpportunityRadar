
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },
        branch: {
            type: String,
            default: ""
        },
        year: {
            type: Number,
            min: 1,
            max: 4
        },
        skills: {
            type: [String],
            default: []
        },
        interests: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
