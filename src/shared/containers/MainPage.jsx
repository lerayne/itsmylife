/**
 * Created by lerayne on 31.07.2018.
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'

class MainPage extends Component {

    static loginRequired = true

    render() {
        return <div>
            Main Page
            {this.props.children}
        </div>
    }
}

export default MainPage = connect(state => ({}))(MainPage)