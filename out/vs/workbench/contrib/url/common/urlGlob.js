/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testUrlMatchesGlob = void 0;
    // TODO: rewrite this to use URIs directly and validate each part individually
    // instead of relying on memoization of the stringified URI.
    const testUrlMatchesGlob = (uri, globUrl) => {
        let url = uri.with({ query: null, fragment: null }).toString(true);
        const normalize = (url) => url.replace(/\/+$/, '');
        globUrl = normalize(globUrl);
        url = normalize(url);
        const memo = Array.from({ length: url.length + 1 }).map(() => Array.from({ length: globUrl.length + 1 }).map(() => undefined));
        if (/^[^./:]*:\/\//.test(globUrl)) {
            return doUrlMatch(memo, url, globUrl, 0, 0);
        }
        const scheme = /^(https?):\/\//.exec(url)?.[1];
        if (scheme) {
            return doUrlMatch(memo, url, `${scheme}://${globUrl}`, 0, 0);
        }
        return false;
    };
    exports.testUrlMatchesGlob = testUrlMatchesGlob;
    const doUrlMatch = (memo, url, globUrl, urlOffset, globUrlOffset) => {
        if (memo[urlOffset]?.[globUrlOffset] !== undefined) {
            return memo[urlOffset][globUrlOffset];
        }
        const options = [];
        // Endgame.
        // Fully exact match
        if (urlOffset === url.length) {
            return globUrlOffset === globUrl.length;
        }
        // Some path remaining in url
        if (globUrlOffset === globUrl.length) {
            const remaining = url.slice(urlOffset);
            return remaining[0] === '/';
        }
        if (url[urlOffset] === globUrl[globUrlOffset]) {
            // Exact match.
            options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset + 1));
        }
        if (globUrl[globUrlOffset] + globUrl[globUrlOffset + 1] === '*.') {
            // Any subdomain match. Either consume one thing that's not a / or : and don't advance base or consume nothing and do.
            if (!['/', ':'].includes(url[urlOffset])) {
                options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset));
            }
            options.push(doUrlMatch(memo, url, globUrl, urlOffset, globUrlOffset + 2));
        }
        if (globUrl[globUrlOffset] === '*') {
            // Any match. Either consume one thing and don't advance base or consume nothing and do.
            if (urlOffset + 1 === url.length) {
                // If we're at the end of the input url consume one from both.
                options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset + 1));
            }
            else {
                options.push(doUrlMatch(memo, url, globUrl, urlOffset + 1, globUrlOffset));
            }
            options.push(doUrlMatch(memo, url, globUrl, urlOffset, globUrlOffset + 1));
        }
        if (globUrl[globUrlOffset] + globUrl[globUrlOffset + 1] === ':*') {
            // any port match. Consume a port if it exists otherwise nothing. Always comsume the base.
            if (url[urlOffset] === ':') {
                let endPortIndex = urlOffset + 1;
                do {
                    endPortIndex++;
                } while (/[0-9]/.test(url[endPortIndex]));
                options.push(doUrlMatch(memo, url, globUrl, endPortIndex, globUrlOffset + 2));
            }
            else {
                options.push(doUrlMatch(memo, url, globUrl, urlOffset, globUrlOffset + 2));
            }
        }
        return (memo[urlOffset][globUrlOffset] = options.some(a => a === true));
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsR2xvYi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VybC9jb21tb24vdXJsR2xvYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJaEcsOEVBQThFO0lBQzlFLDREQUE0RDtJQUNyRCxNQUFNLGtCQUFrQixHQUFHLENBQUMsR0FBUSxFQUFFLE9BQWUsRUFBVyxFQUFFO1FBQ3hFLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRSxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QsT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FDNUQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUMvRCxDQUFDO1FBRUYsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxD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