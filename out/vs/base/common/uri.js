/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform"], function (require, exports, paths, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uriToFsPath = exports.isUriComponents = exports.URI = void 0;
    const _schemePattern = /^\w[\w\d+.-]*$/;
    const _singleSlashStart = /^\//;
    const _doubleSlashStart = /^\/\//;
    function _validateUri(ret, _strict) {
        // scheme, must be set
        if (!ret.scheme && _strict) {
            throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
        }
        // scheme, https://tools.ietf.org/html/rfc3986#section-3.1
        // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
        if (ret.scheme && !_schemePattern.test(ret.scheme)) {
            throw new Error('[UriError]: Scheme contains illegal characters.');
        }
        // path, http://tools.ietf.org/html/rfc3986#section-3.3
        // If a URI contains an authority component, then the path component
        // must either be empty or begin with a slash ("/") character.  If a URI
        // does not contain an authority component, then the path cannot begin
        // with two slash characters ("//").
        if (ret.path) {
            if (ret.authority) {
                if (!_singleSlashStart.test(ret.path)) {
                    throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
                }
            }
            else {
                if (_doubleSlashStart.test(ret.path)) {
                    throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
                }
            }
        }
    }
    // for a while we allowed uris *without* schemes and this is the migration
    // for them, e.g. an uri without scheme and without strict-mode warns and falls
    // back to the file-scheme. that should cause the least carnage and still be a
    // clear warning
    function _schemeFix(scheme, _strict) {
        if (!scheme && !_strict) {
            return 'file';
        }
        return scheme;
    }
    // implements a bit of https://tools.ietf.org/html/rfc3986#section-5
    function _referenceResolution(scheme, path) {
        // the slash-character is our 'default base' as we don't
        // support constructing URIs relative to other URIs. This
        // also means that we alter and potentially break paths.
        // see https://tools.ietf.org/html/rfc3986#section-5.1.4
        switch (scheme) {
            case 'https':
            case 'http':
            case 'file':
                if (!path) {
                    path = _slash;
                }
                else if (path[0] !== _slash) {
                    path = _slash + path;
                }
                break;
        }
        return path;
    }
    const _empty = '';
    const _slash = '/';
    const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
    /**
     * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
     * This class is a simple parser which creates the basic component parts
     * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
     * and encoding.
     *
     * ```txt
     *       foo://example.com:8042/over/there?name=ferret#nose
     *       \_/   \______________/\_________/ \_________/ \__/
     *        |           |            |            |        |
     *     scheme     authority       path        query   fragment
     *        |   _____________________|__
     *       / \ /                        \
     *       urn:example:animal:ferret:nose
     * ```
     */
    class URI {
        static isUri(thing) {
            if (thing instanceof URI) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.authority === 'string'
                && typeof thing.fragment === 'string'
                && typeof thing.path === 'string'
                && typeof thing.query === 'string'
                && typeof thing.scheme === 'string'
                && typeof thing.fsPath === 'string'
                && typeof thing.with === 'function'
                && typeof thing.toString === 'function';
        }
        /**
         * @internal
         */
        constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
            if (typeof schemeOrData === 'object') {
                this.scheme = schemeOrData.scheme || _empty;
                this.authority = schemeOrData.authority || _empty;
                this.path = schemeOrData.path || _empty;
                this.query = schemeOrData.query || _empty;
                this.fragment = schemeOrData.fragment || _empty;
                // no validation because it's this URI
                // that creates uri components.
                // _validateUri(this);
            }
            else {
                this.scheme = _schemeFix(schemeOrData, _strict);
                this.authority = authority || _empty;
                this.path = _referenceResolution(this.scheme, path || _empty);
                this.query = query || _empty;
                this.fragment = fragment || _empty;
                _validateUri(this, _strict);
            }
        }
        // ---- filesystem path -----------------------
        /**
         * Returns a string representing the corresponding file system path of this URI.
         * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
         * platform specific path separator.
         *
         * * Will *not* validate the path for invalid characters and semantics.
         * * Will *not* look at the scheme of this URI.
         * * The result shall *not* be used for display purposes but for accessing a file on disk.
         *
         *
         * The *difference* to `URI#path` is the use of the platform specific separator and the handling
         * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
         *
         * ```ts
            const u = URI.parse('file://server/c$/folder/file.txt')
            u.authority === 'server'
            u.path === '/shares/c$/file.txt'
            u.fsPath === '\\server\c$\folder\file.txt'
        ```
         *
         * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
         * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
         * with URIs that represent files on disk (`file` scheme).
         */
        get fsPath() {
            // if (this.scheme !== 'file') {
            // 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
            // }
            return uriToFsPath(this, false);
        }
        // ---- modify to new -------------------------
        with(change) {
            if (!change) {
                return this;
            }
            let { scheme, authority, path, query, fragment } = change;
            if (scheme === undefined) {
                scheme = this.scheme;
            }
            else if (scheme === null) {
                scheme = _empty;
            }
            if (authority === undefined) {
                authority = this.authority;
            }
            else if (authority === null) {
                authority = _empty;
            }
            if (path === undefined) {
                path = this.path;
            }
            else if (path === null) {
                path = _empty;
            }
            if (query === undefined) {
                query = this.query;
            }
            else if (query === null) {
                query = _empty;
            }
            if (fragment === undefined) {
                fragment = this.fragment;
            }
            else if (fragment === null) {
                fragment = _empty;
            }
            if (scheme === this.scheme
                && authority === this.authority
                && path === this.path
                && query === this.query
                && fragment === this.fragment) {
                return this;
            }
            return new Uri(scheme, authority, path, query, fragment);
        }
        // ---- parse & validate ------------------------
        /**
         * Creates a new URI from a string, e.g. `http://www.example.com/some/path`,
         * `file:///usr/home`, or `scheme:with/path`.
         *
         * @param value A string which represents an URI (see `URI#toString`).
         */
        static parse(value, _strict = false) {
            const match = _regexp.exec(value);
            if (!match) {
                return new Uri(_empty, _empty, _empty, _empty, _empty);
            }
            return new Uri(match[2] || _empty, percentDecode(match[4] || _empty), percentDecode(match[5] || _empty), percentDecode(match[7] || _empty), percentDecode(match[9] || _empty), _strict);
        }
        /**
         * Creates a new URI from a file system path, e.g. `c:\my\files`,
         * `/usr/home`, or `\\server\share\some\path`.
         *
         * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
         * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
         * `URI.parse('file://' + path)` because the path might contain characters that are
         * interpreted (# and ?). See the following sample:
         * ```ts
        const good = URI.file('/coding/c#/project1');
        good.scheme === 'file';
        good.path === '/coding/c#/project1';
        good.fragment === '';
        const bad = URI.parse('file://' + '/coding/c#/project1');
        bad.scheme === 'file';
        bad.path === '/coding/c'; // path is now broken
        bad.fragment === '/project1';
        ```
         *
         * @param path A file system path (see `URI#fsPath`)
         */
        static file(path) {
            let authority = _empty;
            // normalize to fwd-slashes on windows,
            // on other systems bwd-slashes are valid
            // filename character, eg /f\oo/ba\r.txt
            if (platform_1.isWindows) {
                path = path.replace(/\\/g, _slash);
            }
            // check for authority as used in UNC shares
            // or use the path as given
            if (path[0] === _slash && path[1] === _slash) {
                const idx = path.indexOf(_slash, 2);
                if (idx === -1) {
                    authority = path.substring(2);
                    path = _slash;
                }
                else {
                    authority = path.substring(2, idx);
                    path = path.substring(idx) || _slash;
                }
            }
            return new Uri('file', authority, path, _empty, _empty);
        }
        /**
         * Creates new URI from uri components.
         *
         * Unless `strict` is `true` the scheme is defaults to be `file`. This function performs
         * validation and should be used for untrusted uri components retrieved from storage,
         * user input, command arguments etc
         */
        static from(components, strict) {
            const result = new Uri(components.scheme, components.authority, components.path, components.query, components.fragment, strict);
            return result;
        }
        /**
         * Join a URI path with path fragments and normalizes the resulting path.
         *
         * @param uri The input URI.
         * @param pathFragment The path fragment to add to the URI path.
         * @returns The resulting URI.
         */
        static joinPath(uri, ...pathFragment) {
            if (!uri.path) {
                throw new Error(`[UriError]: cannot call joinPath on URI without path`);
            }
            let newPath;
            if (platform_1.isWindows && uri.scheme === 'file') {
                newPath = URI.file(paths.win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
            }
            else {
                newPath = paths.posix.join(uri.path, ...pathFragment);
            }
            return uri.with({ path: newPath });
        }
        // ---- printing/externalize ---------------------------
        /**
         * Creates a string representation for this URI. It's guaranteed that calling
         * `URI.parse` with the result of this function creates an URI which is equal
         * to this URI.
         *
         * * The result shall *not* be used for display purposes but for externalization or transport.
         * * The result will be encoded using the percentage encoding and encoding happens mostly
         * ignore the scheme-specific encoding rules.
         *
         * @param skipEncoding Do not encode the result, default is `false`
         */
        toString(skipEncoding = false) {
            return _asFormatted(this, skipEncoding);
        }
        toJSON() {
            return this;
        }
        static revive(data) {
            if (!data) {
                return data;
            }
            else if (data instanceof URI) {
                return data;
            }
            else {
                const result = new Uri(data);
                result._formatted = data.external ?? null;
                result._fsPath = data._sep === _pathSepMarker ? data.fsPath ?? null : null;
                return result;
            }
        }
    }
    exports.URI = URI;
    function isUriComponents(thing) {
        if (!thing || typeof thing !== 'object') {
            return false;
        }
        return typeof thing.scheme === 'string'
            && (typeof thing.authority === 'string' || typeof thing.authority === 'undefined')
            && (typeof thing.path === 'string' || typeof thing.path === 'undefined')
            && (typeof thing.query === 'string' || typeof thing.query === 'undefined')
            && (typeof thing.fragment === 'string' || typeof thing.fragment === 'undefined');
    }
    exports.isUriComponents = isUriComponents;
    const _pathSepMarker = platform_1.isWindows ? 1 : undefined;
    // This class exists so that URI is compatible with vscode.Uri (API).
    class Uri extends URI {
        constructor() {
            super(...arguments);
            this._formatted = null;
            this._fsPath = null;
        }
        get fsPath() {
            if (!this._fsPath) {
                this._fsPath = uriToFsPath(this, false);
            }
            return this._fsPath;
        }
        toString(skipEncoding = false) {
            if (!skipEncoding) {
                if (!this._formatted) {
                    this._formatted = _asFormatted(this, false);
                }
                return this._formatted;
            }
            else {
                // we don't cache that
                return _asFormatted(this, true);
            }
        }
        toJSON() {
            const res = {
                $mid: 1 /* MarshalledId.Uri */
            };
            // cached state
            if (this._fsPath) {
                res.fsPath = this._fsPath;
                res._sep = _pathSepMarker;
            }
            if (this._formatted) {
                res.external = this._formatted;
            }
            //--- uri components
            if (this.path) {
                res.path = this.path;
            }
            // TODO
            // this isn't correct and can violate the UriComponents contract but
            // this is part of the vscode.Uri API and we shouldn't change how that
            // works anymore
            if (this.scheme) {
                res.scheme = this.scheme;
            }
            if (this.authority) {
                res.authority = this.authority;
            }
            if (this.query) {
                res.query = this.query;
            }
            if (this.fragment) {
                res.fragment = this.fragment;
            }
            return res;
        }
    }
    // reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2
    const encodeTable = {
        [58 /* CharCode.Colon */]: '%3A',
        [47 /* CharCode.Slash */]: '%2F',
        [63 /* CharCode.QuestionMark */]: '%3F',
        [35 /* CharCode.Hash */]: '%23',
        [91 /* CharCode.OpenSquareBracket */]: '%5B',
        [93 /* CharCode.CloseSquareBracket */]: '%5D',
        [64 /* CharCode.AtSign */]: '%40',
        [33 /* CharCode.ExclamationMark */]: '%21',
        [36 /* CharCode.DollarSign */]: '%24',
        [38 /* CharCode.Ampersand */]: '%26',
        [39 /* CharCode.SingleQuote */]: '%27',
        [40 /* CharCode.OpenParen */]: '%28',
        [41 /* CharCode.CloseParen */]: '%29',
        [42 /* CharCode.Asterisk */]: '%2A',
        [43 /* CharCode.Plus */]: '%2B',
        [44 /* CharCode.Comma */]: '%2C',
        [59 /* CharCode.Semicolon */]: '%3B',
        [61 /* CharCode.Equals */]: '%3D',
        [32 /* CharCode.Space */]: '%20',
    };
    function encodeURIComponentFast(uriComponent, isPath, isAuthority) {
        let res = undefined;
        let nativeEncodePos = -1;
        for (let pos = 0; pos < uriComponent.length; pos++) {
            const code = uriComponent.charCodeAt(pos);
            // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3
            if ((code >= 97 /* CharCode.a */ && code <= 122 /* CharCode.z */)
                || (code >= 65 /* CharCode.A */ && code <= 90 /* CharCode.Z */)
                || (code >= 48 /* CharCode.Digit0 */ && code <= 57 /* CharCode.Digit9 */)
                || code === 45 /* CharCode.Dash */
                || code === 46 /* CharCode.Period */
                || code === 95 /* CharCode.Underline */
                || code === 126 /* CharCode.Tilde */
                || (isPath && code === 47 /* CharCode.Slash */)
                || (isAuthority && code === 91 /* CharCode.OpenSquareBracket */)
                || (isAuthority && code === 93 /* CharCode.CloseSquareBracket */)
                || (isAuthority && code === 58 /* CharCode.Colon */)) {
                // check if we are delaying native encode
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                // check if we write into a new string (by default we try to return the param)
                if (res !== undefined) {
                    res += uriComponent.charAt(pos);
                }
            }
            else {
                // encoding needed, we need to allocate a new string
                if (res === undefined) {
                    res = uriComponent.substr(0, pos);
                }
                // check with default table first
                const escaped = encodeTable[code];
                if (escaped !== undefined) {
                    // check if we are delaying native encode
                    if (nativeEncodePos !== -1) {
                        res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                        nativeEncodePos = -1;
                    }
                    // append escaped variant to result
                    res += escaped;
                }
                else if (nativeEncodePos === -1) {
                    // use native encode only when needed
                    nativeEncodePos = pos;
                }
            }
        }
        if (nativeEncodePos !== -1) {
            res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
        }
        return res !== undefined ? res : uriComponent;
    }
    function encodeURIComponentMinimal(path) {
        let res = undefined;
        for (let pos = 0; pos < path.length; pos++) {
            const code = path.charCodeAt(pos);
            if (code === 35 /* CharCode.Hash */ || code === 63 /* CharCode.QuestionMark */) {
                if (res === undefined) {
                    res = path.substr(0, pos);
                }
                res += encodeTable[code];
            }
            else {
                if (res !== undefined) {
                    res += path[pos];
                }
            }
        }
        return res !== undefined ? res : path;
    }
    /**
     * Compute `fsPath` for the given uri
     */
    function uriToFsPath(uri, keepDriveLetterCasing) {
        let value;
        if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
            // unc path: file://shares/c$/far/boo
            value = `//${uri.authority}${uri.path}`;
        }
        else if (uri.path.charCodeAt(0) === 47 /* CharCode.Slash */
            && (uri.path.charCodeAt(1) >= 65 /* CharCode.A */ && uri.path.charCodeAt(1) <= 90 /* CharCode.Z */ || uri.path.charCodeAt(1) >= 97 /* CharCode.a */ && uri.path.charCodeAt(1) <= 122 /* CharCode.z */)
            && uri.path.charCodeAt(2) === 58 /* CharCode.Colon */) {
            if (!keepDriveLetterCasing) {
                // windows drive letter: file:///c:/far/boo
                value = uri.path[1].toLowerCase() + uri.path.substr(2);
            }
            else {
                value = uri.path.substr(1);
            }
        }
        else {
            // other path
            value = uri.path;
        }
        if (platform_1.isWindows) {
            value = value.replace(/\//g, '\\');
        }
        return value;
    }
    exports.uriToFsPath = uriToFsPath;
    /**
     * Create the external version of a uri
     */
    function _asFormatted(uri, skipEncoding) {
        const encoder = !skipEncoding
            ? encodeURIComponentFast
            : encodeURIComponentMinimal;
        let res = '';
        let { scheme, authority, path, query, fragment } = uri;
        if (scheme) {
            res += scheme;
            res += ':';
        }
        if (authority || scheme === 'file') {
            res += _slash;
            res += _slash;
        }
        if (authority) {
            let idx = authority.indexOf('@');
            if (idx !== -1) {
                // <user>@<auth>
                const userinfo = authority.substr(0, idx);
                authority = authority.substr(idx + 1);
                idx = userinfo.lastIndexOf(':');
                if (idx === -1) {
                    res += encoder(userinfo, false, false);
                }
                else {
                    // <user>:<pass>@<auth>
                    res += encoder(userinfo.substr(0, idx), false, false);
                    res += ':';
                    res += encoder(userinfo.substr(idx + 1), false, true);
                }
                res += '@';
            }
            authority = authority.toLowerCase();
            idx = authority.lastIndexOf(':');
            if (idx === -1) {
                res += encoder(authority, false, true);
            }
            else {
                // <auth>:<port>
                res += encoder(authority.substr(0, idx), false, true);
                res += authority.substr(idx);
            }
        }
        if (path) {
            // lower-case windows drive letters in /C:/fff or C:/fff
            if (path.length >= 3 && path.charCodeAt(0) === 47 /* CharCode.Slash */ && path.charCodeAt(2) === 58 /* CharCode.Colon */) {
                const code = path.charCodeAt(1);
                if (code >= 65 /* CharCode.A */ && code <= 90 /* CharCode.Z */) {
                    path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`; // "/c:".length === 3
                }
            }
            else if (path.length >= 2 && path.charCodeAt(1) === 58 /* CharCode.Colon */) {
                const code = path.charCodeAt(0);
                if (code >= 65 /* CharCode.A */ && code <= 90 /* CharCode.Z */) {
                    path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`; // "/c:".length === 3
                }
            }
            // encode the rest of the path
            res += encoder(path, true, false);
        }
        if (query) {
            res += '?';
            res += encoder(query, false, false);
        }
        if (fragment) {
            res += '#';
            res += !skipEncoding ? encodeURIComponentFast(fragment, false, false) : fragment;
        }
        return res;
    }
    // --- decode
    function decodeURIComponentGraceful(str) {
        try {
            return decodeURIComponent(str);
        }
        catch {
            if (str.length > 3) {
                return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
            }
            else {
                return str;
            }
        }
    }
    const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
    function percentDecode(str) {
        if (!str.match(_rEncodedAsHex)) {
            return str;
        }
        return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vdXJpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQztJQUN4QyxNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQztJQUNoQyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztJQUVsQyxTQUFTLFlBQVksQ0FBQyxHQUFRLEVBQUUsT0FBaUI7UUFFaEQsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxHQUFHLENBQUMsU0FBUyxhQUFhLEdBQUcsQ0FBQyxJQUFJLGNBQWMsR0FBRyxDQUFDLEtBQUssaUJBQWlCLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1NBQ3ZLO1FBRUQsMERBQTBEO1FBQzFELDZDQUE2QztRQUM3QyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNuRCxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7U0FDbkU7UUFFRCx1REFBdUQ7UUFDdkQsb0VBQW9FO1FBQ3BFLHdFQUF3RTtRQUN4RSxzRUFBc0U7UUFDdEUsb0NBQW9DO1FBQ3BDLElBQUksR0FBRyxDQUFDLElBQUksRUFBRTtZQUNiLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsMElBQTBJLENBQUMsQ0FBQztpQkFDNUo7YUFDRDtpQkFBTTtnQkFDTixJQUFJLGlCQUFp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