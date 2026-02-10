// src/modules/customers/entities/manager-customer.entity.ts
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Address } from './address.entity';
import { Customer } from './customer.entity';

@Entity('manager_customer')
@Index(['managerId', 'customerId'], { unique: true })
export class ManagerCustomer extends BaseEntity {
  @ApiProperty({ description: 'ID клієнта' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.managerCustomers, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  @ApiProperty({ description: 'ID менеджера (User.id)' })
  @Column({ name: 'manager_id' })
  managerId: string;

  @ManyToOne(() => User, (user) => user.managerCustomers, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'manager_id' })
  manager: User | null;

  @ApiPropertyOptional({ example: 'Іван Петров' })
  @Column({ nullable: true, length: 120 })
  name?: string;

  @ApiPropertyOptional({ example: 'VIP' })
  @Column({ nullable: true, length: 50 })
  category?: string;

  @ApiPropertyOptional({ example: 'Дзвонити після 17:00' })
  @Column({ nullable: true, length: 1000 })
  comment?: string;

  @ApiPropertyOptional({ example: 'Постійний клієнт' })
  @Column({ nullable: true, length: 2000 })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Додаткові поля менеджера',
    example: { discountLevel: 'gold' },
  })
  @Column({ type: 'jsonb', nullable: true })
  extra?: Record<string, any>;

  @OneToMany(() => Address, (address) => address.managerCustomer, {
    cascade: true,
  })
  addresses: Address[];
}
