const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    educationLevel: { type: String, required: true, enum: ['School', 'Inter', 'Diploma', 'UG', 'PG'] },
    classYear: { type: String, required: true },
    degreeType: { type: String },
    academicInterests: [String],
    skillVolunteering: [String],
    internshipVisibility: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
