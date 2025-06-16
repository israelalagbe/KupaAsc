import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostRepository {
  private readonly postRelations = ['author'] as FindOptionsRelations<Post>;
  private readonly postSelect = {
    author: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      updatedAt: true,
    },
  };

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: number): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId,
    });
    return await this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: this.postRelations,
      select: this.postSelect,
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: { id },
      relations: this.postRelations,
      select: this.postSelect,
    });
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { authorId },
      relations: this.postRelations,
      select: this.postSelect,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post | null> {
    await this.postRepository.update(id, updatePostDto);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.postRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByAuthorAndId(authorId: number, id: number): Promise<Post | null> {
    return await this.postRepository.findOne({
      where: { id, authorId },
      relations: this.postRelations,
      select: this.postSelect,
    });
  }
}
