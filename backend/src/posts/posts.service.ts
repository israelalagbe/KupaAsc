import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from '../database/entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(createPostDto: CreatePostDto, authorId: number): Promise<Post> {
    return await this.postRepository.create(createPostDto, authorId);
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.findAll();
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return await this.postRepository.findByAuthor(authorId);
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user owns the post
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.postRepository.update(id, updatePostDto);
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found after update`);
    }

    return updatedPost;
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user owns the post
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    const deleted = await this.postRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Post with ID ${id} could not be deleted`);
    }
  }
}
