import logger from "./logger";

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

export default {
    insertData,
    updateData,
    deleteData
};
