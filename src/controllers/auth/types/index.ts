import { Request } from "express";
import { Query } from "express-serve-static-core";

export interface AuthRequest<ReqBody = object,
    ReqQuery extends Query = {}> extends Request {
    body: ReqBody,
    query: ReqQuery
};

export interface AuthRequestBody {
    email: string;
    password: string;
};

export interface RefreshRequestBody {
    refreshToken: string;
}
