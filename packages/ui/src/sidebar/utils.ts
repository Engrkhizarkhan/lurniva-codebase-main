export function getInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "?";
}
