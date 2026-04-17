import slugify from 'slugify';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Category } from '../entities/category.entity';

@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<Category> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Category;
  }

  beforeInsert(event: InsertEvent<Category>) {
    if (!event.entity.slug && event.entity.name) {
      event.entity.slug = slugify(event.entity.name, {
        lower: true,
        strict: true,
        locale: 'ua',
        trim: true,
      });
    }
  }

  beforeUpdate(event: UpdateEvent<Category>) {
    // slug пересоздаётся, если name изменился и slug явно не передан
    if (
      event.entity &&
      event.databaseEntity &&
      event.entity.name !== event.databaseEntity.name
    ) {
      if (!event.entity.slug) {
        event.entity.slug = slugify(event.entity.name, {
          lower: true,
          strict: true,
          locale: 'ua',
          trim: true,
        });
      }
    }
  }
}
