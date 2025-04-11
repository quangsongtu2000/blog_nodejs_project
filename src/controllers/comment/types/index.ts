import { Request } from "express";
import { Query } from "express-serve-static-core";
import { CustomRequest } from "../../../middleware/types";

export interface CommentRequest<ReqBody = object,
    ReqQuery extends Query = {}> extends CustomRequest {
    body: ReqBody,
    query: ReqQuery
};

export interface CommentRequestBody {
    content: string;
};