import { checkSchema } from "express-validator";

export const createUserValidator = checkSchema({
    firstName: {
        notEmpty: {
            errorMessage: "First name is required",
        },
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "First name must be between 2 and 50 characters",
        },
        trim: true,
    },
    lastName: {
        notEmpty: {
            errorMessage: "Last name is required",
        },
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "Last name must be between 2 and 50 characters",
        },
        trim: true,
    },
    email: {
        notEmpty: {
            errorMessage: "Email is required",
        },
        isEmail: {
            errorMessage: "Please provide a valid email",
        },
        normalizeEmail: true,
    },
    password: {
        notEmpty: {
            errorMessage: "Password is required",
        },
        isLength: {
            options: { min: 6 },
            errorMessage: "Password must be at least 6 characters long",
        },
    },
    role: {
        notEmpty: {
            errorMessage: "Role is required",
        },
        isIn: {
            options: [["customer", "manager", "admin"]],
            errorMessage: "Role must be one of: customer, manager, admin",
        },
    },
    tenantId: {
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: "Tenant ID must be a positive integer",
        },
    },
});
