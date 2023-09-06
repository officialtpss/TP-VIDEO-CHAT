import cors from 'cors';
import path from 'path';
import * as http from 'http';
import bodyParser from 'body-parser';
import schedule from "node-schedule";
import express, { NextFunction, Request, Response } from 'express';

import swagger from './swagger';
import * as config from './constant';
import { IndexRoute } from './routes/index';
import httpStatus from './helpers/httpStatus.helper';

import { IRoutes } from './common/interfaces/IRoutes';
import { ILooseObject } from './common/interfaces/ILooseObject';

import AppointmentController from "./controllers/appointment.controller";

export default class App extends http.Server {

    public app: express.Application;
    public port: string | number;
    public env: string;
    private server?: http.Server;

    constructor() {
        super();
        this.app = express();
        this.port = config.PORT;
        this.env = config.CONF_ENV;
    }

    public async initialize(): Promise<void> {

        this.initializeMiddlewares();
        this.initializeRoutes(new IndexRoute());
    }

    public async start() {

        this.server = this.app.listen(this.port, () => {
            console.log(`==========================================`);
            console.log(`🚀 API (${this.env}) listening on the port ${this.port}`);
            console.log(`==========================================`);
        });

        this.cronJob();
    }

    public async disconnect(): Promise<void> {

        if (this.server) {
            await new Promise((resolve, reject) => {
                this.server?.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            }).then(() => {
                return schedule.gracefulShutdown().then(() => {
                    console.log('gracefulShutdown');
                    return true;
                });
            });
        }
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {

        this.app.use(cors({ origin: '*' }));
        this.app.use(bodyParser.json({ limit: '2mb' }));
        this.app.use(express.urlencoded({
            limit: '3mb', extended: true
        }));

        this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'POST, GET, PUT,PATCH, DELETE');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, content-type');
            if ('OPTIONS' === req.method) return res.status(200).send();
            next();
        });

        this.app.use('/docs', swagger.router);
        this.app.use('/public', express.static(path.join(__dirname, './../', 'public')));
    }

    public initializeRoutes(routes: IRoutes) {
        this.app.use('/', routes.router);
        this.app.use((err: ILooseObject, req: Request, res: Response, next: NextFunction) => {
            if (err.name === 'UnauthorizedError') {
                return httpStatus.sendError401({ message: 'USER_UNAUTHENTICATED' }, res);
            }
            next();
        });
    }

    /**
     * Need to start this job during
     * server restart so that cron will
     * not impacted by server
     */
    public cronJob() {

        /**
         * This cron jobs will run to send
         * Bulk emails
         */
        schedule.scheduleJob('*/30 * * * *', async function () {

            const AppointmentObj = new AppointmentController();
            AppointmentObj.fetchAppBeforeOneHour()
                .then((res) => console.log('Cron', JSON.stringify(res)))
                .catch((err) => console.log('Cron Err', JSON.stringify(err)));

        });
    }
}
