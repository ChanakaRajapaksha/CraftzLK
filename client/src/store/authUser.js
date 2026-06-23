export const emptyAuthUser = {
  name: "",
  email: "",
  userId: "",
  image: null,
  role: "user",
};

export function readStoredAuthUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.userId && !parsed?.email) return null;
    return {
      name: parsed.name || "",
      email: parsed.email || "",
      userId: parsed.userId || "",
      image: parsed.image ?? null,
      role: parsed.role || "user",
    };
  } catch {
    return null;
  }
}

export function mapApiUserToAuthUser(userData, fallback = {}) {
  if (!userData) return { ...emptyAuthUser, ...fallback };

  return {
    name: userData.fullName || userData.firstName || fallback.name || "",
    email: userData.email || fallback.email || "",
    userId: userData.id || userData._id || fallback.userId || "",
    image:
      userData.images?.[0] ||
      userData.image ||
      userData.picture ||
      fallback.image ||
      null,
    role: userData.role || fallback.role || "user",
  };
}

export function persistAuthUser(user) {
  if (!user?.userId && !user?.email) return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearPersistedAuthUser() {
  localStorage.removeItem("user");
}
