import Joi from 'joi';

const userRegistrationSchema = {
    email: Joi.string().required(),
    image: Joi.string().optional(),
    socialId: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    gender: Joi.string().optional().valid('male', 'female'),
    loginType: Joi.string().required().valid('manual', 'social'),
    password: Joi.string()
        .when('loginType', { is: 'manual', then: Joi.required() })
        .when('loginType', { is: 'social', then: Joi.forbidden() }),
};

const loginSchema = {
    loginType: Joi.string().required().valid('manual', 'social'),
    socialId: Joi.string().optional(),
    password: Joi.string().when('loginType', { is: 'manual', then: Joi.required() })
        .when('loginType', { is: 'social', then: Joi.forbidden() }),
    email: Joi.string().when('loginType', { is: 'manual', then: Joi.required() })
        .when('loginType', { is: 'social', then: Joi.optional() }),
};

const viewSchemaGlobal = {
    id: Joi.number().required()
};

const courseCreateSchema = {
    name: Joi.string().required(),
    fees: Joi.number().required(),
    duration: Joi.number().required(),
    description: Joi.string().optional(),
};

const studentCreateSchema = {
    email: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    rollNumber: Joi.number().required(),
    fatherName: Joi.string().required(),
    motherName: Joi.string().required(),
    address: Joi.string().required(),
    qualification: Joi.string().required(),
    mobNumber: Joi.number().required(),
    dateOfBirth: Joi.string().optional(),
};

const studentContact = {
    email: Joi.string().required(),
    name: Joi.string().required(),
    mobNumber: Joi.number().required(),
    description: Joi.string().optional(),
};

const certificateCreateSchema = {
    StudentId: Joi.number().required(),
    CourseId: Joi.number().required(),
    grade: Joi.string().required(),
    joinDate: Joi.string().required(),
    year: Joi.number().required(),
    month: Joi.string().required(),
    fees: Joi.number().required(),
    type: Joi.string().optional().valid('self', 'system'),
};

export default {
    userRegistrationSchema,
    loginSchema,
    viewSchemaGlobal,
    courseCreateSchema,
    studentCreateSchema,
    studentContact,
    certificateCreateSchema,
};
