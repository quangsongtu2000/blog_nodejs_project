import { Sequelize, Model, DataTypes } from "sequelize";

const userModel = (sequelize: Sequelize, DataTypes: any): typeof Model => {
    class Users extends Model {
        declare id: number;
        declare email: string;
        declare password: string;
        declare is_deleted: boolean;
        declare created_at: number;

        /**
         * Helper method for defining associations.
         */
        static associate(models: any) {
        Users.hasMany(models.posts, {
            foreignKey: "user_id",
            as: "user_posts",
        });
        Users.hasMany(models.comments, {
            foreignKey: "user_id",
            as: "user_comments",
        });
        }
    }

    Users.init(
        {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: Math.floor(Date.now() / 1000), // Unix timestamp
        },
        },
        {
            sequelize,
            modelName: "users",
            tableName: "users",
            timestamps: false
        }
    );

    return Users;
};

export = userModel;