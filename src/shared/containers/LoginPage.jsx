/**
 * Created by lerayne on 31.07.2018.
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'

const errors = {
    1: 'wrong login or password'
}

class LoginPage extends Component {

    static anonymousRequired = true

    render() {
        return <div>

            {this.props.location.query.error && <div>
                Error: {errors[this.props.location.query.error] || this.props.location.query.error}
            </div>}

            <form method="POST" action="/login">
                <div>
                    <input type="text" name="email" placeholder="email" />
                </div>
                <div>
                    <input type="password" name="password" placeholder="password" />
                </div>
                <input type="submit" value="Log in" />
            </form>

            {this.props.children}
        </div>
    }
}

export default LoginPage = connect(state => ({}))(LoginPage)