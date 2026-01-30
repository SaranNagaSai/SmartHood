const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    organization: { type: String, required: true }, // Company or Community Center name
    type: { type: String, required: true, enum: ['Internship', 'Volunteering', 'Skill Sharing', 'Job'] },
    description: { type: String, required: true },
    location: { type: String, default: 'Remote' }, // Locality or 'Remote'
    duration: { type: String, default: 'Flexible' },
    skillsRequired: [String],
    stipend: { type: String, default: 'Unpaid' },
    status: { type: String, default: 'Open', enum: ['Open', 'Closed'] },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Opportunity", opportunitySchema);
