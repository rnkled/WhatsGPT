import { app } from "./app";

const server = app;

server.listen( process.env.PORT || 8888, () => {
    console.log(`Server is running on ${process.env.PORT || 8888}`);
});