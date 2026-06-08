import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket() {
  if (socket && socket.connected) return socket;

  socket = io({
    path: "/api/socket",
    addTrailingSlash: false,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[SOCKET CLIENT] Connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("[SOCKET CLIENT] Disconnected");
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) return connectSocket();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
