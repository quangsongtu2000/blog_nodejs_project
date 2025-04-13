import { RequestHandler, Router } from "express";

import { 
    createPost, 
    updatePost, 
    deletePost, 
    getPost,
    getOnePost 
} from "../controllers/post";
import { createComment } from "../controllers/comment";
import { verifyAccessToken } from "../middleware";
import validator from "../middleware/validator"

const router = Router();
// Get all posts
router.get("/", getPost as unknown as RequestHandler);
// Get one post
router.get("/:id", getOnePost as unknown as RequestHandler);
router.post("/", verifyAccessToken as RequestHandler, 
    validator("postRequestValidaton"),
    createPost as unknown as RequestHandler);
router.put("/:id", verifyAccessToken as RequestHandler, 
    validator("postRequestValidaton"),
    updatePost as unknown as RequestHandler);
router.delete("/:id", verifyAccessToken as RequestHandler, deletePost as unknown as RequestHandler);
// Define route for comment
router.post("/:id/comments", verifyAccessToken as RequestHandler, 
    validator("commentRequestValidaton"),
    createComment as unknown as RequestHandler);

export default router;
