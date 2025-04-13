import { Response } from "express";

import { PostRequest } from "./types";
import logger from "../../utils/logger";
import db from "../../models";
import { modelCrud } from "../../utils";

/**
 * @openapi
 * api/posts/{postId}:
 *   delete:
 *     summary: Delete a post (soft delete)
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
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post deleted
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
    [DELETE] api/posts/:id
    API for delete the post
 */
async function deletePost (req: PostRequest, res: Response): Promise<void> {
    const { id } = req.params;
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
        const post = await db.posts.findByPk(id);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (post.user_id !== userId) {
            res.status(403).json({ message: "Forbidden: You can only delete your own posts" });
            return;
        }

        // delete related comments
        await modelCrud.deleteData(
            db.comments,
            { post_id: id }
        );
        logger.system.info("deletePost", { userId, id }, "Deleted related comments successfully");

        await modelCrud.deleteData(
            db.posts,
            { id }
        );
        logger.system.info("deletePost", { userId, id }, "Process delete post successfully");
        res.status(200).json({ message: "Post and related comments deleted" });

    } catch (error) {
        logger.system.error("deletePost", { userId, id }, `Failed to delete post ${id} and related comments: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default deletePost;
