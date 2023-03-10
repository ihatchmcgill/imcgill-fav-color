import { RouteControllerMap } from 'openapi-enforcer-middleware'
import { Request, Response } from 'express'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { logger } from '../index'

export default function (dbClient: DynamoDBDocumentClient, tableName: string): RouteControllerMap {
  return {
    async listFavoriteColors (req: Request, res: Response) {
      try {
        const filterColor = req.query.filter
        const dbResponse = await dbClient.send(
          new ScanCommand({ TableName: tableName })
        )
        let colors = dbResponse.Items
        if (colors !== undefined) {
          // filter
          if (filterColor !== undefined) {
            const filterList = (filterColor as string).split(',')
            colors = colors.filter(item => filterList.includes(item.favColorName.toLowerCase()))
          }
          res.enforcer?.status(200).send(colors)
        } else {
          res.enforcer?.status(404).send('No colors found')
        }
      } catch (e) {
        logger.error(e, 'Error: ')
        res.enforcer?.status(500).send('Error listing all favorite colors')
      }
    }
  }
}
