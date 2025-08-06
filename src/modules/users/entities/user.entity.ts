import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { RolesEnum } from '../enums/roles.enum';

class Address {
  @ApiProperty({
    title: 'street address',
  })
  @Column()
  street: string;

  @ApiProperty({
    title: 'street apartment',
  })
  @Column()
  apartment: string;

  @ApiProperty({
    title: 'city',
  })
  @Column()
  city: string;

  @ApiProperty({
    title: 'district',
  })
  @Column()
  district: string;

  @ApiProperty({
    title: 'state/province',
  })
  @Column()
  state: string;

  @ApiProperty({
    title: 'zip/postal code',
  })
  @Column()
  zip: string;
}

@Entity()
export class User extends BaseEntity {
  @ApiProperty({
    title: 'user avatar',
  })
  @Column({ nullable: true })
  avatar?: string | null;

  @ApiProperty({
    title: 'user email',
  })
  @Column({
    unique: true,
  })
  email: string;

  @ApiProperty({
    title: 'user password',
  })
  @Exclude()
  @Column({ nullable: true })
  password?: string | null;

  @ApiProperty({
    title: 'user firstname',
  })
  @Column({ name: 'first_name', nullable: true })
  firstName?: string | null;

  @ApiProperty({
    title: 'user lastname',
  })
  @Column({ name: 'last_name', nullable: true })
  lastName?: string | null;

  @ApiProperty({
    title: 'phone',
  })
  @Column({
    nullable: true,
  })
  phone?: string | null;

  @ApiProperty({
    title: 'roles',
    enum: RolesEnum,
    example: [RolesEnum.guest],
  })
  @Column({
    type: 'enum',
    enum: RolesEnum,
    array: true,
  })
  roles: RolesEnum[];

  @ApiProperty({
    title: 'address',
  })
  @Column({ type: 'simple-json', nullable: true })
  address: Address | null;

  @ApiProperty({
    title: 'languages',
  })
  @Column({ type: 'varchar', default: 'ua' })
  language?: string | null;
}
