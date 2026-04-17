import { BaseEntity } from '@/common/entities/base.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ManagerCustomer } from './manager-customer.entity';
@Entity()
export class Customer extends BaseEntity {
  @ApiProperty({ example: '+380991234567', description: 'Уникальный телефон' })
  @Column({ unique: true })
  phone: string;

  @ApiProperty({ example: 'user@email.com', required: false })
  @Column({ unique: true, nullable: true })
  email?: string;

  @ApiProperty({
    required: false,
    description: 'userId, якщо кастомер зареєстрований',
  })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @OneToMany(() => ManagerCustomer, (mc) => mc.customer)
  managerCustomers: ManagerCustomer[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
}
