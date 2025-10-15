import { HttpStatus } from "@nestjs/common";
import { AppException } from "./app.exception";
import { ERROR_CODES } from "./auth-error-codes.exception";

export class InvalidCredentialsException extends AppException {
  constructor() {
    super(ERROR_CODES.INVALID_CREDENTIALS,  `Invalid credentials`, HttpStatus.UNAUTHORIZED);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(serviceName: string) {
    super(ERROR_CODES.SERVICE_UNAVAILABLE, `${serviceName} Service Unavailable`, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class GatewayTimeoutException extends AppException {
  constructor(serviceName: string) {
    super(ERROR_CODES.SERVICE_TIMEOUT, `${serviceName} Service Timeout`, HttpStatus.GATEWAY_TIMEOUT);
  }
}

export class BadGatewayException extends AppException {
  constructor() {
    super(ERROR_CODES.UPSTREAM_ERROR, `Upstream error`, HttpStatus.BAD_GATEWAY);
  }
}

export class BadRequestException extends AppException {
  constructor(message: string) {
    super(ERROR_CODES.BAD_REQUEST, message, HttpStatus.BAD_REQUEST);
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(ERROR_CODES.CONFLICT, message, HttpStatus.CONFLICT);
  }
}
