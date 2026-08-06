const User = require("../models/User");
const generateToken = require("../utils/generateToken");

async function register(request, response) {
  try {
    const { name, email, password, phone, ward } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (name.trim().length < 2) {
      return response.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters",
      });
    }

    if (password.length < 8) {
      return response.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return response.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone?.trim() || "",
      ward: ward?.trim() || "",
      role: "citizen",
    });

    const token = generateToken(user);

    return response.status(201).json({
      success: true,
      message: "Citizen registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        ward: user.ward,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return response.status(500).json({
      success: false,
      message: "Unable to register citizen",
    });
  }
}

module.exports = {
  register,
};