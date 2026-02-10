import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';

import { RolesEnum } from '@/modules/users/enums/roles.enum';
import { AuthorizedUserType } from '../users/types/authorized-user.type';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repo: Repository<PaymentMethod>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ===== Helpers =============================================================

  private isAdmin(user: AuthorizedUserType): boolean {
    return Array.isArray(user?.roles) && user.roles.includes(RolesEnum.admin);
  }

  private isManager(user: AuthorizedUserType): boolean {
    return Array.isArray(user?.roles) && user.roles.includes(RolesEnum.manager);
  }

  private async mustFindAccessible(
    id: string,
    user: AuthorizedUserType,
  ): Promise<PaymentMethod> {
    const entity = await this.findOne(id, user);
    if (!entity) {
      throw new NotFoundException(
        'Спосіб оплати не знайдено або немає доступу',
      );
    }
    return entity;
  }

  // ===== READ ================================================================

  /**
   * Адмін: усі.
   * Менеджер: глобальні + свої (managerId = user.id).
   */
  async findAll(user: AuthorizedUserType): Promise<PaymentMethod[]> {
    if (this.isAdmin(user)) {
      return this.repo.find({
        order: { order: 'ASC', name: 'ASC' },
      });
    }

    // менеджер
    return this.repo.find({
      where: [
        { isActive: true, isGlobal: true },
        { isActive: true, manager: { id: user.id } },
      ],
      relations: ['manager'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Ті самі правила, але лише активні.
   */
  async findActive(user: AuthorizedUserType): Promise<PaymentMethod[]> {
    if (this.isAdmin(user)) {
      return this.repo.find({
        where: { isActive: true },
        order: { order: 'ASC', name: 'ASC' },
      });
    }

    return this.repo.find({
      where: [
        { isActive: true, isGlobal: true },
        { isActive: true, manager: { id: user.id } },
      ],
      relations: ['manager'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Повертає спосіб, якщо він доступний користувачу.
   * Адмін бачить усі; менеджер — глобальні або свої.
   */
  async findOne(id: string, user: AuthorizedUserType): Promise<PaymentMethod> {
    const where = this.isAdmin(user)
      ? { id }
      : [
          { id, isGlobal: true },
          { id, manager: { id: user.id } },
        ];

    const entity = await this.repo.findOne({ where, relations: ['manager'] });
    if (!entity) {
      throw new NotFoundException(
        'Спосіб оплати не знайдено або немає доступу',
      );
    }
    return entity;
  }

  /**
   * ЄДИНИЙ метод створення.
   * - Якщо у користувача одночасно ролі admin і manager — застосовуються правила адміна (адмін має пріоритет).
   * - Менеджер: примусово НЕ глобальний, managerId = user.id.
   * - Адмін: якщо isGlobal === true → створюємо глобальний;
   *          якщо НЕ глобальний → обовʼязково потрібен managerId;
   *          якщо обидва не задані (isGlobal !== true і managerId відсутній) → 400.
   */

  // ===== ROLE-SPECIFIC: ADMIN ===============================================
  /**
   * Створення (тільки адмін).
   * Адмін сам передає isGlobal/managerId.
   * - Якщо isGlobal === true → managerId = null.
   * - Якщо isGlobal !== true → потрібен managerId (у dto).
   */
  async createByAdmin(
    dto: CreatePaymentMethodDto,
    user: AuthorizedUserType,
  ): Promise<PaymentMethod> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Лише адмін може виконати цю дію');
    }

    const isGlobal = dto.isGlobal === true;

    if (isGlobal) {
      const entity = this.repo.create({
        ...dto,
        isGlobal: true,
        manager: null,
      });
      return this.repo.save(entity);
    }

    if (!dto.managerId) {
      throw new BadRequestException(
        'Для не-глобального способу оплати потрібен managerId',
      );
    }

    const manager = await this.userRepo.findOne({
      where: { id: dto.managerId, roles: RolesEnum.manager },
    });
    if (!manager) {
      throw new NotFoundException('Менеджера не знайдено');
    }

    const entity = this.repo.create({
      ...dto,
      isGlobal: false,
      manager,
    });
    return this.repo.save(entity);
  }

  /**
   * Оновлення (тільки адмін).
   * - Якщо результат глобальний → managerId = null.
   * - Якщо не глобальний → потрібен managerId (з dto або наявний).
   */
  async updateByAdmin(
    id: string,
    dto: UpdatePaymentMethodDto,
    user: AuthorizedUserType,
  ): Promise<PaymentMethod> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Лише адмін може виконати цю дію');
    }

    const entity = await this.repo.findOne({
      where: { id },
      relations: ['manager'],
    });
    if (!entity) throw new NotFoundException('Спосіб оплати не знайдено');

    const isGlobalNext =
      dto.isGlobal !== undefined ? dto.isGlobal : entity.isGlobal;

    let managerNext =
      dto.managerId !== undefined
        ? await this.userRepo.findOne({
            where: { id: dto.managerId, roles: RolesEnum.manager },
          })
        : entity.manager;

    if (isGlobalNext === true) {
      managerNext = null;
    } else if (!managerNext) {
      throw new BadRequestException(
        'Для не-глобального способу оплати потрібен managerId',
      );
    }

    Object.assign(entity, dto, {
      isGlobal: isGlobalNext,
      manager: managerNext,
    });
    return this.repo.save(entity);
  }

  /**
   * Видалення (тільки адмін): будь-які записи.
   */
  async removeByAdmin(id: string, user: AuthorizedUserType): Promise<void> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Лише адмін може виконати цю дію');
    }

    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Спосіб оплати не знайдено');

    try {
      await this.repo.softDelete(id);
    } catch {
      await this.repo.delete(id);
    }
  }

  // ===== ROLE-SPECIFIC: MANAGER =============================================
  /**
   * Створення (тільки менеджер).
   * Менеджер НЕ може створювати глобальні; managerId передавати не потрібно —
   * він береться з user.id.
   */
  async createByManager(
    dto: CreatePaymentMethodDto,
    user: AuthorizedUserType,
  ): Promise<PaymentMethod> {
    if (!this.isManager(user)) {
      throw new ForbiddenException('Лише менеджер може виконати цю дію');
    }

    if (dto.isGlobal) {
      throw new ForbiddenException(
        'Менеджер не може створювати глобальні способи оплати',
      );
    }

    const manager = await this.userRepo.findOne({
      where: { id: user.id, roles: RolesEnum.manager },
    });
    if (!manager) {
      throw new NotFoundException('Менеджера не знайдено');
    }

    const entity = this.repo.create({
      ...dto,
      isGlobal: false,
      manager,
    });
    return this.repo.save(entity);
  }

  /**
   * Оновлення (тільки менеджер).
   * Лише СВОЇ не-глобальні; isGlobal=true заборонено;
   * managerId фіксується як user.id (ігноруємо те, що прийшло з dto).
   */
  async updateByManager(
    id: string,
    dto: UpdatePaymentMethodDto,
    user: AuthorizedUserType,
  ): Promise<PaymentMethod> {
    if (!this.isManager(user)) {
      throw new ForbiddenException('Лише менеджер може виконати цю дію');
    }

    const entity = await this.repo.findOne({
      where: { id },
      relations: ['manager'],
    });
    if (!entity) throw new NotFoundException('Спосіб оплати не знайдено');

    if (entity.isGlobal || entity.manager?.id !== user.id) {
      throw new ForbiddenException(
        'Недостатньо прав для оновлення цього способу',
      );
    }

    if (dto.isGlobal === true) {
      throw new ForbiddenException('Менеджер не може робити спосіб глобальним');
    }

    Object.assign(entity, dto, { isGlobal: false });
    return this.repo.save(entity);
  }

  /**
   * Видалення (тільки менеджер).
   * Лише СВОЇ не-глобальні способи.
   */
  async removeByManager(id: string, user: AuthorizedUserType): Promise<void> {
    if (!this.isManager(user)) {
      throw new ForbiddenException('Лише менеджер може виконати цю дію');
    }

    const entity = await this.repo.findOne({
      where: { id },
      relations: ['manager'],
    });
    if (!entity) throw new NotFoundException('Спосіб оплати не знайдено');

    if (entity.isGlobal || entity.manager?.id !== user.id) {
      throw new ForbiddenException(
        'Недостатньо прав для видалення цього способу',
      );
    }

    try {
      await this.repo.softDelete(id);
    } catch {
      await this.repo.delete(id);
    }
  }
}
