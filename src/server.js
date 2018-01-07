/**
 * Created by lerayne on 22.12.2017.
 */

import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import {createStaticGenerator} from './ssr-bootstrap'
import getTemplate from './server/getTemplate'
import reducers from './shared/reducers'
import getRootRoute from './shared/getRootRoute'

import {secretKey} from 'config'

//import {domain} from 'config'

// создаем центральный апп
const app = express()

// стандартный модуль, для парсинга JSON в запросах
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

// раздаем статику
app.use('/public', express.static('public'))

/**
 * this creates main html-generator function which abstracts all react-redux isomorphy.
 * Prerequisites:
 * 1) A reducer named "user" which has an id field. This id defaults to -1 if anonymous
 * 2) A route "/login" which leads to a login page
 * 3) "loginRequired" and "anonymousRequired" static props on containers which has to be
 *    redirected from if user is (not) logged in
 * 4) An "initialize" static function that takes dispatch and location as params and
 *    returns a single promise. This promise should resolve when store is already changed
 * 5) Auth is made through a cookie named "access_token"
 */
const generateStaticPage = createStaticGenerator({
    template: getTemplate,
    route: getRootRoute,
    jwtSecret: secretKey,
    reducers,
})

// main static page renderer
app.get('/', generateStaticPage)

// todo - get to know what is this for and make it work properly
// todo - not in server definitely!!
if (module.hot) {
    module.hot.accept('./shared/reducers', () =>
        //store.replaceReducer(require('./reducers/index').default)
        store.replaceReducer(require('./shared/reducers').default)
    )
}

const PORT = process.env.LISTEN || 3001

//запускаем сервер
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})