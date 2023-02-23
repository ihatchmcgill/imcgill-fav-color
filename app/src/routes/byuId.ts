import { RouteControllerMap } from 'openapi-enforcer-middleware'
import { Request, Response } from 'express'

export default function (): RouteControllerMap {
  return {
    async getFavoriteColor (req: Request, res: Response) {
      const givenByuId = req.enforcer?.params.byuId
      res.enforcer?.send({
        byuId: givenByuId,
        favColor: 'some favorite color'
      })
    },
    async updateFavoriteColor (req: Request, res: Response) {
      const givenByuId: string = req.enforcer?.params.byuId
      const givenFavColor: string = req.enforcer?.body.newFavColor
      res.enforcer?.send(`Favorite Color For ${givenByuId} Updated To: ${givenFavColor}`)
    },
    async addFavoriteColor (req: Request, res: Response) {
      const givenByuId: string = req.enforcer?.params.byuId
      const givenFavColor: string = req.enforcer?.body.favColor
      res.enforcer?.send(
       `Student  ${givenByuId} Added With Favorite Color: ${givenFavColor}`)
    },
    async removeFavoriteColor (req: Request, res: Response) {
      const givenByuId: string = req.enforcer?.params.byuId
      res.enforcer?.send(`Favorite Color Removed For: ${givenByuId}`)
    }
  }
}
