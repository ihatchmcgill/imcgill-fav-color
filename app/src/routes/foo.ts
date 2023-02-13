import { RouteControllerMap } from 'openapi-enforcer-middleware'
import { Request, Response } from 'express'

export default function (): RouteControllerMap {
  return {
    async getFoo (req: Request, res: Response) {
      res.enforcer?.send({
        bar: 'hello world'
      })
    }
  }
}
