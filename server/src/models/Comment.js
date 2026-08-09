const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
