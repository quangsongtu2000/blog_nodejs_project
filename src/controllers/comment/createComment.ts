import { Response } from "express";

import { CommentRequest, CommentRequestBody, CommentResponse } from "./types";
import db from "../../models";
import logger from "../../utils/logger";
import { modelCrud } from "../../utils";

/**
 * @openapi
 * api/posts/{postId}/comments:
 *   post:
 *     summary: Create a comment for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great post!
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 content:
 *                   type: string
 *                   example: Great post!
 *                 user_id:
 *                   type: number
 *                   example: 1
 *                 post_id:
 *                   type: number
 *                   example: 1
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
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
    [POST] api/posts/:id/comments
    API for create comment
 */
async function createComment (req: CommentRequest<CommentRequestBody>, res: Response): Promise<void> {
    const { id: postId } = req.params;
    const { content } = req.body;
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
        const post = await db.posts.findByPk(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const comment = await modelCrud.insertData(
            db.comments,
            {
                content,
                user_id: userId,
                post_id: parseInt(postId),
                created_at: new Date()
            }
        )
        const commentResponse: CommentResponse = {
            id: comment.id,
            content: comment.content,
            user_id: comment.user_id,
            post_id: comment.post_id,
            created_at: comment.created_at.toISOString()
        };
        logger.system.info("createComment", { postId, userId }, `Comment added to post ${postId} by user ${userId}`);
        res.status(201).json(commentResponse);
    } catch (error) {
        logger.system.error(
            "createComment", 
            { postId, userId },
            `Failed to create comment for post ${postId}: ${(error as Error).message}`
        );
        res.status(500).json({ message: "Server error" });
    }
};

export default createComment;
