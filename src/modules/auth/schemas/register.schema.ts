import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const AuthOKSchema: SchemaObject = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
  },
};
