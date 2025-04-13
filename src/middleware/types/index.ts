import { NextFunction, Request, Response } from "express";
import Joi from "joi";

type CommonUserInfo = {
    email: string
};

interface CustomRequest extends Request {
    userInfo: CommonUserInfo; // User information
};

type ValidatorSchemas = {
    [key: string]: Joi.ObjectSchema;
};

type ValidatorFuncReturn = (req: Request, res: Response, next: NextFunction) => Promise<undefined>;

const enum RequestType {
    "PARAMS",
    "QUERY",
    "BODY"
};

interface ParamsDictionary {
    [key: string]: string;
};

export {
    CustomRequest,
    ValidatorSchemas,
    RequestType,
    ValidatorFuncReturn,
    ParamsDictionary
};
