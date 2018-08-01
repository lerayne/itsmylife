/**
 * Created by lerayne on 07.01.17.
 */
"use strict"

import url from 'url'

/**
 * Creates new URL with previous location in query param "next"
 *
 * @param pathname: String
 * @param prevLocation: Object (URL)
 * @returns String URL
 */
function getRedirectUrl(pathname, prevLocation = false){
    const urlObject = {
        pathname: pathname,
        query: {}
    }

    if (prevLocation){
        urlObject.query.next = prevLocation.pathname + prevLocation.search
    }

    return url.format(urlObject)
}

/**
 * Check access to route container and redirect if not allowed
 * Iterates over all components looking for "loginRequired" or "anonymousRequired" static props.
 * redirects to "/login" or "/" if founds
 *
 * @param globalState
 * @param nextRouterState
 * @param redirect
 * @returns {boolean}
 */
function redirectionsCheck(globalState, nextRouterState, redirect){

    let redirected = false

    const {routes, location} = nextRouterState
    const userId = (globalState.user && globalState.user.id) ? globalState.user.id : -1

    routes.forEach(route => {
        const component = route.component.WrappedComponent || route.component

        if (component.loginRequired && userId === -1) {
            redirected = true
            redirect(getRedirectUrl('/login', location))
        }

        if (component.anonymousRequired && userId !== -1) {
            redirected = true
            // todo - подумать о том что случится, если будет переход на страницу "login"
            // не при помощи набора в адрессной строке (тогда будет простой редирект), а
            // при помощи инструментов router'а - видимо нужно перенаправить юзера откуда
            // пришел
            redirect(getRedirectUrl('/'))
        }
    })

    // return not used
    return redirected
}

/**
 * Handle initial server authorization redirects
 * @param store
 * @returns {Function}
 */
function getOnEnterFunc(store){
    return function (nextRouterState, redirect){
        if (!process.env.BROWSER){
            redirectionsCheck(store.getState(), nextRouterState, redirect)
        }
    }
}

/**
 * Handle client authorization redirects
 * @param store
 * @returns {Function}
 */
function getOnChangeFunc(store){
    return function(prevRouterState, nextRouterState, redirect){
        if (process.env.BROWSER){
            // onChange is called also on url.query change, we want to omit this
            if (prevRouterState.location.pathname !== nextRouterState.location.pathname){
                redirectionsCheck(store.getState(), nextRouterState, redirect)
            }
        }
    }
}

export {
    getOnEnterFunc,
    getOnChangeFunc
}