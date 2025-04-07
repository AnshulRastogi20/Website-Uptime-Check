import { Request, Response, NextFunction } from 'express';

declare namespace Express {
    interface Request {
        userId?: string;
    }
}

declare module 'express' {
    export interface RequestHandler {
        (req: Request, res: Response, next: NextFunction): any;
    }
}