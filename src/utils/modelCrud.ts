import db from "../models";
import logger from "./logger";

import {
    BindOrReplacements,
    Optional,
    FindAttributeOptions,
    QueryTypes,
    WhereOptions,
    FindOptions,
    Op
} from "sequelize";

async function insertData(model: any, data: object, options: object = {}) {
    try {
        const result = await model.create(data, {
            logging: false,
            ...options
        });
        logger.system.debug(
            "insertData",
            {
                result: result
            },
            "Result of insert data"
        );
        return result;
    } catch (error) {
        logger.system.error(
            "insertData",
            { "data": data, },
            `Error inserting data ${(error as Error).message}`
        );
        return null;
    }
}

async function updateData(model: any, data: object, condition: object,
        options: object = {}) {
    try {
        const result = await model.update(data, {
            where: condition,
            logging: false,
            ...options
        });
        logger.system.debug(
            "updateData",
            {
                result: result
            },
            "Result of update data"
        );
        return result;
    } catch (error) {
        logger.system.error(
            "updateData",
            {
                "data": data,
                "condition": condition
            },
            "Error updating data"
        );
        return null;
    }
}

async function deleteData(model: any, condition: object, options: object = {}) {
    try {
        const result = await model.destroy({
            where: condition,
            logging: false,
            ...options
        });
        logger.system.debug(
            "deleteData",
            { result, condition },
            "Result of delete data"
        );
        return result;
    } catch (error) {
        logger.system.error(
            "deleteData",
            {
                condition: condition,
                error: (error as Error).message
            },
            "Error delete data"
        );
        return null;
    }
}

/**
 * Method to find data using a raw SQL query
 * @param sql raw SQL query
 * @param replacements values to replace placeholders in the query
 * @param options Options for selection, e.g., transaction, etc.
 * @returns data of generic type T, or null if an error occurs
 */
async function findDataBySQL<T>(sql: string, findType: "findOne",
    replacements?: BindOrReplacements, options?: object): Promise<T | null>;
async function findDataBySQL<T>(sql: string, findType: "findAll",
    replacements?: BindOrReplacements, options?: object): Promise<T[] | null>;
async function findDataBySQL<T>(sql: string, findType: "findOne" | "findAll",
    replacements?: BindOrReplacements, options: object = {}): Promise<T | T[] | null> {
    try {
        const result = await db.sequelize.query(sql, {
            replacements,
            type: QueryTypes.SELECT,
            raw: true,
            ...options
        }) as T[];

        logger.system.debug("findDataBySQL", { result, replacements },
            "Found data by SQL query successfully");

        if (findType === "findAll") {
            return result;
        }
        return Array.isArray(result) && result.length === 1 ? (result)[0] : null;
    } catch (error) {
        logger.system.error("findDataBySQL", { error: (error as Error).message, replacements },
            "Failed to find data by SQL query");
        return null;
    }
}

export default {
    insertData,
    updateData,
    deleteData,
    findDataBySQL
}