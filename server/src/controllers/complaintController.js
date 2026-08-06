const mongoose = require("mongoose");

const Complaint = require("../models/Complaint");
const generateComplaintNumber = require(
  "../utils/generateComplaintNumber"
);
const {
  COMPLAINT_CATEGORIES,
} = require("../constants/complaintConstants");

async function createComplaint(request, response) {
  try {
    const {
      title,
      description,
      category,
      ward,
      location,
    } = request.body;

    if (
      !title ||
      !description ||
      !category ||
      !ward ||
      !location?.address
    ) {
      return response.status(400).json({
        success: false,
        message:
          "Title, description, category, ward and address are required",
      });
    }

    if (title.trim().length < 5) {
      return response.status(400).json({
        success: false,
        message: "Title must contain at least 5 characters",
      });
    }

    if (description.trim().length < 10) {
      return response.status(400).json({
        success: false,
        message:
          "Description must contain at least 10 characters",
      });
    }

    if (!COMPLAINT_CATEGORIES.includes(category)) {
      return response.status(400).json({
        success: false,
        message: "Invalid complaint category",
      });
    }

    const complaintNumber = generateComplaintNumber();

    const complaint = await Complaint.create({
      complaintNumber,
      title: title.trim(),
      description: description.trim(),
      category,
      ward: ward.trim(),
      location: {
        address: location.address.trim(),
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
      },
      citizen: request.user._id,
      status: "Pending",
      priority: "Medium",
      statusHistory: [
        {
          status: "Pending",
          note: "Complaint submitted by citizen",
          updatedBy: request.user._id,
        },
      ],
    });

    return response.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to submit complaint",
    });
  }
}

async function getMyComplaints(request, response) {
  try {
    const complaints = await Complaint.find({
      citizen: request.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("assignedOfficer", "name email phone");

    return response.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to retrieve complaints",
    });
  }
}

async function getMyComplaintById(request, response) {
  try {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const complaint = await Complaint.findOne({
      _id: id,
      citizen: request.user._id,
    })
      .populate("assignedOfficer", "name email phone")
      .populate(
        "statusHistory.updatedBy",
        "name role"
      );

    if (!complaint) {
      return response.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return response.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Get complaint error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to retrieve complaint",
    });
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
};