import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        trim: true,
        errorMessage: "Email is required!",
        notEmpty: true,
        isEmail: {
            errorMessage: "Email should be a valid email",
        },
    },

    password: {
        errorMessage: "Password is required",
        notEmpty: true,
        trim: true,
        isLength: {
            options: { min: 8 },
            errorMessage: "Password should be at least 8 chars",
        },
    },
});

// export default [body("email").notEmpty()];
