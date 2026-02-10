import { Order } from '@/modules/orders/entities/order.entity';
import { AuthorizedUserType } from '@/modules/users/types/authorized-user.type';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateManagerCustomerAddressDto } from './dto/create-address.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ResponseCustomerDto } from './dto/response-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Address } from './entities/address.entity';
import { Customer } from './entities/customer.entity';
import { ManagerCustomer } from './entities/manager-customer.entity';

type ListParams = {
  q?: string;
  category?: string;
  page: number;
  limit: number;
};

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
    @InjectRepository(ManagerCustomer)
    private readonly managerCustomersRepo: Repository<ManagerCustomer>,
    @InjectRepository(Address)
    private readonly addressesRepo: Repository<Address>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  /* ===== List for current manager with pagination & filters ===== */
  async list(
    user: AuthorizedUserType,
    { q, category, page, limit }: ListParams,
  ) {
    const qb = this.managerCustomersRepo
      .createQueryBuilder('mc')
      .innerJoinAndSelect('mc.customer', 'customer')
      .leftJoinAndSelect('mc.addresses', 'address')
      .where('mc.manager.id = :managerId', { managerId: user.id });

    if (q) {
      qb.andWhere('(customer.phone ILIKE :q OR mc.name ILIKE :q)', {
        q: `%${q}%`,
      });
    }
    if (category) {
      qb.andWhere('mc.category = :category', { category });
    }

    const total = await qb.getCount();
    const items = await qb
      .orderBy('customer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Повертаємо агрегат під фронт
    return {
      items: items.map((mc) => this.mapAggregate(mc)),
      page,
      limit,
      total,
    };
  }

  /* ===== Find one (only if bound to current manager) ===== */
  async findOneForManager(user: AuthorizedUserType, customerId: string) {
    const mc = await this.managerCustomersRepo.findOne({
      where: { manager: { id: user.id }, customer: { id: customerId } },
      relations: ['customer', 'addresses'],
    });
    if (!mc) throw new NotFoundException('Customer not found');
    return this.mapAggregate(mc);
  }

  /* ===== Create or link by phone (upsert) ===== */
  async createOrLink(user: AuthorizedUserType, dto: CreateCustomerDto) {
    // 1) Знайти/створити Customer по телефону
    let customer = await this.customersRepo.findOne({
      where: { phone: dto.phone },
    });
    if (!customer) {
      customer = this.customersRepo.create({
        phone: dto.phone,
        email: dto.email ?? null,
        user: dto.userId ? { id: dto.userId } : null,
      });
      try {
        customer = await this.customersRepo.save(customer);
      } catch (e: any) {
        if (e?.code === '23505')
          throw new BadRequestException('Клієнт з таким телефоном вже існує');
        throw e;
      }
    } else {
      // оновимо email/userId, якщо передані
      if (dto.email !== undefined || dto.userId !== undefined) {
        Object.assign(customer, {
          email: dto.email ?? customer.email,
          user: dto.userId ? { id: dto.userId } : customer.user,
        });
        await this.customersRepo.save(customer);
      }
    }

    // 2) Знайти/створити зв’язок manager↔customer
    let mc = await this.managerCustomersRepo.findOne({
      where: { manager: { id: user.id }, customer: { id: customer.id } },
      relations: ['addresses'],
    });

    if (!mc) {
      mc = this.managerCustomersRepo.create({
        manager: { id: user.id },
        customer,
        ...dto,
      });
      mc = await this.managerCustomersRepo.save(mc);
    } else {
      Object.assign(mc, dto);
      await this.managerCustomersRepo.save(mc);
    }

    // 3) Якщо передані адреси — перезапишемо (спрощено)
    if (dto.addresses && dto.addresses.length > 0) {
      await this.addressesRepo.delete({ managerCustomer: { id: mc.id } });
      const toSave = dto.addresses.map((a) =>
        this.addressesRepo.create({ ...a, managerCustomer: mc }),
      );
      await this.addressesRepo.save(toSave);
    }

    // 4) Повертаємо агрегат
    const freshMc = await this.managerCustomersRepo.findOneOrFail({
      where: { id: mc.id },
      relations: ['customer', 'addresses'],
    });
    return this.mapAggregate(freshMc);
  }

  /* ===== Update both Customer & ManagerCustomer for current manager ===== */
  async updateForManager(
    user: AuthorizedUserType,
    customerId: string,
    dto: UpdateCustomerDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const customersRepo = manager.getRepository(Customer);
      const managerCustomersRepo = manager.getRepository(ManagerCustomer);
      const addressesRepo = manager.getRepository(Address);

      const customer = await customersRepo.findOne({
        where: { id: customerId },
      });
      if (!customer) throw new NotFoundException('Customer not found');

      const mc = await managerCustomersRepo.findOne({
        where: { manager: { id: user.id }, customer: { id: customerId } },
      });
      if (!mc) throw new NotFoundException('Customer not found');

      // оновлення глобальних полів клієнта
      if (dto.phone && dto.phone !== customer.phone) {
        // перевірка унікальності телефону
        const exists = await customersRepo.findOne({
          where: { phone: dto.phone },
        });
        if (exists && exists.id !== customer.id) {
          throw new BadRequestException(
            'Телефон вже використовується іншим клієнтом',
          );
        }
      }
      await customersRepo.update(customer.id, {
        phone: dto.phone ?? customer.phone,
        email: dto.email ?? customer.email,
        user: dto.userId ? { id: dto.userId } : customer.user,
      });

      // оновлення менеджерських полів
      await managerCustomersRepo.update(mc.id, {
        name: dto.name ?? mc.name,
        category: dto.category ?? mc.category,
        comment: dto.comment ?? mc.comment,
        notes: dto.notes ?? mc.notes,
        extra: dto.extra ?? mc.extra,
      });

      // адреси: якщо переданий масив — повна заміна
      if (dto.addresses) {
        await addressesRepo.delete({ managerCustomerId: mc.id });
        if (dto.addresses.length > 0) {
          const toSave = dto.addresses.map((a) =>
            addressesRepo.create({ ...a, managerCustomerId: mc.id }),
          );
          await addressesRepo.save(toSave);
        }
      }

      const freshMc = await managerCustomersRepo.findOneOrFail({
        where: { id: mc.id },
        relations: ['customer', 'addresses'],
      });
      return this.mapAggregate(freshMc);
    });
  }

  /* ===== Unlink (видалити зв’язок manager↔customer для поточного менеджера) ===== */
  async unlinkFromManager(
    user: AuthorizedUserType,
    customerId: string,
  ): Promise<void> {
    const mc = await this.managerCustomersRepo.findOne({
      where: { manager: { id: user.id }, customer: { id: customerId } },
    });
    if (!mc) throw new NotFoundException('Customer not found');
    await this.managerCustomersRepo.delete(mc.id);
    // Примітка: сам Customer НЕ видаляється
  }

  /* ===== Addresses CRUD (належать managerCustomer) ===== */
  async addAddress(
    user: AuthorizedUserType,
    customerId: string,
    dto: CreateManagerCustomerAddressDto,
  ) {
    const mc = await this.managerCustomersRepo.findOne({
      where: { manager: { id: user.id }, customer: { id: customerId } },
    });
    if (!mc) throw new NotFoundException('Customer not found');

    const address = this.addressesRepo.create({
      ...dto,
      managerCustomer: { id: mc.id },
    });
    return this.addressesRepo.save(address);
  }

  async updateAddress(
    user: AuthorizedUserType,
    customerId: string,
    addressId: string,
    dto: Partial<CreateManagerCustomerAddressDto>,
  ) {
    const mc = await this.managerCustomersRepo.findOne({
      where: { manager: { id: user.id }, customer: { id: customerId } },
    });
    if (!mc) throw new NotFoundException('Customer not found');

    const addr = await this.addressesRepo.findOne({
      where: { id: addressId, managerCustomer: { id: mc.id } },
    });
    if (!addr) throw new NotFoundException('Address not found');

    await this.addressesRepo.update(addressId, { ...dto });
    return this.addressesRepo.findOneByOrFail({ id: addressId });
  }

  async deleteAddress(
    user: AuthorizedUserType,
    customerId: string,
    addressId: string,
  ): Promise<void> {
    const mc = await this.managerCustomersRepo.findOne({
      where: { manager: { id: user.id }, customer: { id: customerId } },
    });
    if (!mc) throw new NotFoundException('Customer not found');

    const addrToDelete = await this.addressesRepo.findOne({
      where: { id: addressId, managerCustomer: { id: mc.id } },
    });
    if (!addrToDelete) throw new NotFoundException('Address not found');

    await this.addressesRepo.delete(addressId);
  }

  /* ===== Mapper to aggregate shape ===== */
  private async mapAggregate(
    mc: ManagerCustomer,
  ): Promise<ResponseCustomerDto> {
    const { customer } = mc;

    // Fetch orders for the customer managed by the current manager using ordersRepo
    const orders = await this.ordersRepo.find({
      where: { customer: { id: customer.id }, manager: { id: mc.manager.id } },
    });

    return {
      id: customer.id,
      phone: customer.phone,
      email: customer.email ?? null,
      user: customer.user ? customer.user : null,
      managerContext: {
        id: mc.id,
        name: mc.name ?? null,
        category: mc.category ?? null,
        comment: mc.comment ?? null,
        notes: mc.notes ?? null,
        extra: mc.extra ?? null,
        addresses: (mc.addresses ?? []).map((a) => ({
          id: a.id,
          label: a.label ?? null,
          line1: a.line1,
          line2: a.line2 ?? null,
          city: a.city,
          region: a.region ?? null,
          postalCode: a.postalCode ?? null,
          countryCode: a.countryCode ?? null,
          isDefault: a.isDefault,
          placeId: a.placeId ?? null,
          lat: a.lat ?? null,
          lng: a.lng ?? null,
        })),
        orders,
      },
    };
  }
}
