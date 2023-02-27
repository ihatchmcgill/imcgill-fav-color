import server from '../src/server'
// @ts-expect-error
import request from 'supertest'
import { Application } from 'express'
import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = 'imcgill-fav-color-dev'
const ddbMock = mockClient(DynamoDBDocumentClient)

ddbMock.on(ScanCommand).resolves({
  Items: [
    { byuId: '123456789', favColor: 'mockColor' }
  ]
})

ddbMock.on(GetCommand).resolves({
  Item: { byuId: '123456789', favColor: 'mockColor' }
})

ddbMock.on(PutCommand).resolves({})
ddbMock.on(UpdateCommand).resolves({})
ddbMock.on(DeleteCommand).resolves({})

let app: Application

beforeAll(async () => {
  // ddbMock.reset() doesn't work?
  app = await server(ddbMock, TABLE_NAME)
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
  test('No filters should return 200 w/ mock data', async () => {
    const response = await request(app).get('/')
    expect(response.statusCode).toBe(200)
    const body = response.body[0]
    expect(body.byuId).toEqual('123456789')
    expect(body.favColor).toEqual('mockColor')
  })

  test('filter = red should return 200', async () => {
    const response = await request(app).get('/?filter=red')
    expect(response.statusCode).toBe(200)
  })
})

describe('GET /{byu_Id}', () => {
  test('should return 200', async () => {
    const response = await request(app).get('/123456789')
    expect(response.statusCode).toBe(200)
    expect(response.body.favColor).toEqual('mockColor')
  })
  test(' malformed byuId should return 400', async () => {
    const response = await request(app).get('/asfdaga32')
    expect(response.statusCode).toBe(400)
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
