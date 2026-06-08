import { Server as IOServer, Socket } from "socket.io";

let io: IOServer | null = null;

export function initSocketServer(httpServer: any) {
  if (io) return io;

  io = new IOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // --- Channel 1: Dispatch Operations ---
    socket.on("join_dispatch_operations", (ambulanceId?: string) => {
      socket.join("dispatch_operations");
      if (ambulanceId) socket.join(`ambulance:${ambulanceId}`);
      console.log(`[SOCKET] Client joined dispatch_operations`);
    });

    socket.on("ambulance_location_update", (data: { ambulanceId: string; latitude: number; longitude: number }) => {
      io?.to("dispatch_operations").emit("ambulance_location_update", data);
    });

    socket.on("dispatch_accepted", (data: { requestId: string; ambulanceId: string }) => {
      io?.to(`request:${data.requestId}`).emit("dispatch_accepted", data);
      io?.to("dispatch_operations").emit("dispatch_accepted", data);
      console.log(`[SOCKET] Dispatch Accepted by Ambulance ${data.ambulanceId}`);
    });

    // --- Channel 2: Event Command Feed ---
    socket.on("join_event_command_feed", (eventId: string) => {
      socket.join(`event_command_feed:${eventId}`);
      console.log(`[SOCKET] Client joined event feed: ${eventId}`);
    });

    // --- Channel 3: System Alerts ---
    socket.on("join_system_alerts", () => {
      socket.join("system_alerts");
      console.log(`[SOCKET] Client joined system_alerts`);
    });

    // --- Channel: User Request Tracking ---
    socket.on("join_request_room", (requestId: string) => {
      socket.join(`request:${requestId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() { return io; }

// ==========================================
// Global Emitters
// ==========================================

export function emitSystemAlert(type: "HEALTH_CHANGE" | "OVERLOAD" | "MASS_ESCALATION", payload: any) {
  io?.to("system_alerts").emit("system_alert", { type, payload });
}

export function emitEventInstruction(eventId: string, instruction: string) {
  io?.to(`event_command_feed:${eventId}`).emit("event_instruction", instruction);
}

export function emitDispatchSent(ambulanceId: string, payload: any) {
  io?.to(`ambulance:${ambulanceId}`).emit("dispatch_assignment", payload);
}

export function emitEmergencyCreated(request: any) {
  io?.to("dispatch_operations").emit("emergency_created", request);
}
