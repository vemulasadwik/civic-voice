export function roleHome(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "officer") return "/officer/dashboard";
  return "/dashboard";
}
