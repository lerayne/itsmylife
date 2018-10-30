const defaultOptions = {
    //auth
    authCookieName: "access_token",
    loginPagePath: "/login",
    rootPath: "/",
    keyExpiresIn: "30 days",

    //auth action creator to put user in state
    setUserState: userCookieObject => ({
        type: 'SET_USER',
        payload: userCookieObject
    }),

    //auth getting status from state
    isLoggedInFromState: state => state.user.id !== -1
}

export default defaultOptions

module.exports = defaultOptions
