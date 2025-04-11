import { Response } from "express";

import db from "../../models";
import logger from "../../utils/logger";
import { PostRequest } from "./types";

async function getPost (req: PostRequest, res: Response): Promise<void> {
    try {
        const posts = await db.posts.findAll({
            include: [
                { 
                    model: db.users, 
                    as: "post_owner", 
                    attributes: ["id", "email"] 
                }
            ],
            raw: true,
            logging: false
        });
        res.status(200).json(posts);
    } catch (error) {
        logger.system.error("getPost", {},`Failed to fetch posts: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default getPost;