import { Query } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { CustomRequest } from "../../../middleware/types";

interface PostRequest<ReqBody = object, ReqQuery extends Query = {}> extends CustomRequest {
    body: ReqBody;
    query: ReqQuery;
}

interface PostRequestQuery {
    pageSize?: string;
    pageNum?: string;
    [key: string]: string | string[] | undefined | ParsedQs | ParsedQs[];
}

type PostRequestBody = {
    title: string;
    content: string;
};

type PostResponse = {
    id: number;
    title: string;
    content: string;
    user_id: number;
    email: string;
    created_at: string;
    updated_at: string;
};

type RawPost = {
    id: number;
    title: string;
    content: string;
    user_id: number;
    "post_owner.email": string;
    created_at: Date;
    updated_at: Date;
}

export {
    PostRequest,
    PostRequestBody,
    PostResponse,
    RawPost,
    PostRequestQuery
};
