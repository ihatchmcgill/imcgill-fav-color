import { RouteControllerMap } from 'openapi-enforcer-middleware'
import { Request, Response } from 'express'
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { logger } from '../index'

export default function (dbClient: DynamoDBDocumentClient, tableName: string): RouteControllerMap {
  return {
    async getFavoriteColor (req: Request, res: Response) {
      const givenByuId = req.enforcer?.params.byuId
      try {
        const dbResponse = await dbClient.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              byuId: givenByuId
            }
          })
        )
        const item = dbResponse.Item
        if (item != null) {
          const favColorName = item.favColorName
          const favColorId = item.favColorId
            const name = item.name
          logger.info(favColorName)
          res.enforcer?.send({
            byuId: givenByuId,
            favColorName,
            favColorId,
              name
          })
        } else {
          res.enforcer?.status(404).send('Not Found')
        }
      } catch (e) {
        logger.error(e, 'Error: ')
        res.enforcer?.status(500).send('Error getting favorite colors')
      }
    },
    async updateFavoriteColor (req: Request, res: Response) {
      const givenByuId: string = req.enforcer?.params.byuId
      const givenFavColorName: string = req.enforcer?.body.newFavColorName
      const givenFavColorId: string = req.enforcer?.body.newFavColorId
      try {
        await dbClient.send(
          new UpdateCommand({
            TableName: tableName,
            Key: {
              byuId: givenByuId
            },
            UpdateExpression: 'SET favColorName = :favColorName',
            ExpressionAttributeValues: {
              ':favColorName': givenFavColorName
            }
          })
        )
        await dbClient.send(
          new UpdateCommand({
            TableName: tableName,
            Key: {
              byuId: givenByuId
            },
            UpdateExpression: 'SET favColorId = :favColorId',
            ExpressionAttributeValues: {
              ':favColorId': givenFavColorId
            }
          })
        )
        res.enforcer?.send(`Favorite Color For ${givenByuId} Updated To: ${givenFavColorName}`)
      } catch (e) {
        logger.error(e, 'Error: ')
        res.enforcer?.status(500).send('Error updating favorite color')
      }
    },
    async addFavoriteColor (req: Request, res: Response) {
      try {
        const givenByuId: string = req.enforcer?.params.byuId
        const givenFavColorId: string = req.enforcer?.body.favColorId
        const givenFavColorName: string = req.enforcer?.body.favColorName
          const studentName: string = req.enforcer?.body.name
        await dbClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              byuId: givenByuId,
                name: studentName,
              favColorName: givenFavColorName,
              favColorId: givenFavColorId
            }
          })
        )
        res.enforcer?.send(`Student ${givenByuId} Added With Favorite Color: ${givenFavColorName}`)
      } catch (e) {
        logger.error(e, 'Error: ')
        res.enforcer?.status(500).send('Error adding favorite color')
      }
    },
    async removeFavoriteColor (req: Request, res: Response) {
      const givenByuId: string = req.enforcer?.params.byuId
      try {
        await dbClient.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              byuId: givenByuId
            }
          })
        )
        res.enforcer?.send(`Favorite Color Removed For: ${givenByuId}`)
      } catch (e) {
        logger.error(e, 'Error: ')
        res.enforcer?.status(500).send('Error deleting favorite color')
      }
    }
  }
}
