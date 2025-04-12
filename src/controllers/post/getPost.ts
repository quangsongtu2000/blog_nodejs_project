import { Response } from "express";

import db from "../../models";
import logger from "../../utils/logger";
import { PostRequest, PostResponse, RawPost } from "./types";

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