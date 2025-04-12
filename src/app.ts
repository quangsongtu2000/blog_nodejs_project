import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import errorhandler from "errorhandler";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import db from "./models";
import logger from "./utils/logger";
import { 
    BODY_SIZE_LIMIT, 
    CORS_OPTIONS, 
    LIMIT, 
    SERVER_PORT 
} from "./config/config";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import swaggerSpec from "./config/swagger";

function app() {
    const app: Express = express();
    const limiter = rateLimit({
        windowMs: LIMIT.WINDOWMS,
        max: LIMIT.MAX,
        message: LIMIT.MESSAGE,
    });

    // Middlewares for API app
    app.use(cors(CORS_OPTIONS));
    app.use(helmet());
    app.use(errorhandler());

    //IMPORTANT: for parsing application/json from request
    app.use(express.json({ limit: BODY_SIZE_LIMIT }));
    // Apply rate limiting for all routes
    app.use(limiter);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.use("/auth", authRoutes);
    app.use("/posts", postRoutes);

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