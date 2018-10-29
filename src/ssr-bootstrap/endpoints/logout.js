export default function createLogoutEP(options){

    const defaultOptions = {
        authCookieName: "access_token",
        loginPagePath: "/login"
    }

    options = {
        ...defaultOptions,
        ...options
    }

    const {authCookieName, loginPagePath} = options

    return function logout(req, res){
        res.clearCookie(authCookieName)
        res.redirect(302, loginPagePath)
    }
}