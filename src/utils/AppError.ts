class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public status: string;


  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(this.statusCode).startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
