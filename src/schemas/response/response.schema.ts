// Exception

import { getSchemaPath } from '@nestjs/swagger';

export const ExceptionSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    message: { type: 'string' },
    error: { type: 'string' },
  },
};

// Response

export const UserLoginResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
  },
};

export const PaginationSchema = (model) => ({
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        $ref: getSchemaPath(model),
      },
    },
    total: { type: 'number' },
    page: { type: 'number' },
    lastPage: { type: 'number' },
  },
});
