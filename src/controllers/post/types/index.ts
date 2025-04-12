import { Query } from "express-serve-static-core";

import { CustomRequest } from "../../../middleware/types";

interface PostRequest<ReqBody = object,
    ReqQuery extends Query = {}> extends CustomRequest {
    body: ReqBody,
    query: ReqQuery
};

type PostRequestBody = {
    title: string;
    content: string;
};

type PostResponse = {
    id: number;
    title: string;
    content: string;
    user_id: number;
};

type RawPost = {
    id: number;
    title: string;
    content: string;
    user_id: number;
    "post_owner.email": string;
}

export {
    PostRequest,
    PostRequestBody,
    PostResponse,
    RawPost
}