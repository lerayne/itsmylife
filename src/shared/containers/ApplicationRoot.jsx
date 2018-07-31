/**
 * Created by lerayne on 31.07.2018.
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'

class ApplicationRoot extends Component {
    render() {
        return <div>
            Application Root container
            {this.props.children}
        </div>
    }
}

export default ApplicationRoot = connect(state => ({}))(ApplicationRoot)