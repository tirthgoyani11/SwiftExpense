"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = void 0;
const setupSocketIO = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        // Join company room
        socket.on('join_company', (companyId) => {
            socket.join(`company_${companyId}`);
            console.log(`User ${socket.id} joined company ${companyId}`);
        });
        // Join user room
        socket.on('join_user', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${socket.id} joined user room ${userId}`);
        });
        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.setupSocketIO = setupSocketIO;
