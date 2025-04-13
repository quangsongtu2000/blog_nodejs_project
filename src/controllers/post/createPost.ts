import { Response } from "express";

import db from "../../models";
import logger from "../../utils/logger";
import { PostRequest, PostRequestBody, PostResponse } from "./types";
import { modelCrud } from "../../utils";

/**
 * @openapi
 * api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: Test Post
 *               content:
 *                 type: string
 *                 example: Hello World
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: Test Post
 *                 content:
 *                   type: string
 *                   example: Hello World
 *                 user_id:
 *                   type: number
 *                   example: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       429:
 *         description: Too many write requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many write requests, please try again after 1 minute
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

/*
    [POST] api/posts/
    API for create a new post
 */
async function createPost (req: PostRequest<PostRequestBody>, res: Response): Promise<void> {
    const { title, content } = req.body;
    const email = req.userInfo.email;
    const userInfo = await db.users.findOne({ 
        attributes: [
            ["id", "userId"],
        ],
        where: { email, is_deleted: 0 },
        raw: true,
        logging: false 
    })
    if (!userInfo) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const userId = userInfo.userId
  
    try {
        const post = await modelCrud.insertData(
            db.posts, 
            {   
                title,
                content,
                user_id: userId,
                created_at: new Date()
            }
        );
        const postResponse: Omit<PostResponse, "updated_at" | "email"> = {
            id: post.id,
            title: post.title,
            content: post.content,
            user_id: post.user_id,
            created_at: post.created_at.toISOString()
        };
        logger.system.info("createPost", { userId, title }, "Post created by user successfully");
        res.status(201).json(postResponse);
    } catch (error) {
        logger.system.error("createPost", { userId },`Failed to create post: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default createPost;
