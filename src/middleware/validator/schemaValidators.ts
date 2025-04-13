import Joi from "joi";

/*
#############################################
#### Schema validators for Post APIs ####
#############################################
*/
const postRequestValidaton = Joi.object({
    title: Joi.string().trim().min(1).max(255).required().messages({
        "string.empty": "Title is required",
        "string.max": "Title must be less than 255 characters",
    }),
    content: Joi.string().trim().min(1).required().messages({
        "string.empty": "Content is required",
    }),
});

/*
#############################################
#### Schema validators for Auth APIs ####
#############################################
*/

const AuthRequestValidaton = Joi.object({
    email: Joi.string().trim().email().required().messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
    }),
    password: Joi.string().trim().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.empty": "Password is required",
    }),
});

/*
#############################################
#### Schema validators for Comment APIs ####
#############################################
*/
const commentRequestValidaton = Joi.object({
    content: Joi.string().trim().min(1).required().messages({
      "string.empty": "Comment content is required",
    }),
});

export {
    postRequestValidaton,
    commentRequestValidaton,
    AuthRequestValidaton
};
