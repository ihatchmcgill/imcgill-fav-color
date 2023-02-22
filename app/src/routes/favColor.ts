import { RouteControllerMap } from 'openapi-enforcer-middleware'
import { Request, Response } from 'express'

export default function (): RouteControllerMap {
    return {
        async listFavoriteColors(req: Request, res: Response) {
            res.enforcer?.send(
                 [
                        {
                            'byuId': '123456789',
                            'favColor': 'red'
                        },
                        {
                            'byuId': '987654321',
                            'favColor': 'blue'
                        }
                    ]
            )
        }
    }
}

