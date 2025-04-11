import { RequestHandler, Router } from "express";

import { createComment } from "../controllers/comment";
import verifyAccessToken from "../middleware/verifyMiddleware";

const router = Router();

router.post("/:id/comments", verifyAccessToken as RequestHandler, createComment as unknown as RequestHandler);

export default router;