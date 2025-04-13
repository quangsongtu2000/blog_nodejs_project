import { Response } from "express";

import db from "../../models";
import logger from "../../utils/logger";
import { PostRequest, PostResponse } from "./types";

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 user_id:
 *                   type: number
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

/*
    [GET] api/posts/:id
    API for get one the post
 */
async function getOnePost(req: PostRequest, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const post = await db.posts.findOne({
            where: { id, is_deleted: 0 },
            attributes: ["id", "title", "content", "user_id", "created_at", "updated_at"],
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

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const postResponse: PostResponse = {
            id: post.id,
            title: post.title,
            content: post.content,
            user_id: post.user_id,
            email: post["post_owner.email"],
            created_at: post.created_at,
            updated_at: post.updated_at
        };
        logger.system.info("getOnePost", {}, "Get the post successfully");
        res.status(200).json(postResponse);
    } catch (error) {
        logger.system.error("getOnePost", { id }, `Failed to fetch post: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
}

export default getOnePost;
