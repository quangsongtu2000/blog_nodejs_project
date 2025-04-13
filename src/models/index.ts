import fs from "fs";
import path from "path";
import {
    Sequelize,
    ConnectionError,
    ConnectionTimedOutError,
    TimeoutError,
    DataTypes
} from "sequelize";
import { DATABASE_CONFIG } from "../config/config";

const basename = path.basename(__filename);
const db: any = {};
const sequelize: Sequelize = new Sequelize(
    DATABASE_CONFIG.NAME as string,
    DATABASE_CONFIG.USERNAME as string,
    DATABASE_CONFIG.PASSWORD as string,
    {
        host: DATABASE_CONFIG.HOST as string,
        dialect: DATABASE_CONFIG.DBMS,
        logging: false,
        retry: {
        match: [
            ConnectionError,
            ConnectionTimedOutError,
            TimeoutError,
            /Deadlock/i
        ],
        max: DATABASE_CONFIG.RETRY.MAX_RETRY_TIMES,
        backoffBase: DATABASE_CONFIG.RETRY.BACKOFF_BASE,
        backoffExponent: DATABASE_CONFIG.RETRY.BACKOFF_EXPONENT
        }
    }
);

// Load all model
fs.readdirSync(__dirname)
    .filter(file => {
        return (
        file.indexOf(".") !== 0 &&
        file !== basename &&
        (file.slice(-3) === ".ts" || file.slice(-3) === ".js") &&
        file.indexOf(".test.ts") === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.sequelize.options.logging = false;

// Implement sync database
// sequelize.sync({ alter: true }).then(() => {
//     console.log("Database synced with alter");
// }).catch((err) => {
//     console.error("Database sync failed:", err);
// });

export default db;
