import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message = 'Validation Failed', details = null) {
    super(message, 422, details);
  }
}
