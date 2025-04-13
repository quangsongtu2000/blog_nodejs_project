import { Request, Response, NextFunction } from "express";
import { ParsedQs } from "qs";
import Joi from "joi";

import * as Validators from "./schemaValidators";
import { ParamsDictionary, RequestType, ValidatorFuncReturn, ValidatorSchemas } from "../types";
import { logger, utilities } from "../../utils";

const typedValidators: ValidatorSchemas = Validators;

/**
 * Method to determine if a given error is a Joi validation error
 * @param error error need to checking
 * @returns boolean
 */
function isJoiError(error: Joi.ValidationError): boolean {
    return error.isJoi === true;
}

/**
 * Method to validate parameters follow specific schema
 * @param validator Joi schema name
 * @returns asynchronous function for validating API request body or query
 */
const validator = (validator: string,
        type: RequestType = RequestType.BODY): ValidatorFuncReturn => {
    return async function(req: Request, res: Response, next: NextFunction): Promise<undefined> {
        if (!Object.prototype.hasOwnProperty.call(typedValidators, validator)) {
            logger.system.error(
                "Validator",
                { validator },
                "Validator does not exist"
            );
            res.status(500).json({
                error: {
                    message: "Validator does not exist"
                }
            });
            return;
        }
        try {
            if (type === RequestType.QUERY) {
                req.query = await typedValidators[validator].validateAsync(
                    req.query) as ParsedQs;
            }
            if (type === RequestType.PARAMS) {
                req.params = await typedValidators[validator].validateAsync(
                    req.params) as ParamsDictionary;
            }
            if (type === RequestType.BODY) {
                req.body = await typedValidators[validator].validateAsync(
                    req.body);
            }
            logger.system.debug(
                "Validator",
                {
                    schemaName: validator,
                    schema: utilities.isEmpty(req.query) ? Object.keys(req.body as object) :
                        Object.keys(req.query as object)
                },
                "Validated successfully"
            );
            next();
        } catch (err) {
            if (isJoiError(err as Joi.ValidationError)) {
                logger.system.error(
                    "Validator",
                    {
                        request: utilities.isEmpty(req.query) ? Object.keys(req.body as object) :
                            Object.keys(req.query as object),
                        error: (err as Joi.ValidationError).message
                    },
                    `Validation errors of ${validator}`
                );
                res.status(400).json({
                    error: {
                        message: (err as Joi.ValidationError).message
                    }
                });
                return;
            }
            res.status(500).json({
                error: {
                    message: "Internal server error"
                }
            });
        }
    };
};

export default validator;
