/**
 * Created by lerayne on 22.12.2017.
 */
"use strict"

import React from 'react'
import {renderToNodeStream} from 'react-dom/server'

export default function generateStaticPage(getTemplate){

    function generate(req, res) {
        streamPageHTML(res, {}, <div>
            <h1>Test</h1>
        </div>)
    }

    function streamPageHTML(res, initialState, reactNode){
        const html = getTemplate('{react-root}', initialState).split('{react-root}')

        res.write(html[0])

        const stream = renderToNodeStream(reactNode)
        stream.pipe(res, {end: false})

        stream.on('end', () => {
            res.write(html[1])
            res.end()
        })
    }

    return generate
}