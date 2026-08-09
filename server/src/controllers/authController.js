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

async function login(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return response.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    const passwordIsCorrect =
      await user.comparePassword(password);

    if (!passwordIsCorrect) {
      return response.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return response.status(200).json({
      success: true,
      message: "Login successful",
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
    console.error("Login error:", error);

    return response.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
}
async function getCurrentUser(request, response) {
  return response.status(200).json({
    success: true,
    user: {
      id: request.user._id,
      name: request.user.name,
      email: request.user.email,
      phone: request.user.phone,
      ward: request.user.ward,
      role: request.user.role,
      isActive: request.user.isActive,
      createdAt: request.user.createdAt,
    },
  });
}
async function updateProfile(request, response) {
  const allowed = ["name", "phone", "ward"];
  for (const field of allowed) if (request.body[field] !== undefined) request.user[field] = String(request.body[field]).trim();
  await request.user.save();
  return response.json({ success: true, message: "Profile updated", user: { id: request.user._id, name: request.user.name, email: request.user.email, phone: request.user.phone, ward: request.user.ward, role: request.user.role, isActive: request.user.isActive } });
}

async function changePassword(request, response) {
  const { currentPassword, newPassword } = request.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) return response.status(400).json({ success: false, message: "Current password and a new password of at least 8 characters are required" });
  const user = await User.findById(request.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) return response.status(400).json({ success: false, message: "Current password is incorrect" });
  user.password = newPassword; await user.save();
  return response.json({ success: true, message: "Password changed successfully" });
}
module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
};
