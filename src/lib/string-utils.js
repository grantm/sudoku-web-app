
export function joinValues(joiner, ...values) {
    return values.filter(s => typeof(s) === 'string' && s !== '').join(joiner);
}

export function classList (...values) {
    return joinValues(' ', ...values);
}
