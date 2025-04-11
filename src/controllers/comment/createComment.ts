import { Response } from "express";

import { CommentRequest, CommentRequestBody } from "./types";
import db from "../../models";
import logger from "../../utils/logger";
import { modelCrud } from "../../utils";

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
            }
        )
        logger.system.info("createComment", { postId, userId }, `Comment added to post ${postId} by user ${userId}`);
        res.status(201).json(comment);
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