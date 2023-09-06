import btoa from 'btoa';
import atob from 'atob';
import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';

import { JWT_SECRET } from './../constant';
import httpStatus from '../helpers/httpStatus.helper';

/**
 * @encode- Here Generate Jwt Token
 */
const encode = (req: any, res: any) => {

    try {

        res.user.id = btoa(btoa(btoa(res.user.id)));
        res.user.email = btoa(btoa(btoa(res.user.email)));

        const expiresIn = (res.user.role == 'admin') ? '8760h' : '24h';
        const token = jwt.sign({ user: res.user.email, id: res.user.id, role: res.user.role }, JWT_SECRET, { expiresIn });
        
        return res.status(200).send({ status: 'Ok', token, data: res.user });

    } catch (error) {

        return httpStatus.sendError400(error, res);
    }
};

/**
 * @decode- Here Jwt Token Decode
 */
const decode = (req: any, res: any, next: any) => {
    try {

        if (req.headers.authorization === void 0) {
            
            return httpStatus.sendError401({ message: 'Authorization header missing!' }, res);

        } else {

            const accessToken = req.headers.authorization.split(' ');
            if (accessToken[0] !== 'Bearer') {
                return httpStatus.sendError401({ message: 'Unauthorized' }, res);
            }

            jwt.verify(accessToken[1], JWT_SECRET, (err: any, decoded: any) => {
    
                if (err) {
                    return httpStatus.sendError401({ message: 'Unauthorized' }, res);
                } else {

                    res.userEmail = atob(atob(atob(decoded.user)));
                    res.userId = atob(atob(atob(decoded.id)));
                    res.role = decoded.role;

                    res.limit = req.query.limit || 10;
                    
                    next();
                }
            });
        }
        
    } catch (error) {
        return httpStatus.sendError400(error, res);
    }
};

const isAdmin = (req: any, res: Response | any, next: NextFunction) => {

    if (res.role === 'admin') {
        next();
    } else {
        return httpStatus.sendError401({ message: 'USER_UNAUTHORISED' }, res);
    }
};

export default {
    encode,
    decode,
    isAdmin
};
