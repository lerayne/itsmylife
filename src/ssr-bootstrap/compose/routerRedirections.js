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
function getRedirectUrl(pathname, prevLocation = false) {
    const urlObject = {
        pathname: pathname,
        query: {}
    }

    if (prevLocation) {
        urlObject.query.next = prevLocation.pathname + prevLocation.search
    }

    return url.format(urlObject)
}

/**
 * @param isLoggedInFromState: Function
 * @param loginPagePath: String
 * @param rootPath: String
 * @returns {{getOnEnterFunc: function(getState): Function, getOnChangeFunc: function(getState): Function}}
 */
export function createRouterRedirectFuncs(isLoggedInFromState, loginPagePath, rootPath){
    /**
     * Check access to route container and redirect if not allowed
     * Iterates over all components looking for "loginRequired" or "anonymousRequired" static props.
     * redirects to "/login" or "/" if founds
     *
     * @param getState: Function
     * @param nextRouterState: Object
     * @param redirect: Function
     * @returns {boolean}
     */
    function redirectionCheck(getState, nextRouterState, redirect) {

        const {routes, location} = nextRouterState
        // todo: спросиить и подумать об использовании store.getState и передаче результата вместо самой функции
        // насколько имеет смысл вообще не передавать store в функции, а делать как в redux-thunk:
        // передавать только getState и dispatch
        const userLoggedIn = isLoggedInFromState(getState())
        let redirected = false

        routes.forEach(route => {
            const component = route.component.WrappedComponent || route.component

            if (component.loginRequired && !userLoggedIn) {
                redirected = true
                redirect(getRedirectUrl(loginPagePath, location))
            }

            if (component.anonymousRequired && userLoggedIn) {
                redirected = true
                // todo - подумать о том что случится, если будет переход на страницу "login"
                // не при помощи набора в адрессной строке (тогда будет простой редирект), а
                // при помощи инструментов router'а - видимо нужно перенаправить юзера откуда
                // пришел
                redirect(getRedirectUrl(rootPath))
            }
        })

        // return not used
        return redirected
    }

    /**
     * Handle initial server authorization redirects
     *
     * @param getState
     * @returns {Function}
     */
    function getOnEnterFunc(getState) {
        return function (nextRouterState, redirect) {
            if (!process.env.BROWSER) {
                redirectionCheck(getState, nextRouterState, redirect)
            }
        }
    }

    /**
     * Handle client authorization redirects
     *
     * @param getState
     * @returns {Function}
     */
    function getOnChangeFunc(getState) {
        return function (prevRouterState, nextRouterState, redirect) {
            if (process.env.BROWSER) {
                // onChange is called also on url.query change, we want to omit this
                if (prevRouterState.location.pathname !== nextRouterState.location.pathname) {
                    redirectionCheck(getState, nextRouterState, redirect)
                }
            }
        }
    }

    return {
        getOnEnterFunc,
        getOnChangeFunc
    }
}