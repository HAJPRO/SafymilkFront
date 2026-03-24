// import { io } from "socket.io-client";

// // .env faylidan server manzilini olamiz
// const SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// class SocketService {
//   constructor() {
//     this.socket = null;
//   }

//   connect() {
//     if (!this.socket) {
//       this.socket = io(SERVER_URL, {
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 2000,
//       });

//       this.socket.on("connect", () => {
//         console.log("✅ Socket ulandi: ", this.socket.id);
//       });
//     }
//     return this.socket;
//   }

//   // Xonaga qo'shilish funksiyasi
//   joinRoom(storeId) {
//     if (this.socket) {
//       this.socket.emit("AGENT:JOIN", storeId);
//     }
//   }

//   // Signallarni eshitish (Listen)
//   on(event, callback) {
//     if (this.socket) this.socket.on(event, callback);
//   }

//   // Signal yuborish (Emit)
//   emit(event, data) {
//     if (this.socket) this.socket.emit(event, data);
//   }
// }

// export default new SocketService();