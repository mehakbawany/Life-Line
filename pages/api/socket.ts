import { NextApiRequest, NextApiResponse } from "next";
import { initSocketServer } from "@/socket/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Next.js API route to initialize the Socket.io server
 */
export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log("[SOCKET] Initializing Socket.io server...");
    initSocketServer(res.socket.server);
  } else {
    console.log("[SOCKET] Socket.io server is already running");
  }
  res.end();
}
