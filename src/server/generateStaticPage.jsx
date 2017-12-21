/**
 * Created by lerayne on 22.12.2017.
 */
"use strict"


import React from 'react'
import {renderToNodeStream, renderToString} from 'react-dom/server'
import {match, RouterContext} from 'react-router'
import {Provider} from 'react-redux'

import getTemplate from './getTemplate'

/**
 * On http request does all necessary data manipulations and sends back HTML page. This includes:
 * redux store configuration, authentication check, server-side API calls
 */
export default async function generateStaticPage(req, res){

    pipePageHTML(res, {}, <div>
        <h1>Test</h1>
    </div>)
}

function pipePageHTML(res, initialState, reactNode) {

    const html = getTemplate('{react-root}', initialState).split('{react-root}')

    res.write(html[0])

    const stream = renderToNodeStream(reactNode)
    stream.pipe(res, { end: false })

    stream.on('end', () => {
        res.write(html[1])
        res.end()
    })
}