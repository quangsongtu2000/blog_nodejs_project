import { Response } from "express";

import { PostRequest, PostRequestBody, PostResponse } from "./types";
import logger from "../../utils/logger";
import db from "../../models";
import { modelCrud } from "../../utils";
import moment from "moment";

/*
    [PUT] posts/:id
    API for edit the post
 */
async function updatePost (req: PostRequest<PostRequestBody>, res: Response): Promise<void> {
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
        const postResponse: PostResponse = {
            id: post.id,
            title,
            content,
            user_id: post.user_id,
        };
        logger.system.info("updatePost", { userId }, "Post updated by user successfully");
        res.status(200).json(postResponse);
    } catch (error) {
        logger.system.error("updatePost", { userId },`Failed to update post with error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default updatePost;