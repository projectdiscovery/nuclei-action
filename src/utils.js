export function parseFlagsToArray(rawFlags) {
    const re = /(?:(?:^|\s)-[-a-z]+)(?:(?:\s|=)(?:[^-](?:[0-9a-z-\S])*))?/g;
    return rawFlags.match(re).map(token => token.trim()).map(token => token.replace(' ', '='));
}