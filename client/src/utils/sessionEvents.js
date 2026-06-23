let sessionExpiredHandler = null;

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired() {
  sessionExpiredHandler?.();
}
