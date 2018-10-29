/**
 * Created by lerayne on 09.01.17.
 */

import mysql from 'mysql'
import {dbConfig} from 'config'

const db = mysql.createConnection(dbConfig)

db.connect(err => {
    if (err) {
        console.error('Database connection error')
        return null
    }

    console.log('Database connected as', db.threadId)
})

export default db

export function query(query, data=false){
    return new Promise((resolve, reject) => {

        query = mysql.format(query, data)

        const params = [query]

        params.push((err, rows) => {
            if (err) reject(err)
            if (rows) resolve(rows)
        })

        db.query(...params)
    })
}

export async function queryCell(queryString, data=false){
    const result = await query(queryString, data)

    //getting last name value (only one if one cell got)
    let cellName
    Object.keys(result[0]).forEach(key => {
        cellName = key
    })

    return result[0][cellName]
}

export async function queryPlain(queryString, data=false){
    const result = await query(queryString, data)
    return result[0]
}