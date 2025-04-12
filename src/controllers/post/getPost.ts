import { Response } from "express";

import db from "../../models";
import logger from "../../utils/logger";
import { PostRequest, PostResponse, RawPost } from "./types";

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: Test Post
 *                   content:
 *                     type: string
 *                     example: Hello World
 *                   user_id:
 *                     type: number
 *                     example: 1
 *                   email:
 *                     type: string
 *                     example: test@example.com
 *       429:
 *         description: Too many read requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many read requests from this IP, please try again after 15 minutes
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
    [GET] posts/
    API for get all the posts
 */
async function getPost (req: PostRequest, res: Response): Promise<void> {
    try {
        const posts = await db.posts.findAll({
            where: { is_deleted: false },
            attributes: ["id", "title", "content", "user_id"],
            include: [
              {
                model: db.users,
                as: "post_owner",
                attributes: ["email"],
                required: true,
              },
            ],
            raw: true,
            logging: false,
        });
          
        const postResponses: PostResponse[] = posts.map((post: RawPost) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            user_id: post.user_id,
            email: post["post_owner.email"],
        }));
        res.status(200).json(postResponses);
    } catch (error) {
        logger.system.error("getPost", {},`Failed to fetch posts: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default getPost;