import server from '../src/server'
// @ts-ignore
import request from 'supertest'
import { Application } from 'express'

let app: Application

beforeAll(async () => {
  app = await server()
})

describe('GET /health', () => {
  test('should return 200', async () => {
    const response = await request(app).get('/health')
    expect(response.statusCode).toBe(200)
  })
})

describe('GET /foo', () => {
  test('should return 200', async () => {
    const response = await request(app).get('/foo')
    expect(response.statusCode).toBe(200)
    expect(response.body.bar).toEqual('hello world')
  })
})

describe('GET /', () => {
  test('should return 200', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
  })
})

describe('GET /{byu_Id}', () => {
  test('should return 200', async () => {
    const response = await request(app).get('/123456789')
    expect(response.statusCode).toBe(200)
  })
})
describe('POST /{byu_Id}', () => {
  test('should return 200', async () => {
    const payload = {
      favColor: 'red'
    }
    const response = await request(app).post('/123456789').send(payload)
    expect(response.statusCode).toBe(200)
  })
})

describe('PUT /{byu_Id}', () => {
  test('should return 200', async () => {
    const payload = {
      newFavColor: 'red'
    }
    const response = await request(app).put('/123456789').send(payload)
    expect(response.statusCode).toBe(200)
  })
})

describe('DELETE /{byu_Id}', () => {
  test('should return 200', async () => {
    const response = await request(app).delete('/123456789')
    expect(response.statusCode).toBe(200)
  })
})