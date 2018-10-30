import {
    authCookieName,
    loginPagePath
} from '../constants/defaultOptions'

export default function createLogoutEP(options){

    const defaultOptions = {
        authCookieName,
        loginPagePath
    }

    options = {
        ...defaultOptions,
        ...options
    }

    //variable scoping
    {
        const {
            authCookieName,
            loginPagePath
        } = options

        return function logout(req, res) {
            res.clearCookie(authCookieName)
            res.redirect(302, loginPagePath)
        }
    }
}