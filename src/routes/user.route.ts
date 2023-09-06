import Joi from "joi";
import { Router } from "express";

import Jwt from '../middleware/jwt.validator';
import validator from '../middleware/schema.validator';
import UserObject from "../controllers/user.controller";

const path = "/api/user";
const UserRouter = Router({ mergeParams: true });

const commonSchema = {

    email: Joi.string().email().required(),
    registerType: Joi.string().required().valid('google', 'facebook', 'credentials', 'App-Register'),
    password: Joi.string()
        .when('registerType', { is: 'credentials', then: Joi.required() })
        .when('registerType', { is: 'google', then: Joi.forbidden() })
        .when('registerType', { is: 'facebook', then: Joi.forbidden() }),
};

const changePasswordSchema = {
    email: Joi.string().email().required(),
    // currentPassword: Joi.string().required(),
    // newPassword: Joi.string().required()
};

/**
 * Register User API
 */
// UserRouter.post(`${path}/register`, validator({
//     ...commonSchema,
//     name: Joi.string().required(), role: Joi.string().required().valid('user', 'admin'), fcmToken: Joi.string().allow('').optional()
// }), UserObject.create);

/**
 * Verify User Signature
 */
UserRouter.post(`${path}/verify/signature`, validator({
    publicKey: Joi.string().required(), payload: Joi.string().required(), signature: Joi.string().required()
}), UserObject.verifySignature);
/**
 * Change password
 */
UserRouter.put(`${path}/change-password`, Jwt.decode, validator(changePasswordSchema), UserObject.changePassword);

/**
 * Generate agora token
 */
UserRouter.post(`${path}/generate/token`, validator({ channelName: Joi.string().required(), userAccount: Joi.string().required() }), UserObject.generateToken);

UserRouter.get(`${path}/generate/basic/token`, UserObject.generateBasicAuthToken);

/******************** Authourized API's Start ********************************************** */

/**
 * Login User API
 */
UserRouter.post(`${path}/login`, validator(commonSchema), UserObject.login, Jwt.encode);

/**
 * Index Users API
 */
UserRouter.get(`${path}`, Jwt.decode, Jwt.isAdmin, UserObject.getAllUsers);

/**
 * List Users required for select box
 */
UserRouter.get(`${path}/list`, Jwt.decode, Jwt.isAdmin, UserObject.list);

/**
* Get details of logged-in user
*/
UserRouter.get(`${path}/profile`, Jwt.decode, UserObject.getLoggedInUser);

/**
 * Delete Users API
 */
UserRouter.delete(`${path}/:id/delete`, validator({ id: Joi.string().required() }), Jwt.decode, Jwt.isAdmin, UserObject.destroy);

export default UserRouter;
