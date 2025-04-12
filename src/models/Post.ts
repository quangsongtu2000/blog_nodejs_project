import { Sequelize, Model, DataTypes } from "sequelize";

const postModel = (sequelize: Sequelize, DataTypes: any): typeof Model => {
    class Posts extends Model {
        declare id: number;
        declare title: string;
        declare content: string;
        declare user_id: number;
        declare is_deleted: boolean;
        declare updated_at: Date | null;
        declare created_at: Date;

        /**
         * Helper method for defining associations.
         */
        static associate(models: any) {
            Posts.belongsTo(models.users, {
                foreignKey: "user_id",
                as: "post_owner",
            });
            Posts.hasMany(models.comments, {
                foreignKey: "post_id",
                as: "post_comments",
            });
        }
    }

    Posts.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            user_id: {
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
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
        },
        {
            sequelize,
            modelName: "posts",
            tableName: "posts",
            timestamps: false
        }
    );

    return Posts;
};

export = postModel;