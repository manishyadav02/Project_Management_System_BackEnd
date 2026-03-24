import {connectDB} from './config/db.js';
import app from './app.js';
import process from "process";
import dotenv from "dotenv";
dotenv.config();
//-----------
// DATABASE CONNECTION
//-----------
connectDB();

//-----------
// START SERVER
//-----------
const PORT = process.env.PORT || 4000;

const server=app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//-----------
// ERROR HANDLING
//-----------
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise Rejection');
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Uncaught Exception');
    server.close(() => {
        process.exit(1);
    });
});

export default server ;