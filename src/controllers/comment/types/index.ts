import { Request } from "express";
import { Query } from "express-serve-static-core";
import { CustomRequest } from "../../../middleware/types";

interface CommentRequest<ReqBody = object,
    ReqQuery extends Query = {}> extends CustomRequest {
    body: ReqBody,
    query: ReqQuery
};

type CommentRequestBody = {
    content: string;
};

type CommentResponse = {
    id: number;
    content: string;
    user_id: number;
    post_id: number;
    created_at: string;
};

export {
    CommentRequest,
    CommentRequestBody,
    CommentResponse
};
