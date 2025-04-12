import { Sequelize, Model, DataTypes } from "sequelize";

const commentModel = (sequelize: Sequelize, DataTypes: any): typeof Model => {
    class Comments extends Model {
        declare id: number;
        declare content: string;
        declare user_id: number;
        declare post_id: number;
        declare is_deleted: boolean;
        declare updated_at: Date | null;
        declare created_at: Date;

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
            updated_at: { 
                type: DataTypes.DATE, 
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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