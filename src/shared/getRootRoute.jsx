/**
 * Created by lerayne on 07.01.2018.
 */
"use strict"

import React from 'react'
import {IndexRoute, Route}  from 'react-router'

export default function getRootRoute(onEnter, onChange) {
    return <Route component={App} path='/' onEnter={onEnter} onChange={onChange}>
        <IndexRoute component={TransactionsPage}/>
        <Route path="login" component={LoginPage}/>
    </Route>
}