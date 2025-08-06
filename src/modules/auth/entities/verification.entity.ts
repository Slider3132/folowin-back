import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { VerificationCodeType } from '../enums/verification-code-type.enum';

@Entity()
export class VerificationCode extends BaseEntity {
  @ApiProperty({
    title: 'verification code',
  })
  @Column()
  code: number;

  @ApiProperty({
    title: 'code type',
    enum: VerificationCodeType,
    example: VerificationCodeType.password,
  })
  @Column({
    type: 'enum',
    enum: VerificationCodeType,
  })
  type: VerificationCodeType;

  @ApiProperty({
    title: 'is used',
  })
  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @ApiProperty({
    title: 'expired date',
  })
  @Column({ name: 'expired_at', type: 'timestamp' })
  expiredAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
