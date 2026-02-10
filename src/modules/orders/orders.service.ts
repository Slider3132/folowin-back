import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from '@/modules/customers/entities/customer.entity';
import { PaymentMethod } from '@/modules/payment-methods/entities/payment-method.entity';
import { ShippingMethod } from '@/modules/shipping-methods/entities/shipping-method';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

import { User } from '@/modules/users/entities/user.entity';
import { AuthorizedUserType } from '@/modules/users/types/authorized-user.type';
import { ResponseOrderDto } from './dto/response-order.dto';

type NormalizedItem = Pick<
  OrderItem,
  | 'product'
  | 'productVariant'
  | 'name'
  | 'unit'
  | 'quantity'
  | 'price'
  | 'purchasePrice'
  | 'total'
  | 'discount'
  | 'attributes'
>;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ShippingMethod)
    private readonly shippingMethodRepo: Repository<ShippingMethod>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
  ) {}

  // ---------- Utils ----------

  private toNumber(v: any, def = 0): number {
    if (v === null || v === undefined) return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  }

  private calcItemTotal(i: {
    quantity: any;
    price: any;
    discount?: any;
  }): number {
    const qty = this.toNumber(i.quantity);
    const price = this.toNumber(i.price);
    const disc = this.toNumber(i.discount, 0);
    const total = qty * price - disc;
    return total < 0 ? 0 : total;
  }

  private normalizeItems(raw: any[] | undefined): {
    items: NormalizedItem[];
    itemsTotal: number;
  } {
    if (!raw || raw.length === 0) {
      throw new BadRequestException('Порожній список товарів (orderItems).');
    }

    const items: NormalizedItem[] = raw.map((r) => {
      const quantity = this.toNumber(r.quantity);
      const price = this.toNumber(r.price);
      const discount =
        r.discount !== undefined ? this.toNumber(r.discount) : undefined;
      const purchasePrice =
        r.purchasePrice !== undefined ? this.toNumber(r.purchasePrice) : 0;

      if (!r.product || !r.productVariant || !r.name || !r.unit) {
        throw new BadRequestException(
          'Некоректний item: відсутні обов’язкові поля (product, productVariant, name, unit).',
        );
      }
      if (quantity <= 0 || price < 0) {
        throw new BadRequestException(
          'Некоректний item: quantity має бути > 0, price — ≥ 0.',
        );
      }

      const total =
        r.total !== undefined
          ? this.toNumber(r.total)
          : this.calcItemTotal({ quantity, price, discount });

      return {
        product: r.product,
        productVariant: r.productVariant,
        name: String(r.name),
        unit: String(r.unit),
        quantity,
        price,
        purchasePrice,
        discount,
        total,
        attributes: r.attributes ?? undefined,
      };
    });

    const itemsTotal = items.reduce(
      (acc, it) => acc + this.toNumber(it.total),
      0,
    );
    return { items, itemsTotal };
  }

  private async findEntityOrFail<T>(
    repo: Repository<T>,
    id: string,
    entityName: string,
  ): Promise<T> {
    const entity = await repo.findOneBy({ id } as any);
    if (!entity) {
      throw new NotFoundException(`${entityName} не найден`);
    }
    return entity;
  }

  private calculateOrderTotal(
    itemsTotal: number,
    shippingPrice: number,
    discount: number,
  ): number {
    const total = itemsTotal + (shippingPrice || 0) - (discount || 0);
    return total < 0 ? 0 : total;
  }

  // ---------- Read ----------

  /**
   * Отримати всі замовлення, доступні користувачу.
   * Якщо фільтр за customerId не потрібен — прибери параметр та where.
   */
  findAll(user: AuthorizedUserType, customerId?: string) {
    const queryBuilder = this.orderRepo.createQueryBuilder('order');

    queryBuilder
      .leftJoinAndSelect('order.manager', 'manager')
      .where('manager.id = :managerId', { managerId: user.id });

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    return queryBuilder.orderBy('order.createdAt', 'DESC').getMany();
  }

  async findOne(
    id: string,
    user: AuthorizedUserType,
  ): Promise<ResponseOrderDto> {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.shippingMethod', 'shippingMethod')
      .leftJoinAndSelect('order.paymentMethod', 'paymentMethod')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) throw new NotFoundException('Замовлення не знайдено');
    return order as any;
  }

  // ---------- Create ----------

  /**
   * Створити замовлення з айтемами (транзакційно).
   * - нормалізуємо items з DTO;
   * - обчислюємо totals по items та order.total;
   * - зберігаємо order + orderItems каскадно;
   * - при потребі — проставляємо “менеджера”/“createdBy” (скажи, яке саме поле).
   */
  async create(dto: CreateOrderDto, user: AuthorizedUserType): Promise<Order> {
    const { items, itemsTotal } = this.normalizeItems(dto.orderItems);

    const base: Partial<Order> = {
      customer: await this.findEntityOrFail(
        this.customerRepo,
        dto.customerId,
        'Customer',
      ),
      status: dto.status ?? 'new',
      shippingMethod: await this.findEntityOrFail(
        this.shippingMethodRepo,
        dto.shippingMethodId,
        'ShippingMethod',
      ),
      deliveryAddress: dto.deliveryAddress,
      shippingPrice: dto.shippingPrice,
      deliveryStatus: dto.deliveryStatus,
      trackingNumber: dto.trackingNumber,
      deliveryComment: dto.deliveryComment,
      manager: await this.findEntityOrFail(this.userRepo, user.id, 'User'),
      paymentMethod: await this.findEntityOrFail(
        this.paymentMethodRepo,
        dto.paymentMethodId,
        'PaymentMethod',
      ),
      paymentComment: dto.paymentComment,
      paymentStatus: dto.paymentStatus,
      paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      discount: dto.discount,
      notes: dto.notes,
      total: this.calculateOrderTotal(itemsTotal, dto.shippingPrice, dto.discount),
    };

    return await this.orderRepo.manager.transaction(async (tm) => {
      const order = tm.create(Order, base);
      order.orderItems = items.map((it) => tm.create(OrderItem, { ...it }));
      return tm.save(Order, order);
    });
  }

  // ---------- Update ----------

  /**
   * Оновити замовлення.
   * Якщо у dto передано orderItems — ми **повністю замінюємо** склад:
   *  - видаляємо старі items (по orderId),
   *  - вставляємо нові, перерахуємо totals, оновимо order.total.
   * Якщо orderItems НЕ передали — оновлюємо лише поля замовлення;
   *  якщо зміни торкаються total (discount/shippingPrice), перерахуємо total з існуючих items.
   */
  async update(
    id: string,
    dto: UpdateOrderDto,
    user: AuthorizedUserType,
  ): Promise<Order> {
    await this.findOne(id, user);

    return await this.orderRepo.manager.transaction(async (tm) => {
      let itemsTotal = 0;

      if (dto.orderItems && dto.orderItems.length) {
        const { items, itemsTotal: calcTotal } = this.normalizeItems(
          dto.orderItems,
        );
        itemsTotal = calcTotal;

        await tm.delete(OrderItem, { orderId: id });
        const newItems = items.map((it) =>
          tm.create(OrderItem, { ...it, orderId: id }),
        );
        await tm.save(OrderItem, newItems);
      } else if (
        dto.shippingPrice !== undefined ||
        dto.discount !== undefined
      ) {
        const existingItems = await tm.find(OrderItem, {
          where: { order: { id } },
        });
        itemsTotal = existingItems.reduce(
          (acc, it) => acc + this.toNumber(it.total),
          0,
        );
      }

      const patch: Partial<Order> = {
        customer: dto.customerId
          ? await this.findEntityOrFail(
              this.customerRepo,
              dto.customerId,
              'Customer',
            )
          : undefined,
        status: dto.status,
        shippingMethod: dto.shippingMethodId
          ? await this.findEntityOrFail(
              this.shippingMethodRepo,
              dto.shippingMethodId,
              'ShippingMethod',
            )
          : undefined,
        deliveryAddress: dto.deliveryAddress,
        shippingPrice: dto.shippingPrice,
        deliveryStatus: dto.deliveryStatus,
        trackingNumber: dto.trackingNumber,
        deliveryComment: dto.deliveryComment,
        manager: await this.findEntityOrFail(this.userRepo, user.id, 'User'),
        paymentMethod: dto.paymentMethodId
          ? await this.findEntityOrFail(
              this.paymentMethodRepo,
              dto.paymentMethodId,
              'PaymentMethod',
            )
          : undefined,
        paymentComment: dto.paymentComment,
        paymentStatus: dto.paymentStatus,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
        discount: dto.discount,
        notes: dto.notes,
      };

      if (dto.orderItems && dto.orderItems.length) {
        patch.total = this.calculateOrderTotal(
          itemsTotal,
          dto.shippingPrice,
          dto.discount,
        );
      } else if (
        dto.shippingPrice !== undefined ||
        dto.discount !== undefined
      ) {
        const orderBefore = await tm.findOneByOrFail(Order, { id });
        const ship =
          dto.shippingPrice !== undefined
            ? dto.shippingPrice
            : orderBefore.shippingPrice;
        const disc =
          dto.discount !== undefined ? dto.discount : orderBefore.discount;
        const baseItemsTotal =
          itemsTotal === 0 ? this.toNumber(orderBefore.total) : itemsTotal;
        patch.total = this.calculateOrderTotal(baseItemsTotal, ship, disc);
      }

      await tm.update(Order, { id }, patch);
      return tm.findOneByOrFail(Order, { id });
    });
  }

  // ---------- Delete ----------

  async remove(id: string, user: AuthorizedUserType): Promise<void> {
    const order = await this.findOne(id, user);
    await this.orderRepo.manager.transaction(async (tm) => {
      await tm.delete(OrderItem, { orderId: id });
      await tm.delete(Order, { id });
    });
  }
}
