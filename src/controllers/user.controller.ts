
import bcrypt from "bcrypt";
import NodeRSA from "node-rsa";

import { db, auth } from '../../database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const { RtcTokenBuilder, RtcRole } = require('agora-token');

import httpStatus from '../helpers/httpStatus.helper';
import { AGORA_APP_ID, AGORA_CERTIFICATE } from "../constant";

import NotificationController from "./notification.controller";
import AppointmentController from "./appointment.controller";

class UserController {

    static getAllUsers = async (req: any, res: any) => {
        try {
            const { keywords = '', currentPage: pageNumber = 1, limit: pageSize = 10 } = req.query;

            const loggedInUserId = res.userId;

            let query = db.collection('users');

            const lowercaseKeywords = keywords.toLowerCase();

            query = query.orderBy('createdAt', 'desc');

            const totalCountSnapshot = await query.get();

            const filteredByName = totalCountSnapshot.docs.filter((doc: any) => {
                const userData = doc.data();
                if (userData.id === loggedInUserId) {
                    return false;
                }
                if (userData.name.toLowerCase().includes(lowercaseKeywords) || userData.email.toLowerCase().includes(lowercaseKeywords)) {
                    return true;
                }
                return false;
            });

            const searchCount = filteredByName.length
            const refCollection = filteredByName.map((doc: any) => doc.data());
            const startIndex = (pageNumber - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const payload = refCollection.slice(startIndex, endIndex);
            const count = refCollection.length

            if (filteredByName) {
                const data = {
                    data: {
                        payload: payload,
                        totalCount: searchCount,
                    },
                    status: 'Ok',
                };

                return httpStatus.sendResp200(data, res);
            } else {
                const data = {
                    data: {
                        payload: payload,
                        totalCount: count,
                    },
                    status: 'Ok',
                };

                return httpStatus.sendResp200(data, res);
            }


        } catch (error: any) {
            return httpStatus.sendError400(error, res);
        }
    };

    /**
     * Register a new user
     */
    static list = async (req: any, res: any) => {

        try {

            const data = await db.collection('users').where('role', '!=', 'admin').get().then((querySnapshot) => {

                return querySnapshot.docs.map((doc) => {

                    const { email, name } = doc.data();

                    return {
                        value: doc.id,
                        label: `${name} - ${email}`,
                    }
                });
            });

            return httpStatus.sendResp200({ status: 'Ok', data }, res);

        } catch (error: any) {

            return httpStatus.sendError400(error, res);
        }
    };

    /**
     * Register a new user
     */
    static create = async (req: any, res: any) => {

        try {

            const { email, registerType } = req.body;

            // Check if the user already exists
            const userExists = await db.collection('users').where('email', '==', email.toLowerCase()).get();

            if (!userExists.empty) {
                return httpStatus.sendError400(
                    { message: 'User already exists with the provided email' },
                    res
                );
            }

            return createUserWithEmailAndPassword(auth, email.toLowerCase(), req.body.password).then(async (userCredential) => {

                // Signed in 
                const { uid } = userCredential.user;

                const input = {
                    ...req.body,
                    userId: uid,
                    email: email.toLowerCase(),
                    createdAt: new Date().toISOString(),
                    ...((registerType === 'credentials') && { password: bcrypt.hashSync(req.body.password, 10) })
                };

                await db.collection('users').doc(uid).set(input);

                return httpStatus.sendResp200({ message: 'Ok' }, res);

            }).catch((error) => {

                const errorCode = error.message;
                return httpStatus.sendError400({ status: 'Error', message: errorCode }, res);
            });


        } catch (error: any) {

            return httpStatus.sendError400(error, res);
        }
    };

    /**
     * Login a user
     */
    static login = async (req: any, res: any, next: any) => {

        try {

            const { email, password } = req.body

            /**
             * Login By Firebase Auth
             */
            return signInWithEmailAndPassword(auth, email, password).then(async () => {

                const user: any = await db.collection('users').where('email', '==', email.toLowerCase()).get();
                if (user.empty) {

                    const errObject = { 
                        message: 'Your account does not exist. Please Signup' 
                    };
    
                    return httpStatus.sendError400(errObject, res);
    
                } else {
    
                    const authUser = { id: user.docs[0].id, ...user.docs[0].data() };
                    if (authUser.role !== 'admin') {
                        return httpStatus.sendError401({ message: 'Unauthorized Access!' }, res);
                    } else {
                        delete authUser.password;
                        res.user = authUser;
                        next();
                    }
                }

            }).catch((error) => {
                return httpStatus.sendError400({ status: 'Error', message: 'Incorrect password/email, please try again.' }, res);
            });

        } catch (error: any) {

            return httpStatus.sendError400(error, res);
        }
    };

    /**
     * Delete user
     */
    static destroy = async (req: any, res: any) => {

        try {

            const { id } = req.params;

            /**
             * Delete Appointment & User
             */
            return db.collection('users').doc(id).delete()
                .then(() => {
                    return db.collection('appointments').where('userId', '==', id).get()
                        .then((querySnapshot) => querySnapshot.docs.map((doc) => doc.ref.delete()))
                })
                .then(() => httpStatus.sendResp200({ status: 'Ok' }, res))
                .catch((error) => httpStatus.sendError400(error, res));

        } catch (error: any) {

            return httpStatus.sendError400(error, res);
        }
    };

    /**
   * Get details of a logged-in user
   */
    static getLoggedInUser = async (req: any, res: any) => {
        try {
            // Access the logged-in user's details from the request object
            const loggedInUser = res.userId;
            const userSnapshot = await db.collection('users').doc(loggedInUser).get();
            const userData = userSnapshot.data();

            return httpStatus.sendResp200({ status: 'Ok', data: userData }, res);
        } catch (error: any) {
            return httpStatus.sendError400(error, res);
        }
    };

    /**
     * Verify signature of user
     */
    static verifySignature = (req: any, res: any) => {

        try {

            const { publicKey, payload, signature } = req.body;

            const key = new NodeRSA();
            const signer = key.importKey(Buffer.from(publicKey, 'base64'), 'public-der')
            const signatureVerified = signer.verify(Buffer.from(payload), signature, 'utf8', 'base64')

            return httpStatus.sendResp200({ status: 'Ok', data: signatureVerified }, res);

        } catch (error) {

            return httpStatus.sendError400(error, res);
        }
    };

    static generateToken = async (req: any, res: any) => {

        try {

            const { channelName, userAccount } = req.body;

            const role = RtcRole.PUBLISHER;

            const expirationTimeInSeconds = 3600;
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

            // Build token with uid
            const token = RtcTokenBuilder.buildTokenWithUid(AGORA_APP_ID, AGORA_CERTIFICATE, channelName, 0, role, privilegeExpiredTs);

            /**
             * Send Notification to User to inform that call is initiated
            */
            const notificationObj = new NotificationController();
            notificationObj.sendNotificationToUser(userAccount,
                'Call Initiated', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry', token, channelName);

            /**
             * Create Call History
             */
            const appointmentObj = new AppointmentController();
            appointmentObj.addCallHistory(channelName, 'CALL_INITIATED', token);

            return httpStatus.sendResp200({ status: 'Ok', data: token, channelId: channelName }, res);

        } catch (error: any) {

            return httpStatus.sendError400(error, res);
        }
    };

    /**
     * Generate Basic Authentication for Agora Apis
     */
    static generateBasicAuthToken = (req: any, res: any) => {

        try {

            // Customer ID
            const customerKey = "9931ced998504bbe97cc0b6c4020c4a8";
            // Customer secret
            const customerSecret = "f56b4f125cef42cd91059c4f8bbdd14c";

            // Concatenate customer key and customer secret and use base64 to encode the concatenated string
            const plainCredential = customerKey + ":" + customerSecret;

            // Encode with base64
            const encodedCredential = Buffer.from(plainCredential).toString('base64');

            // Basic OTkzMWNlZDk5ODUwNGJiZTk3Y2MwYjZjNDAyMGM0YTg6ZjU2YjRmMTI1Y2VmNDJjZDkxMDU5YzRmOGJiZGQxNGM=
            const authorizationField = "Basic " + encodedCredential;

            return httpStatus.sendResp200({ status: 'Ok', authorizationField }, res);

        } catch (error: any) {

            return httpStatus.sendError400(error, res);
        }
    }

    /**
     * Change user's password
     */
    static changePassword = async (req: any, res: any) => {

        try {

            const { email } = req.body;

            /**
             * Update Password in auth as well
             */
            return sendPasswordResetEmail(auth, email).then(() => {
                return httpStatus.sendResp200({ status: 'Ok', data: { message: 'Kindly check your email to change the password' } }, res);
            }).catch((err) => {
                return httpStatus.sendError400({ status: 'Err', data: { message: err.message } }, res);
            });

        } catch (error: any) {
            return httpStatus.sendError400(error, res);
        }
    }

};

export default UserController;