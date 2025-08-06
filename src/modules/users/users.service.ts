import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async find(id: string, me: boolean = false): Promise<User | User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['stripe'],
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (me) {
      return user;
    }

    return user;
  }

  async update(id: string, dto: UserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['conversations'],
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    await this.usersRepository.update({ id }, { ...dto });

    return this.usersRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    await this.usersRepository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    await this.usersRepository.restore(id);
  }
}
