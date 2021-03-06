/**
 * Created by lerayne on 22.03.17.
 */

import bcrypt from 'bcryptjs'
import url from 'url'

import {createAuthFuncs} from '../compose/auth'
import {
    authCookieName,
    loginPagePath,
    rootPath,
    keyExpiresIn
} from '../constants/defaultOptions'

console.log('authCookieName', authCookieName)

export default function createLoginEP(options) {

    const defaultOptions = {
        authCookieName,
        loginPagePath,
        rootPath,
        keyExpiresIn
    }

    const requiredOptions = [
        'jwtSecret',
        'domain',
        'getUser'
    ]

    const missingProp = requiredOptions.find(propName => options[propName] === undefined)

    if (missingProp) {
        throw new Error(`ERROR in createStaticGenerator: ${missingProp} not specified`)
    }

    options = {
        ...defaultOptions,
        ...options
    }

    //variable scoping
    {
        const {
            domain,
            authCookieName,
            jwtSecret,
            keyExpiresIn,
            loginPagePath,
            rootPath,
            getUser
        } = options

        const {checkUserAuth, grantAccess} = createAuthFuncs(
            domain,
            authCookieName,
            jwtSecret,
            keyExpiresIn
        )

        const redirectToFailure = function(req, res) {
            res.redirect(302, url.format({
                pathname: loginPagePath, query: {
                    next: req.body.nextUrl,
                    error: 1
                }
            }))
        }

        return async function login(req, res) {

            const {payload: currentUser} = await checkUserAuth(req)

            if (currentUser) {
                // Already logged in: redirect back
                res.redirect(302, req.body.nextUrl || '/')
            } else {

                const user = await getUser(req.body.email)

                if (!user) {
                    // No such user
                    redirectToFailure(req, res)
                } else {
                    //todo: "password_hash" change here too
                    const passwordCorrect = await bcrypt.compare(req.body.password, user.password_hash)

                    console.log('passwordCorrect', passwordCorrect)

                    if (!passwordCorrect) {
                        // Wrong password
                        redirectToFailure(req, res)
                    } else {
                        // User is successfully authed!
                        await grantAccess(req, res, user)
                        res.redirect(302, req.body.nextUrl || rootPath)
                    }
                }
            }
        }
    }
}