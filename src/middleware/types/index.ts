import { Request } from "express";

type CommonUserInfo = {
    email: string
};

export interface CustomRequest extends Request {
    userInfo: CommonUserInfo; // User information
}