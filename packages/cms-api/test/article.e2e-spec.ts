import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FormExceptionKey } from 'cms-admin/src/utils/form.util'
import { AppController } from 'src/app/app.controller'
import { validationPipe } from 'src/pipes'
import { ArticleModule } from 'src/article/article.module'
import { CreateArticleDto } from 'src/article/dto/createArticle.dto'
import { AuthModule } from 'src/auth/auth.module'
import { UserModule } from 'src/user/user.module'
import * as request from 'supertest'
import { getToken, mockDate } from 'test/testUtils'
import ormConfig from './orm-config'

describe('Article Module Integration', () => {
  let app: INestApplication
  let token: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        ArticleModule,
        AuthModule,
        UserModule,
      ],
      controllers: [AppController],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(validationPipe)
    await app.init()

    token = await getToken(app)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('/article (POST)', () => {
    it('should return 201 when create article given an valid form', async () => {
      const restoreMockDate = mockDate('2017-11-25T12:34:56Z')

      const requestBody: CreateArticleDto = {
        title: 'title',
        content: '<p>I am content</p>',
      }
      const response = await request(app.getHttpServer())
        .post('/article')
        .auth(token, { type: 'bearer' })
        .send(requestBody)

      restoreMockDate()

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        id: 1,
        title: 'title',
        content: '<p>I am content</p>',
        createdAt: '2017-11-25T12:34:56.000Z',
        updatedAt: '2017-11-25T12:34:56.000Z',
        user: expect.objectContaining({
          id: 1,
          username: 'admin',
        }),
      })
    })

    it('should return 401 when create article with invalid token', async () => {
      const requestBody: CreateArticleDto = {
        title: 'title',
        content: '<p>I am content</p>',
      }

      const response = await request(app.getHttpServer())
        .post('/article')
        .send(requestBody)

      expect(response.status).toBe(401)
    })

    it('should return 422 when create article given an invalid form', async () => {
      const requestBody: CreateArticleDto = {
        content: '<p>I am content</p>',
      } as any

      const response = await request(app.getHttpServer())
        .post('/article')
        .auth(token, { type: 'bearer' })
        .send(requestBody)

      expect(response.status).toBe(422)
      expect(response.body).toHaveProperty('title', ['isNotEmpty'] as FormExceptionKey[])
    })
  })

  describe('/article (GET)', () => {
    it('should return 200 when retrieve articles', async () => {
      const response = await request(app.getHttpServer())
        .get('/article')

      expect(response.status).toBe(200)
      expect(response.body.meta).toEqual({
        total: 1,
        limit: 10,
        totalPages: 1,
        currentPage: 1,
      })
      expect(response.body.items).toHaveLength(1)
      expect(response.body.items[0]).toEqual(expect.objectContaining({
        id: 1,
        title: 'title',
        content: '<p>I am content</p>',
        user: expect.objectContaining({
          id: 1,
          username: 'admin',
          email: 'admin@cms.com',
        }),
      }))
    })
  })
})
