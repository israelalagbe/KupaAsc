import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Body(ValidationPipe) createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.create(createPostDto, user.id);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('my-posts')
  findMyPosts(@CurrentUser() user: User) {
    return this.postsService.findByAuthor(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updatePostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, updatePostDto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.postsService.remove(id, user.id);
  }
}
