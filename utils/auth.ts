export const getUserRole = (): string | null => {
  if (typeof window === "undefined") return null; // Prevent errors in SSR

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(base64));

    return decodedPayload.role || null; // Assuming JWT contains a `role` field
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};
