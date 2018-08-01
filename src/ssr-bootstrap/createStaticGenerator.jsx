/**
 * Created by lerayne on 22.12.2017.
 */
"use strict"

import {match, RouterContext} from 'react-router'
import {Provider} from 'react-redux'
import React from 'react'
import {renderToNodeStream} from 'react-dom/server'

import {createRouterRedirectFuncs} from './compose/routerRedirections'
import {createAuthFuncs} from './compose/auth'
import configureStore from './redux/configureStore'

export default function createStaticGenerator(options){

    /* object configuration */

    const defaultOptions = {
        authCookieName: "access_token",
        loginPagePath: "/login",
        rootPath: "/",
        keyExpiresIn: "30 days",

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
        'jwtSecret',
        'domain'
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
        authCookieName,
        loginPagePath,
        rootPath,
        keyExpiresIn,
        domain,
    } = options

    /**
     * return static page as a stream (allows gradual load as the page renders)
     * @param res - express resource
     * @param getState
     * @param reactNode
     */
    function streamHTML(res, getState, reactNode){
        const [headHTML, tailHTML] = getTemplate('{react-root}', getState()).split('{react-root}')

        res.write(headHTML)

        const stream = renderToNodeStream(reactNode)

        stream.pipe(res, {end: false})

        stream.on('end', () => {
            res.write(tailHTML)
            res.end()
        })
    }

    //get functions for handling redirections by react-router
    const {getOnEnterFunc, getOnChangeFunc} = createRouterRedirectFuncs(
        isLoggedInFromState,
        loginPagePath,
        rootPath
    )

    const {checkUserAuth, grantAccess} = createAuthFuncs(
        domain,
        authCookieName,
        jwtSecret,
        keyExpiresIn,
    )

    /**
     * Actual handler of express get routing
     *
     * @param req - express request
     * @param res - espress response
     */
    return async function generateStaticPage(req, res) {

        //create redux store
        const store = configureStore({}, reducers)

        // get current user's authentication cookie status (false | jwt.verify object)
        // Attention! Only the essential user info should be stored in a JWT cookie!
        const {payload: currentUser} = await checkUserAuth(req)

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

            if (redirectLocation) { // Redirect required
                return res.redirect(302, redirectLocation.pathname + redirectLocation.search)
            }

            if (error) { // Any error occurs
                return res.status(500).send(error.message)
            }

            if (!renderProps) { // Router does not recognize path
                return res.status(404).send('Not found')
            }

            // seeks for "initialize" static function that returns a promise
            const promises = []

            renderProps.routes.forEach(route => {
                const component = route.component.WrappedComponent || route.component
                if (component.initialize){
                    promises.push(component.initialize(store.dispatch, renderProps.location))
                }
            })

            // todo - proper error handling with try-catch
            if (promises.length) {
                // each promise resolves only after it make all necessary changes to store
                await Promise.all(promises)
            }

            streamHTML(res, store.getState,
                <Provider store={store}>
                    <RouterContext {...renderProps} />
                </Provider>
            )
        })
    }
}