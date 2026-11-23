import { AppError } from './AppError.js';

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', identifier = '') {
    const message = identifier ? `${resource} with id/identifier '${identifier}' was not found` : `${resource} not found`;
    super(message, 404, { resource, identifier });
  }
}
