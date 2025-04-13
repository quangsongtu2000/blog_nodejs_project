import { Response } from "express";

import db from "../../models";
import logger from "../../utils/logger";
import { PostRequest, PostRequestQuery, PostResponse, RawPost } from "./types";
import { 
    DEFAULT_PAGE_NUM,
    DEFAULT_PAGE_SIZE, 
    MAX_PAGE_SIZE, 
    PREVIEW_LENGTH 
} from "../../config/config";

/**
 * @openapi
 * /api/posts:
 *   get:
 *     summary: Get posts with pagination
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page (max 50)
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to retrieve
 *     responses:
 *       200:
 *         description: List of posts with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Test Post
 *                       preview:
 *                         type: string
 *                         example: First 1000 characters of the post...
 *                       user_id:
 *                         type: number
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: test@example.com
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     pageNum:
 *                       type: integer
 *                       example: 1
 *                     totalPosts:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pageSize must be between 1 and 50, and pageNum must be positive
 *       429:
 *         description: Too many read requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many read requests from this IP, please try again after 15 minutes
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
    [GET] posts/
    API for getting posts with pagination and preview (first 1000 characters of content)
*/
async function getPost(req: PostRequest<object, PostRequestQuery>, res: Response): Promise<void> {
    try {
        // Extract pageSize and pageNum from query parameters, with defaults
        const pageSize = parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE;
        const pageNum = parseInt(req.query.pageNum as string) || DEFAULT_PAGE_NUM;
        const maxPageSize = MAX_PAGE_SIZE;
        const offset = (pageNum - 1) * pageSize;

        // Validate pageSize and pageNum
        if (pageSize <= 0 || pageNum <= 0 || pageSize > maxPageSize) {
            logger.system.warn("getPost", { pageSize, pageNum }, "Invalid pagination parameters");
            res.status(400).json({ message: "pageSize must be between 1 and 50, and pageNum must be positive" });
            return;
        }

        // Fetch posts with pagination
        const { count, rows } = await db.posts.findAndCountAll({
            where: { is_deleted: false },
            attributes: ["id", "title", "content", "user_id", "created_at", "updated_at"],
            include: [
                {
                    model: db.users,
                    as: "post_owner",
                    attributes: ["email"],
                    required: true,
                },
            ],
            limit: pageSize,
            offset: offset,
            order: [["created_at", "DESC"]], // Sort by creation date, newest first
            raw: true,
            logging: false,
        });

        // Map posts to include content (first 1000 characters of content)
        const postResponses: PostResponse[] = rows.map((post: RawPost) => ({
            id: post.id,
            title: post.title,
            content: post.content.substring(0, PREVIEW_LENGTH),
            user_id: post.user_id,
            email: post["post_owner.email"],
            created_at: post.created_at,
            updated_at: post.updated_at,
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / pageSize);

        logger.system.info(
            "getPost",
            { pageSize, pageNum, totalPosts: count },
            "Fetched posts successfully"
        );

        res.status(200).json({
            posts: postResponses,
            pagination: {
                pageSize,
                pageNum,
                totalPosts: count,
                totalPages,
            },
        });
    } catch (error) {
        logger.system.error(
            "getPost",
            {},
            `Failed to fetch posts: ${(error as Error).message}`
        );
        res.status(500).json({ message: "Server error" });
    }
}

export default getPost;