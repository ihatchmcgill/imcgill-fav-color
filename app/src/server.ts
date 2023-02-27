import express, { Application, Request, Response } from 'express'
import OpenApiEnforcer from 'openapi-enforcer'
import EnforcerMiddleware from 'openapi-enforcer-middleware'
import path from 'path'
import { logger } from './index'
import { LoggerMiddleware } from '@byu-oit/express-logger'
import favColor from './routes/favColor'
import byuId from './routes/byuId'
import foo from './routes/foo'

import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

export default async function server (dbDocClient: DynamoDBDocumentClient | any, TABLE_NAME: string): Promise<Application> {
  const app = express()

  app.use('/', express.json())

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('healthy')
  })

  app.get('/test', (req: Request, res: Response) => {
    res.status(200).send('good job genius')
  })

  // Add express logs to all calls after
  app.use(LoggerMiddleware({
    logger
  }))

  // Enforcer Setup
  const apiSpec = path.resolve(__dirname, 'v1.yml')
  const enforcerMiddleware = EnforcerMiddleware(await OpenApiEnforcer(apiSpec))
  app.use(enforcerMiddleware.init())

  // Catch errors
  enforcerMiddleware.on('error', (err: Error) => {
    logger.error({ err }, 'Open API Enforcer error')
    process.exit(1)
  })

  // Tell the route builder to handle routing requests.
  app.use(enforcerMiddleware.route({
    foo: foo(),
    favColor: favColor(dbDocClient, TABLE_NAME),
    byuId: byuId(dbDocClient, TABLE_NAME)
  }))

  app.use(enforcerMiddleware.mock())
  return app
}
