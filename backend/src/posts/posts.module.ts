import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostRepository } from './post.repository';
import { Post } from '../database/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
  exports: [PostsService],
})
export class PostsModule {}
