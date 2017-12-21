/**
 * Created by lerayne on 22.12.2017.
 */

module.exports = {
    domain: 'localhost',
    staticResourcesUrl:'/public/',
    secretKey: 'mYuBeRsEcReTkEy192837465',
    keyExpiresIn: '30 days',
    dbConfig: {
        host: '127.0.0.1',
        port:'8889',
        user: 'root',
        password: 'root',
        database: 'expenses',
    }
}