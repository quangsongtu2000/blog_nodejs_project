import { Response } from "express";

import db from "../../models";
import logger from "../../utils/logger";
import { PostRequest, PostRequestBody, PostResponse } from "./types";
import { modelCrud } from "../../utils";

/*
    [POST] posts/
    API for create a new post
 */
async function createPost (req: PostRequest<PostRequestBody>, res: Response): Promise<void> {
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
        const post = await modelCrud.insertData(
            db.posts, 
            {   
                title,
                content,
                user_id: userId
            }
        );
        const postResponse: PostResponse = {
            id: post.id,
            title: post.title,
            content: post.content,
            user_id: post.user_id,
        };
        logger.system.info("createPost", { userId, title }, "Post created by user successfully");
        res.status(201).json(postResponse);
    } catch (error) {
        logger.system.error("createPost", { userId },`Failed to create post: ${(error as Error).message}`);
        res.status(500).json({ message: "Server error" });
    }
};

export default createPost;