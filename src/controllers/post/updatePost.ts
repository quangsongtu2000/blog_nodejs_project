import { Response } from "express";

import { PostRequest, PostRequestBody } from "./types";
import logger from "../../utils/logger";
import db from "../../models";
import { modelCrud } from "../../utils";

/**
 * @openapi
 * api/posts/{postId}:
 *   patch:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
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
 *                 example: Updated Post
 *               content:
 *                 type: string
 *                 example: Hello Again
 *     responses:
 *       200:
 *         description: Post updated successfully
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
 *                   example: Updated Post
 *                 content:
 *                   type: string
 *                   example: Hello Again
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
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post not found
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
    [PUT] api/posts/:id
    API for edit the post
 */
async function updatePost(req: PostRequest<PostRequestBody>, res: Response): Promise<void> {
    const { id } = req.params;
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
        const post = await db.posts.findOne({
            where: { id, user_id: userId, is_deleted: 0 },
            logging: false,
        });
        if (!post || post.is_deleted) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (post.user_id !== userId) {
            res.status(403).json({ message: "Forbidden: You can only edit your own posts" });
            return;
        }

        await modelCrud.updateData(
            db.posts, 
            { 
                title, 
                content,
                updated_at: new Date()
            },
            { id: userId }
        );
        const postResponse = {
            id: post.id,
            title,
            content,
            user_id: post.user_id
        };
        logger.system.info("updatePost", { userId }, "Post updated by user successfully");
        res.status(200).json(postResponse);
    } catch (error) {
        logger.system.error("updatePost", { userId },`Failed to update post with error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default updatePost;
