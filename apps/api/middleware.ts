import type { Request , Response , NextFunction} from "express";

import  jwt from "jsonwebtoken";
import { JWT_PUBLIC_KEY } from "./config";

export function authMiddleware(req: Request , res: Response , next: NextFunction){
    const token = req.headers["authorization"];
    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    const decoded = jwt.verify(token, JWT_PUBLIC_KEY);
    console.log(decoded);
    if(!decoded || !decoded.sub){   
        return res.status(401).json({message: "Unauthorized"});
    }

    // @ts-ignore: Adding userId to Request object
    req.userId = decoded.sub as string;

    next();
    
}
