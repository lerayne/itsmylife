/**
 * Created by lerayne on 22.12.2017.
 */

import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import {generateStaticPage} from './ssr-bootstrap'
import getTemplate from './server/getTemplate'

import {domain} from 'config'

// создаем центральный апп
const app = express()

// стандартный модуль, для парсинга JSON в запросах
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

// раздаем статику
app.use('/public', express.static('public'))

app.get('/', generateStaticPage(getTemplate))

const PORT = process.env.LISTEN || 3001

//запускаем сервер
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})