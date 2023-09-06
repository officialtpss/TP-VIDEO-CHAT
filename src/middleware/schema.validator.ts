import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';

const validator = (schemaObject: Joi.SchemaMap | undefined) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const payload = Object.assign({}, req.params || {}, req.query || {}, req.body || {});
        const { error } = Joi.object(schemaObject).validate(payload);
        if (error) {
            return res.status(400).send({ errors: errorHandler(error) });
        }
        next();
    };
};

const errorHandler = (error: Joi.ValidationError) => {
    const err = error.details?.map(err => err?.message?.replace(/"/g, ''));
    return err;
};

export default validator;
