import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import errorhandler from "errorhandler";
import db from "./models";
import logger from "./utils/logger";
import { BODY_SIZE_LIMIT, CORS_OPTIONS, SERVER_PORT } from "./config/config";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";

function app() {
    const app: Express = express();

    // Middlewares for API app
    app.use(cors(CORS_OPTIONS));
    app.use(helmet());
    app.use(errorhandler());

    //IMPORTANT: for parsing application/json from request
    app.use(express.json({ limit: BODY_SIZE_LIMIT }));

    app.use("/auth", authRoutes);
    app.use("/post", postRoutes);
    app.use("/post", commentRoutes);

    app.listen(SERVER_PORT, (): void => {
        logger.system.info(
            "app", {}, `App listening on port ${SERVER_PORT}`
        );
    });
}

function startServer() {
    db.sequelize.sync({ logging: false })
        .then(() => {
            app();
        });
}

startServer();