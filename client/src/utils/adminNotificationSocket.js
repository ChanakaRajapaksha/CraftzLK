import { io } from "socket.io-client";
import { getAccessToken } from "./api";

const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin;

let socket = null;
let connectPromise = null;
const listeners = new Set();

function getSocketUrl() {
  return apiBaseUrl.replace(/\/$/, "");
}

function notifyListeners(payload) {
  listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch {
      /* ignore listener errors */
    }
  });
}

function attachSocketHandlers(activeSocket) {
  activeSocket.on("admin:notification:new", (payload) => {
    notifyListeners(payload);
  });

  activeSocket.on("connect_error", () => {
    /* allow reconnect attempts */
  });
}

export function subscribeAdminNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function connectAdminNotificationSocket() {
  const token = getAccessToken();
  if (!token) {
    disconnectAdminNotificationSocket();
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = new Promise((resolve) => {
    const nextSocket = io(getSocketUrl(), {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    attachSocketHandlers(nextSocket);

    nextSocket.on("connect", () => {
      socket = nextSocket;
      connectPromise = null;
      resolve(nextSocket);
    });

    nextSocket.on("connect_error", () => {
      connectPromise = null;
      resolve(null);
    });
  });

  return connectPromise;
}

export function disconnectAdminNotificationSocket() {
  connectPromise = null;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function refreshAdminNotificationSocketAuth() {
  disconnectAdminNotificationSocket();
  return connectAdminNotificationSocket();
}
