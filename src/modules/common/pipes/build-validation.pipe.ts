import { UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";

export function buildHttpValidationPipe() {
  return new ValidationPipe({
    transform: false,
    whitelist: true,
    forbidUnknownValues: true,
    exceptionFactory: (errors: ValidationError[]) => {
      return new UnprocessableEntityException({
        statusCode: 422,
        message: 'Validation errors',
        errors: errors.map(e => ({
          field: e.property,
          constraints: e.constraints,
        })),
      });
    },
  });
}
