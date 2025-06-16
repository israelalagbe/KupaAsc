import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { SignUpDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(signUpDto: SignUpDto, hashedPassword: string): Promise<User> {
    const user = this.userRepository.create({
      ...signUpDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async update(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }
}
