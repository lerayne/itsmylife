/**
 * Created by lerayne on 22.12.2017.
 */

import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import {
    createStaticGenerator,
    createLoginEP,
    createLogoutEP
} from './ssr-bootstrap/server'

import getTemplate from './server/getTemplate'
import getUserAuth from './server/api/getUserAuth'
import reducers from './shared/reducers'
import getRootRoute from './shared/getRootRoute'

import {
    secretKey,
    keyExpiresIn,
    domain
} from 'config'

// создаем центральный апп
const app = express()

// стандартный модуль, для парсинга JSON в запросах
app.use(bodyParser.json())

/**
 * стандартный модуль для парсинга поля body в POST-запросах. extended:false означает что в
 * возвращаемом объекте value может быть только string или array
 */
app.use(bodyParser.urlencoded({extended:false}))

// стандартный модуль для парсинга cookies
app.use(cookieParser())

/**
 * раздаем статику - это объявление значит что сначала сервер смотрит не соответствует ли запрос
 * паттерну GET /public... а потом уже - всем остальным объявленным паттернам. Таким образом статика
 * будет всегда раздаваться, даже если все остальные URL хендлятся одним единственным парсером
 */
app.use('/public', express.static('public'))

/**
 * обработчик POST-запроса на логин. createLoginEP (create login endpoint) возвращает функцию,
 * которую ждет стандартный хендлер express
 */
app.post('/login', createLoginEP({
    jwtSecret: secretKey,
    keyExpiresIn,
    domain,
    /**
     * @param email
     * @returns {Promise<Object{password_hash}>}
     */
    getUser: async function(email){
        return await getUserAuth(email)
    },

    //unchanged defaults
    authCookieName: "access_token",
    loginPagePath: "/login",
}))

app.get('/logout', createLogoutEP({
    authCookieName: "access_token",
    loginPagePath: "/login"
}))

/**
 * this creates main html-generator function which abstracts all react-redux isomorphy.
 * Prerequisites:
 * 1) "loginRequired" and "anonymousRequired" static props in containers which has to be
 *    redirected from, if user is (not) logged in
 * 2) An "initialize" static function in containers that need data. Takes dispatch and location as
 *    params and returns a single promise. This promise should resolve when store is already changed
 * 3) process.env.BROWSER is defined
 */
const generateStaticPage = createStaticGenerator({

    //required fields
    getTemplate,
    getRootRoute,
    jwtSecret: secretKey,
    reducers,
    domain,

    //fields with default values, which are changed here
    keyExpiresIn,

    //fields with default values, can be omitted. Left here for visibility
    loginPagePath: "/login",

    /**
     * An action creator that fires when user is successfully passed the cookie authentication
     * @param userCookieObject
     * @returns {{type: string, payload: *}}
     */
    setUserState: userCookieObject => ({
        type: 'SET_USER',
        payload: userCookieObject
    }),

    /**
     * Used to get user authentication state in router.
     * @param state
     * @returns {boolean}
     */
    isLoggedInFromState: state => state.user.id !== -1,

    authCookieName: 'access_token',
})

// main static page renderer
app.get('/*', generateStaticPage)

// todo - get to know what is this for and make it work properly
// todo - not in server definitely!!
/*if (module.hot) {
    module.hot.accept('./shared/reducers', () =>
        //store.replaceReducer(require('./reducers/index').default)
        store.replaceReducer(require('./shared/reducers').default)
    )
}*/

const PORT = process.env.LISTEN || 3001

console.log('node', Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]')

//запускаем сервер
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})