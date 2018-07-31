/**
 * Created by lerayne on 31.07.2018.
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'

class LoginPage extends Component {

    static anonymousRequired = true

    render() {
        return <div>
            Login Page

            {this.props.children}
        </div>
    }
}

export default LoginPage = connect(state => ({}))(LoginPage)