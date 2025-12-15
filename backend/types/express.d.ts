declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email:string;
            };
            accessToken?: string | null;
        }
    }
}

export {};