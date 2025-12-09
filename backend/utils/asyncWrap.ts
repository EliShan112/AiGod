import type {Request, Response, NextFunction, RequestHandler} from "express"


const asyncWrap = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next) as unknown as Promise<any>)
        .catch(next);
    }
};

export default asyncWrap;
