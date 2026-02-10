import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PaymentMethod } from '@/modules/payment-methods/entities/payment-method.entity';
import { AuthorizedUserType } from '@/modules/users/types/authorized-user.type';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { ShippingMethod } from './entities/shipping-method';

@Injectable()
export class ShippingMethodsService {
  constructor(
    @InjectRepository(ShippingMethod)
    private readonly repository: Repository<ShippingMethod>,
    @InjectRepository(PaymentMethod)
    private readonly paymentRepository: Repository<PaymentMethod>,
  ) {}

  // ===== READ =====
  async findAll(_user: AuthorizedUserType): Promise<ShippingMethod[]> {
    // Якщо потрібна фільтрація за ролями/організацією — додамо тут
    return this.repository.find({
      relations: ['paymentMethods'],
      order: { order: 'ASC' as any, name: 'ASC' as any },
    });
  }

  async findActive(_user: AuthorizedUserType): Promise<ShippingMethod[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['paymentMethods'],
      order: { order: 'ASC' as any, name: 'ASC' as any },
    });
  }

  async findOne(
    id: string,
    _user: AuthorizedUserType,
  ): Promise<ShippingMethod> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['paymentMethods'],
    });
    if (!entity) throw new NotFoundException('Метод доставки не знайдено');
    return entity;
  }

  // ===== CREATE =====
  async create(
    dto: CreateShippingMethodDto,
    _user: AuthorizedUserType,
  ): Promise<ShippingMethod> {
    if (dto.order !== undefined && dto.order < 0) {
      throw new BadRequestException('order не може бути відʼємним');
    }

    const paymentMethods = dto.paymentMethodIds
      ? await this.paymentRepository.find({
          where: { id: In(dto.paymentMethodIds) },
        })
      : [];

    if (
      dto.paymentMethodIds &&
      paymentMethods.length !== dto.paymentMethodIds.length
    ) {
      throw new BadRequestException('Деякі paymentMethodIds не знайдені');
    }

    const entity = this.repository.create({
      ...dto,
      paymentMethods,
    });

    return this.repository.save(entity);
  }

  // ===== UPDATE =====
  async update(
    id: string,
    dto: UpdateShippingMethodDto,
    _user: AuthorizedUserType,
  ): Promise<ShippingMethod> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['paymentMethods'],
    });
    if (!entity) throw new NotFoundException('Метод доставки не знайдено');

    if (dto.order !== undefined && dto.order < 0) {
      throw new BadRequestException('order не може бути відʼємним');
    }

    const paymentMethods = dto.paymentMethodIds
      ? await this.paymentRepository.find({
          where: { id: In(dto.paymentMethodIds) },
        })
      : [];

    if (
      dto.paymentMethodIds &&
      paymentMethods.length !== dto.paymentMethodIds.length
    ) {
      throw new BadRequestException('Деякі paymentMethodIds не знайдені');
    }

    Object.assign(entity, dto, { paymentMethods });

    return this.repository.save(entity);
  }

  // ===== DELETE =====
  async remove(id: string, _user: AuthorizedUserType): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Метод доставки не знайдено');

    try {
      // якщо в ентіті є @DeleteDateColumn — буде softDelete
      await this.repository.softDelete(id);
    } catch {
      await this.repository.delete(id);
    }
  }
}
