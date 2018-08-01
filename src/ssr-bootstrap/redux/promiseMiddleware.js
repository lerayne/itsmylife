/**
 * Created by lerayne on 17.01.17.
 */

/**
 * Redux middleware that performs Promise functionality.
 * @param getState
 * @param dispatch
 * @returns function
 */
export default function promiseMiddleware({getState, dispatch}) {
    return next => action => {

        // Expects action to have "promise" field.
        // If none - throws it to next middleware with correct return policy.
        if (!action.promise) {
            return next(action)
        } else {
            // Pass the action itself to the next MW transparently (allows to do smthng on request)
            next(action)

            const {type, promise, payload, ...rest} = action

            // copy all initial info to a new action
            const newAction = {
                ...rest,
                initialType: type,
            }

            if (payload !== undefined) {
                newAction.initialPayload = payload
            }

            // Returns a promise in which this "then" is done and the next "then" will receive the
            // result of this
            return promise.then(
                result => {
                    // "next" is fatser, but "dispatch" is more correct, for example there can be
                    // loogger middleware
                    dispatch({
                        ...newAction,
                        type: type + '_SUCCESS',
                        payload: result
                    })

                    // this is passed into next "then"
                    return true
                },
                error => {
                    console.error(error)

                    dispatch({
                        ...newAction,
                        type: type + '_FAILURE',
                        payload: error
                    })

                    // this is passed into next "then"
                    return false
                }
            )
        }
    }
}