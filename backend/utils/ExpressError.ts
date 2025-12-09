class ExpressError extends Error{
    statusCode: number;
    constructor(statusCode: number, message: string){
        super();
        this.statusCode = statusCode;
        this.message = message;
        Object.setPrototypeOf(this, ExpressError.prototype);
    }
}

export default ExpressError;