export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly isOperatinal: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperatinal = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
