import { Response } from "express";

import { PostRequest } from "./types";
import logger from "../../utils/logger";
import db from "../../models";
import { modelCrud } from "../../utils";

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