import { AppError } from './AppError.js';

export class ConflictError extends AppError {
  constructor(message = 'Conflict occurred', details = null) {
    super(message, 409, details);
  }
}
