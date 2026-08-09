const mongoose = require("mongoose");

const {
  COMPLAINT_STATUSES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
} = require("../constants/complaintConstants");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must contain at least 5 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: [
        10,
        "Description must contain at least 10 characters",
      ],
      maxlength: [
        2000,
        "Description cannot exceed 2000 characters",
      ],
    },

    category: {
      type: String,
      required: [true, "Complaint category is required"],
      enum: COMPLAINT_CATEGORIES,
    },

    ward: {
      type: String,
      required: [true, "Ward is required"],
      trim: true,
    },

    location: {
      address: {
        type: String,
        required: [true, "Complaint address is required"],
        trim: true,
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    completionImages: {
      type: [imageSchema],
      default: [],
    },

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: "Pending",
      index: true,
    },

    priority: {
      type: String,
      enum: COMPLAINT_PRIORITIES,
      default: "Medium",
      index: true,
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    reopenedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model(
  "Complaint",
  complaintSchema
);

module.exports = Complaint;
