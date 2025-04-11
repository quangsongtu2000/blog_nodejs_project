import { Request } from "express";
import { Query } from "express-serve-static-core";
import { CustomRequest } from "../../../middleware/types";

export interface PostRequest<ReqBody = object,
    ReqQuery extends Query = {}> extends CustomRequest {
    body: ReqBody,
    query: ReqQuery
};

export interface PostRequestBody {
    title: string;
    content: string;
};