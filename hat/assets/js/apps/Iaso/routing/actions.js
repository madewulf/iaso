import { push, replace } from 'react-router-redux';
import { createUrl } from '../utils/fetchData';

export function redirectTo(key, params) {
    return dispatch => dispatch(push(`${key}${createUrl(params, '')}`));
}
export function redirectToReplace(key, params) {
    return dispatch => dispatch(replace(`${key}${createUrl(params, '')}`));
}
