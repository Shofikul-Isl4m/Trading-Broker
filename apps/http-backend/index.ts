import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)


app.use("/api/v1", router)

app.listen(process.env.HTTP_PORT, () => {
    console.log('server start runing on ', process.env.HTTP_PORT)
})