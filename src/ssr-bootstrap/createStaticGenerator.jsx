/**
 * Created by lerayne on 22.12.2017.
 */
"use strict"

import {match, RouterContext} from 'react-router'
import {Provider} from 'react-redux'
import React from 'react'
import {renderToNodeStream} from 'react-dom/server'
import {getOnChangeFunc, getOnEnterFunc} from './routerRedirections'
import checkUserAuth from './login/checkUserAuth'
import grantAccess from './login/grantAccess'

import configureStore from './configureStore'

export default function createStaticGenerator(options){

    const defaultOptions = {
        authCookieName: "access_token",
        loginPagePath: "/login",
    }

    const requiredOptions = [
        'template',
        'reducers',
        'route',
        'jwtSecret'
    ]

    const missingProp = requiredOptions.find(propName => options[propName] === undefined)

    if (missingProp) {
        throw new Error(`ERROR in createStaticGenerator: ${missingProp} not specified`)
    }

    options = {
        ...defaultOptions,
        ...options
    }

    const {
        template: getTemplate,
        route: getRootRoute,
        reducers,
        jwtSecret,
        authCookieName, //todo - not honored yet
        loginPagePath //todo - not honored yet
    } = options

    /**
     * return static page as a stream (allows gradual load as the page renders)
     * @param res
     * @param initialState
     * @param reactNode
     */
    function streamHTML(res, initialState, reactNode){
        const html = getTemplate('{react-root}', initialState).split('{react-root}')

        res.write(html[0])

        const stream = renderToNodeStream(reactNode)
        stream.pipe(res, {end: false})

        stream.on('end', () => {
            res.write(html[1])
            res.end()
        })
    }

    /**
     * this is actually the handler for express'es client request
     *
     * @param req
     * @param res
     */
    async function generateStaticPage(req, res) {

        const store = configureStore({}, reducers)

        // todo - simple: important user info is just stored in the cookie. Maybe change to DB query
        const {payload: currentUser} = await checkUserAuth(req, jwtSecret)

        if (currentUser) {
            store.dispatch({
                type: 'SET_USER',
                payload: currentUser
            })

            // todo - only reauthorize near expiration (performance)
            // todo - check ip

            // sliding - now only on static page render
            await grantAccess(req, res, currentUser)
        }

        match({
            routes: getRootRoute(getOnEnterFunc(store), getOnChangeFunc(store)),
            location: req.url
        }, async (error, redirectLocation, renderProps) => {

            if (redirectLocation) { // Если необходимо сделать redirect
                return res.redirect(302, redirectLocation.pathname + redirectLocation.search)
            }

            if (error) { // Произошла ошибка любого рода
                return res.status(500).send(error.message)
            }

            if (!renderProps) { // Мы не определили путь, который бы подошел для URL
                return res.status(404).send('Not found')
            }

            // seeks for "initialize" static function that returns a promise
            const promises = renderProps.routes.reduce((arr, route) => {
                const comp = route.component.WrappedComponent || route.component
                if (comp.initialize){
                    return arr.concat([comp.initialize(store.dispatch, renderProps.location)])
                } else return arr
            }, [])

            if (promises.length) {
                await Promise.all(promises)
            }

            streamHTML(
                res,
                store.getState(),

                <Provider store={store}>
                    <RouterContext {...renderProps} />
                </Provider>
            )
        })
    }

    return generateStaticPage
}