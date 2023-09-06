
import { Router } from "express";

import UserRouter from "./user.route";

import { IRoutes } from "../common/interfaces/IRoutes";
export class IndexRoute implements IRoutes {
    
    router = Router({ mergeParams: true });

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.use(UserRouter);
        
        console.info("Routes initiated...");
    }
}

