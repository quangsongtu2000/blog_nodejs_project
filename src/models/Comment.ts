import { Sequelize, Model, DataTypes } from "sequelize";

const commentModel = (sequelize: Sequelize, DataTypes: any): typeof Model => {
    class Comments extends Model {
        declare id: number;
        declare content: string;
        declare user_id: number;
        declare post_id: number;
        declare is_deleted: boolean;
        declare created_at: number;

        /**
         * Helper method for defining associations.
         */
        static associate(models: any) {
        Comments.belongsTo(models.users, {
            foreignKey: "user_id",
            as: "comment_owner",
        });
        Comments.belongsTo(models.posts, {
            foreignKey: "post_id",
            as: "comment_post",
        });
        }
    }

    Comments.init(
        {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        post_id: {
            type: DataTypes.INTEGER,
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
            modelName: "comments",
            tableName: "comments",
            timestamps: false
        }
    );

    return Comments;
};

export = commentModel;