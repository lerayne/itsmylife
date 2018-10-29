/**
 * Created by lerayne on 07.01.2018.
 */
"use strict"

const initialState = {
    id: -1
}

export default function daysReducer (state = initialState, action){
    const {type, payload} = action

    if (payload !== undefined && !payload.error) {
        switch (type) {
            case "SET_USER":
                return {
                    ...state,
                    ...payload
                }

            default: return state
        }
    }

    return state
}