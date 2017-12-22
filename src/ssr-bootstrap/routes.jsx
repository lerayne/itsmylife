/**
 * Created by lerayne on 07.01.17.
 */

import React from 'react'
import url from 'url'
import {IndexRoute, Route}  from 'react-router'
import App from './containers/App'
import TransactionsPage from './containers/TransactionsPage'
import CategoriesPage from './containers/CategoriesPage'
import LoginPage from './containers/LoginPage'
import StatsPage from './containers/StatsPage'

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
 * @param globalState
 * @param routerState
 * @param redirect
 * @returns {boolean}
 */
function redirectionsCheck(globalState, routerState, redirect){

    const {user} = globalState
    const {routes, location} = routerState
    let redirected = false

    routes.forEach(route => {
        const component = route.component.WrappedComponent || route.component

        if (component.loginRequired && user.id === -1) {
            redirected = true
            redirect(getRedirectUrl('/login', location))
        }

        if (component.anonymousRequired && user.id !== -1) {
            redirected = true
            // todo - подумать о том что случится, если будет переход на страницу "login"
            // не при помощи набора в адрессной строке (тогда будет простой редирект), а
            // при помощи инструментов router'а - видимо нужно перенаправить юзера откуда
            // пришел
            redirect(getRedirectUrl('/'))
        }
    })

    return redirected
}

/**
 * Handle initial server authorization redirects
 * @param store
 * @returns {Function}
 */
function onEnter(store){
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
function onChange(store){
    return function(prevRouterState, nextRouterState, redirect){
        if (process.env.BROWSER){
            // onChange is called under query change, we want to omit this
            if (prevRouterState.location.pathname !== nextRouterState.location.pathname){
                redirectionsCheck(store.getState(), nextRouterState, redirect)
            }
        }
    }
}

export default function RoutesComponent(store) {
    return <Route component={App} path='/' onEnter={onEnter(store)} onChange={onChange(store)}>
        <IndexRoute component={TransactionsPage}/>
        <Route path="categories" component={CategoriesPage}/>
        <Route path="stats" component={StatsPage}/>
        <Route path="login" component={LoginPage}/>
    </Route>
}