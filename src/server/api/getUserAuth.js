/**
 * Created by lerayne on 23.03.17.
 */

import {queryPlain} from '../db'

export default async function getUserAuth(email) {
    const SQLQuery = `
        SELECT 
            id, 
            email, 
            password_hash 
        FROM users 
        WHERE email = ?
    `

    return await queryPlain(SQLQuery, [email])
}