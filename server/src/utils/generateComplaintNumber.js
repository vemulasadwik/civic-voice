const crypto = require("node:crypto");

function generateComplaintNumber() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const randomPart = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `CIV-${year}${month}${day}-${randomPart}`;
}

module.exports = generateComplaintNumber;