/**
 * Created by lerayne on 22.03.17.
 */

import jwt from 'jsonwebtoken'

export default function checkUserAuth(req){
    return new Promise((resolve, reject) => {

        if (!req.cookies.access_token) {
            resolve(false)
        } else {
            jwt.verify(req.cookies.access_token, secretKey, (err, decoded) => {
                if (err) {
                    resolve(false)
                } else {
                    resolve(decoded)
                }
            })
        }
    })
}
