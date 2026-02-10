// src/modules/customers/entities/address.entity.ts
import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ManagerCustomer } from './manager-customer.entity';

const decimalToNumber = {
  to: (v: number | null) => v,
  from: (v: string | null) => (v === null ? null : parseFloat(v)),
};

@Entity('manager_customer_address')
export class Address extends BaseEntity {
  @ApiProperty({ description: 'ID зв’язку менеджер—клієнт' })
  @Index()
  @Column({ name: 'manager_customer_id' })
  managerCustomerId: string;

  @ManyToOne(() => ManagerCustomer, (mc) => mc.addresses, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'manager_customer_id' })
  managerCustomer: ManagerCustomer | null;

  @ApiPropertyOptional({ example: 'Склад №1' })
  @Column({ nullable: true, length: 100 })
  label?: string;

  @ApiProperty({ example: 'вул. Хрещатик, 1' })
  @Column({ length: 255 })
  line1: string;

  @ApiPropertyOptional({ example: 'офіс 12' })
  @Column({ nullable: true, length: 255 })
  line2?: string;

  @ApiProperty({ example: 'Київ' })
  @Column({ length: 120 })
  city: string;

  @ApiPropertyOptional({ example: 'Київська' })
  @Column({ nullable: true, length: 120 })
  region?: string;

  @ApiPropertyOptional({ example: '01001' })
  @Column({ nullable: true, length: 20 })
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'UA',
    description: 'Код країни ISO 3166-1 alpha-2',
  })
  @Column({ nullable: true, length: 2 })
  countryCode?: string;

  @ApiProperty({ example: false, description: 'Адреса за замовчуванням' })
  @Column({ default: false })
  isDefault: boolean;

  @ApiPropertyOptional({
    example: 'ChIJBUVa4U7P1EAR_kYBF9IxSXY',
    description: 'Google Place ID',
  })
  @Column({ nullable: true, length: 128 })
  placeId?: string;

  @ApiPropertyOptional({ example: 50.4501 })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: decimalToNumber,
  })
  lat?: number;

  @ApiPropertyOptional({ example: 30.5234 })
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: decimalToNumber,
  })
  lng?: number;
}
