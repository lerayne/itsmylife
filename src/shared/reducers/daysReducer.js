/**
 * Created by lerayne on 07.01.2018.
 */
"use strict"

const initialState = {

}

export default function daysReducer (state = initialState, action){
    const {type, payload} = action

    if (payload !== undefined && !payload.error) {
        switch (type) {

        }
    }

    return state
}