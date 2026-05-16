import { io, Socket } from "socket.io-client";

export type SocketClientOptions = {
  url?: string;
  autoConnect?: boolean;
};

export function createSocketClient(options: SocketClientOptions = {}): Socket {
  return io(options.url ?? import.meta.env.VITE_API_URL ?? "http://localhost:4000", {
    autoConnect: options.autoConnect ?? false,
    transports: ["websocket"]
  });
}
