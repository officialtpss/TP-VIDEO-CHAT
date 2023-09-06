import express from 'express';
import path from 'path';
const router = express.Router();

import { SERVER_URL, SWAGGER_APP_NAME, SWAGGER_VERSION, SWAGGER_DESC, SWAGGER_CONTACT_MAIL } from '../constant';

const options = {
    swaggerDefinition: {
        info: {
            title: SWAGGER_APP_NAME,
            version: SWAGGER_VERSION,
            description: SWAGGER_DESC,
            contact: {
                email: SWAGGER_CONTACT_MAIL,
            },
        },
        produces: [
            'application/json',
        ],
        schemes: ['http', 'https'],
        host: SERVER_URL,
        basePath: '/',
    },
    apis: [path.join(__dirname, './../', 'controllers/*ts'), path.join(__dirname, './../', 'controllers/*js')],
};

// tslint:disable-next-line: no-var-requires
const swaggerJSDoc = require('swagger-jsdoc');

// tslint:disable-next-line: no-var-requires
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = swaggerJSDoc(options);

// tslint:disable-next-line: no-var-requires
require('swagger-model-validator')(swaggerSpec);

router.get('/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function validateModel(name, model) {
    const responseValidation = swaggerSpec.validateModel(name, model, false, true);
    if (!responseValidation.valid) {
        console.error(responseValidation.errors);
        throw new Error('Model doesn\'t match Swagger contract');
    }
}

function getdata(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
}

export default {
    router,
    validateModel,
    getdata,
};
