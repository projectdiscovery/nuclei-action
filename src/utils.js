export function parseFlagsToArray(rawFlags) {
    const re = /(?:(?:^|\s)-[-a-z]+)(?:(?:\s|=)(?:[^-](?:[0-9a-z-\S])*))?/g;
    const matches = rawFlags.match(re);
    if (!matches) {
        return [];
    }
    return matches.map(token => token.trim()).map(token => token.replace(' ', '='));
}
