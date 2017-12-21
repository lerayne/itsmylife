/**
 * Created by lerayne on 22.12.2017.
 */
"use strict"

import {staticResourcesUrl} from 'config'

const DEV = process.env.NODE_ENV === 'development'
const assetUrl = DEV ? '//localhost:8050/public/' : staticResourcesUrl

export default function getTemplate(dynamicHTML, initialState){
    return `
    <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tinng web client</title>
        <link rel="stylesheet" href="${assetUrl}styles.css">
        <script src="${assetUrl}client-config.js"></script>
        <script>
          window.REDUX_INITIAL_STATE = ${JSON.stringify(initialState)}
        </script>
      </head>
      <body>
        <div id="react-view">${dynamicHTML}</div>
        <div id="dev-tools"></div>
        <script type="application/javascript" src="${assetUrl}client.js"></script>
      </body>
    </html>
    `
}