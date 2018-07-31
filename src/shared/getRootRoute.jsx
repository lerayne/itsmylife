/**
 * Created by lerayne on 07.01.2018.
 */
"use strict"

import React from 'react'
import {IndexRoute, Route}  from 'react-router'

import ApplicationRoot from './containers/ApplicationRoot'
import LoginPage from '../shared/containers/LoginPage'
import MainPage from '../shared/containers/MainPage'

export default function getRootRoute(onEnter, onChange) {
    return <Route component={ApplicationRoot} path='/' onEnter={onEnter} onChange={onChange}>
        <IndexRoute component={MainPage} />
        <Route path="login" component={LoginPage}/>
    </Route>
}