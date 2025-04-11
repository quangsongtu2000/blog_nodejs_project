import { RequestHandler, Router } from "express";

import { 
    createPost, 
    updatePost, 
    deletePost, 
    getPost 
} from "../controllers/post";
import verifyAccessToken from "../middleware/verifyMiddleware";

const router = Router();

router.get("/", verifyAccessToken as RequestHandler, getPost as unknown as RequestHandler);
router.post("/", verifyAccessToken as RequestHandler, createPost as unknown as RequestHandler);
router.put("/:id", verifyAccessToken as RequestHandler, updatePost as unknown as RequestHandler);
router.delete("/:id", verifyAccessToken as RequestHandler, deletePost as unknown as RequestHandler);

export default router;