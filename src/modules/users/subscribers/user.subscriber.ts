import { genSalt, hash } from 'bcryptjs';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): CallableFunction | string {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    const { entity } = event;

    if (entity) {
      if (entity.password) {
        const salt = await genSalt(10);
        entity.password = await hash(entity.password, salt);
      }
    }
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    const { entity } = event;

    if (entity) {
      const { address } = entity;
    }
  }
}
