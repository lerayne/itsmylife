/**
 * Created by lerayne on 09.05.17.
 */

import {applyMiddleware, createStore, compose, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import promiseMiddleware from './promiseMiddleware'

export default function configureStore(initialState = {}, reducers) {

    // apply middlewares
    let middlewares = applyMiddleware(thunk, promiseMiddleware)

    // apply devtools
    if (process.env.NODE_ENV === 'development' && process.env.BROWSER){

        const DevTools = require('../client/DevTools/index').default

        middlewares = compose(
            middlewares,
            DevTools.instrument()
        )
    }

    // creates store from root reducer, initial state and middlewares
    return createStore(combineReducers(reducers), initialState, middlewares)
}