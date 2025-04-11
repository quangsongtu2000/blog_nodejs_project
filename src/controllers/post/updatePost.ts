import { Response } from "express";

import { PostRequest, PostRequestBody } from "./types";
import logger from "../../utils/logger";
import db from "../../models";
import { modelCrud } from "../../utils";

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
        const post = await db.posts.findByPk(id);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (post.user_id !== userId) {
            res.status(403).json({ message: "Forbidden: You can only edit your own posts" });
            return;
        }

        await modelCrud.updateData(
            db.posts, 
            { title, content },
            { id: userId }
        );
        logger.system.info("updatePost", { userId }, "Post updated by user successfully");
        res.json({ message: "Post updated", post });
    } catch (error) {
        logger.system.error("updatePost", { userId },`Failed to update post with error: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default updatePost;