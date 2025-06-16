import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { PostsModule } from '../src/posts/posts.module';
import { User } from '../src/database/entities/user.entity';
import { Post } from '../src/database/entities/post.entity';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('API Integration Tests (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;
  let postId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Post],
          synchronize: true,
          dropSchema: true,
        }),
        AuthModule,
        PostsModule,
      ],
      providers: [
        {
          provide: 'APP_FILTER',
          useClass: AllExceptionsFilter,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/signup', () => {
      it('should register a new user successfully', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .send({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.email).toBe('test@example.com');
            authToken = res.body.access_token as string;
            userId = res.body.user.id as number;
          });
      });

      it('should fail with duplicate email', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .send({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
          })
          .expect(409);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login successfully with valid credentials', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('user');
          });
      });

      it('should fail with invalid credentials', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });
  });

  describe('Posts Endpoints', () => {
    describe('POST /api/posts', () => {
      it('should create a new post successfully', () => {
        return request(app.getHttpServer())
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Post',
            content: 'This is a test post content',
            published: true,
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('Test Post');
            expect(res.body.authorId).toBe(userId);
            postId = res.body.id as number;
          });
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .post('/api/posts')
          .send({
            title: 'Test Post',
            content: 'This is a test post content',
            published: true,
          })
          .expect(401);
      });
    });

    describe('GET /api/posts', () => {
      it('should get all posts successfully', () => {
        return request(app.getHttpServer())
          .get('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          });
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .get('/api/posts')
          .expect(401);
      });
    });

    describe('GET /api/posts/my-posts', () => {
      it('should get user posts successfully', () => {
        return request(app.getHttpServer())
          .get('/api/posts/my-posts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            if (res.body.length > 0) {
              res.body.forEach((post: any) => {
                expect(post.authorId).toBe(userId);
              });
            }
          });
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .get('/api/posts/my-posts')
          .expect(401);
      });
    });

    describe('GET /api/posts/:id', () => {
      it('should get specific post successfully', () => {
        return request(app.getHttpServer())
          .get(`/api/posts/${postId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toBe(postId);
            expect(res.body).toHaveProperty('title');
          });
      });

      it('should fail with non-existent post ID', () => {
        return request(app.getHttpServer())
          .get('/api/posts/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('PATCH /api/posts/:id', () => {
      it('should update own post successfully', () => {
        return request(app.getHttpServer())
          .patch(`/api/posts/${postId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Updated Test Post',
            published: false,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.title).toBe('Updated Test Post');
            expect(res.body.published).toBe(false);
          });
      });

      it('should fail with non-existent post ID', () => {
        return request(app.getHttpServer())
          .patch('/api/posts/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Updated Test Post',
          })
          .expect(404);
      });
    });

    describe('DELETE /api/posts/:id', () => {
      it('should fail with non-existent post ID', () => {
        return request(app.getHttpServer())
          .delete('/api/posts/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should delete own post successfully', () => {
        return request(app.getHttpServer())
          .delete(`/api/posts/${postId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });
    });
  });
});
