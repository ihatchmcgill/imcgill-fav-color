import server from './server'
import defaultLogger from '@byu-oit/logger'
import { Logger } from 'pino'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-west-2',
  endpoint: process.env.DYNAMODB_ENDPOINT
})
const dbDocClient = DynamoDBDocumentClient.from(client)

export const logger: Logger = defaultLogger()

async function run (): Promise<void> {
  const app = await server()
  const response = await dbDocClient.send(new ScanCommand({ TableName: 'imcgill-fav-color-dev' }))
  logger.info({ response }, 'DynamoDB response')

  app.listen(8080, () => {
    logger.info('listening on port 8080')
  }).on('error', err => {
    logger.error({ err }, 'Error starting the app')
  })
}

run()
  .then(r => {})
  .catch(err => logger.error({ err }, 'Error in running app'))
