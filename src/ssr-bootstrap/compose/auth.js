import jwt from 'jsonwebtoken'
import ms from 'ms'

export function createAuthFuncs(domain, authCookieName, jwtSecret, keyExpiresIn) {

    /**
     * Checks named cookie against jwt secret key
     *
     * @param req
     * @returns {Promise<any>}
     */
    function checkUserAuth(req) {
        return new Promise(resolve => {
            if (!req.cookies[authCookieName]) {
                resolve(false)
            } else {
                jwt.verify(req.cookies[authCookieName], jwtSecret, (err, decoded) =>
                    resolve(err ? false : decoded)
                )
            }
        })
    }

    /**
     * creates new token based on any payload
     *
     * @param payload
     * @param optionsOverride
     * @returns {Promise<any>}
     */
    function createToken(payload, optionsOverride = {}) {
        const options = {
            expiresIn: keyExpiresIn,
            ...optionsOverride
        }

        return new Promise((resolve, reject) => {
            jwt.sign({payload}, jwtSecret, options, (err, token) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(token)
                }
            })
        })
    }

    async function grantAccess(req, res, insecureUser) {

        try {
            // removing password hash
            //todo - move "password_hash" to config, as it's DB field name
            const {password_hash, ...rest} = insecureUser

            // todo - check ip
            const user = {
                ...rest,
                ip: '0.0.0.0' // current IP should be here
            }

            // todo - get domain from env (doesn't work now on prod)
            // const host = req.get('host')
            // const hostname = host.split(':')[0]

            const token = await createToken(user)

            res.cookie(authCookieName, token, {
                path: '/',
                domain,
                maxAge: ms(keyExpiresIn)
            })
        } catch (error) {
            console.error('grantAccess:', error)
        }
    }

    return {
        checkUserAuth,
        grantAccess
    }
}