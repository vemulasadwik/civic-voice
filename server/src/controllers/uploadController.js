const cloudinary = require("../config/cloudinary");
const Complaint = require("../models/Complaint");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const hasCloudinaryConfig = () => [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].every(Boolean);

function uploadBuffer(file, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error) return reject(error); resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(file.buffer);
  });
}

async function saveLocally(file, folder, request) {
  const extensionByType = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  const relativeFolder = folder.split("/").filter(Boolean);
  const uploadDirectory = path.join(__dirname, "..", "..", "uploads", ...relativeFolder);
  await fs.mkdir(uploadDirectory, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomUUID()}${extensionByType[file.mimetype]}`;
  await fs.writeFile(path.join(uploadDirectory, filename), file.buffer);
  const publicPath = ["uploads", ...relativeFolder, filename].join("/");
  return {
    url: `${request.protocol}://${request.get("host")}/${publicPath}`,
    publicId: `local/${relativeFolder.join("/")}/${filename}`,
  };
}

async function uploadComplaintImages(request, response) {
  if (!request.files?.length) return response.status(400).json({ success: false, message: "Select at least one image" });
  const query = { _id: request.params.id };
  if (request.user.role === "citizen") query.citizen = request.user._id;
  if (request.user.role === "officer") query.assignedOfficer = request.user._id;
  const complaint = await Complaint.findOne(query);
  if (!complaint || request.user.role === "admin") return response.status(404).json({ success: false, message: "Complaint not found" });
  const folder = `civic-voice/${complaint.complaintNumber}/${request.user.role === "officer" ? "completion" : "evidence"}`;
  const images = await Promise.all(request.files.map((file) => (
    hasCloudinaryConfig() ? uploadBuffer(file, folder) : saveLocally(file, folder, request)
  )));
  if (request.user.role === "officer") complaint.completionImages.push(...images); else complaint.images.push(...images);
  await complaint.save();
  return response.status(201).json({ success: true, message: "Images uploaded", images, complaint });
}

async function removeStoredImage(image) {
  if (image.publicId.startsWith("local/")) {
    const uploadsRoot = path.resolve(__dirname, "..", "..", "uploads");
    const relativePath = image.publicId.slice("local/".length).split("/");
    const filePath = path.resolve(uploadsRoot, ...relativePath);
    if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error("Invalid local image path");
    await fs.unlink(filePath).catch((error) => { if (error.code !== "ENOENT") throw error; });
    return;
  }
  if (hasCloudinaryConfig()) await cloudinary.uploader.destroy(image.publicId);
}

async function deleteComplaintImage(request, response) {
  const query = { _id: request.params.id };
  if (request.user.role === "citizen") query.citizen = request.user._id;
  if (request.user.role === "officer") query.assignedOfficer = request.user._id;
  const complaint = await Complaint.findOne(query);
  if (!complaint) return response.status(404).json({ success: false, message: "Complaint not found" });

  const collection = request.user.role === "officer" ? "completionImages" : "images";
  if (request.user.role === "citizen" && !["Pending", "Rejected"].includes(complaint.status)) {
    return response.status(400).json({ success: false, message: "Evidence can only be deleted while a complaint is pending or rejected" });
  }
  if (request.user.role === "citizen" && complaint.images.length <= 1) {
    return response.status(400).json({ success: false, message: "A complaint must keep at least one evidence photo" });
  }
  if (request.user.role === "officer" && complaint.status !== "In Progress") {
    return response.status(400).json({ success: false, message: "Completion photos can only be deleted while work is in progress" });
  }

  const image = complaint[collection].find((item) => item.publicId === request.body.publicId);
  if (!image) return response.status(404).json({ success: false, message: "Image not found" });
  await removeStoredImage(image);
  complaint[collection] = complaint[collection].filter((item) => item.publicId !== request.body.publicId);
  await complaint.save();
  return response.json({ success: true, message: "Photo deleted successfully", complaint });
}

module.exports = { uploadComplaintImages, deleteComplaintImage };
