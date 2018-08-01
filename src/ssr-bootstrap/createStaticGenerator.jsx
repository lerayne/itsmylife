/**
 * Created by lerayne on 22.12.2017.
 */
"use strict"

import {match, RouterContext} from 'react-router'
import {Provider} from 'react-redux'
import React from 'react'
import {renderToNodeStream} from 'react-dom/server'
import {createRouterRedirectFuncs} from './routerRedirections'
import checkUserAuth from './login/checkUserAuth'
import grantAccess from './login/grantAccess'

import configureStore from './configureStore'
import getTemplate from "../server/getTemplate";
import getRootRoute from "../shared/getRootRoute";

export default function createStaticGenerator(options){

    /* object configuration */

    const defaultOptions = {
        authCookieName: "access_token",
        loginPagePath: "/login",
        rootPath: '/',

        setUserState: function(userCookieObject){
            return {
                type: 'SET_USER',
                payload: userCookieObject
            }
        },

        isLoggedInFromState: function(state){
            return state.user.id !== -1
        }
    }

    const requiredOptions = [
        'getTemplate',
        'getRootRoute',
        'reducers',
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
        getTemplate,
        getRootRoute,
        reducers,
        jwtSecret,
        setUserState,
        isLoggedInFromState,
        authCookieName, //todo - not honored yet
        loginPagePath,
        rootPath
    } = options

    /**
     * return static page as a stream (allows gradual load as the page renders)
     * @param res - express resource
     * @param initialState
     * @param reactNode
     */
    function streamHTML(res, initialState, reactNode){
        const [headHTML, tailHTML] = getTemplate('{react-root}', initialState).split('{react-root}')

        res.write(headHTML)

        const stream = renderToNodeStream(reactNode)

        stream.pipe(res, {end: false})

        stream.on('end', () => {
            res.write(tailHTML)
            res.end()
        })
    }

    //get
    const {getOnEnterFunc, getOnChangeFunc} = createRouterRedirectFuncs(
        isLoggedInFromState,
        loginPagePath,
        rootPath
    )

    /**
     * Actual handler of express get routing
     *
     * @param req - express request
     * @param res - espress response
     */
    async function generateStaticPage(req, res) {

        //create redux store
        const store = configureStore({}, reducers)

        // get current user's authentication cookie status (false | jwt.verify object)
        // Attention! Only the essential user info should be stored in a JWT cookie!
        const {payload: currentUser} = await checkUserAuth(req, jwtSecret)

        if (currentUser) {
            store.dispatch(setUserState(currentUser))

            // reauthorize user
            // todo - only reauthorize near expiration (performance). Now reauthorizing each time
            await grantAccess(req, res, currentUser)
        }

        match({
            location: req.url,
            routes: getRootRoute(
                getOnEnterFunc(store.getState),
                getOnChangeFunc(store.getState)
            )
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
                const component = route.component.WrappedComponent || route.component
                if (component.initialize){
                    return arr.concat([component.initialize(store.dispatch, renderProps.location)])
                } else return arr
            }, [])

            // todo - proper error handling
            if (promises.length) {
                await Promise.all(promises)
            }

            streamHTML(res, store.getState(),
                <Provider store={store}>
                    <RouterContext {...renderProps} />
                </Provider>
            )
        })
    }

    return generateStaticPage
}