/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/uri"], function (require, exports, errors, platform, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COI = exports.FileAccess = exports.nodeModulesAsarUnpackedPath = exports.nodeModulesAsarPath = exports.nodeModulesPath = exports.builtinExtensionsPath = exports.RemoteAuthorities = exports.connectionTokenQueryName = exports.connectionTokenCookieName = exports.Schemas = void 0;
    var Schemas;
    (function (Schemas) {
        /**
         * A schema that is used for models that exist in memory
         * only and that have no correspondence on a server or such.
         */
        Schemas.inMemory = 'inmemory';
        /**
         * A schema that is used for setting files
         */
        Schemas.vscode = 'vscode';
        /**
         * A schema that is used for internal private files
         */
        Schemas.internal = 'private';
        /**
         * A walk-through document.
         */
        Schemas.walkThrough = 'walkThrough';
        /**
         * An embedded code snippet.
         */
        Schemas.walkThroughSnippet = 'walkThroughSnippet';
        Schemas.http = 'http';
        Schemas.https = 'https';
        Schemas.file = 'file';
        Schemas.mailto = 'mailto';
        Schemas.untitled = 'untitled';
        Schemas.data = 'data';
        Schemas.command = 'command';
        Schemas.vscodeRemote = 'vscode-remote';
        Schemas.vscodeRemoteResource = 'vscode-remote-resource';
        Schemas.vscodeManagedRemoteResource = 'vscode-managed-remote-resource';
        Schemas.vscodeUserData = 'vscode-userdata';
        Schemas.vscodeCustomEditor = 'vscode-custom-editor';
        Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
        Schemas.vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata';
        Schemas.vscodeNotebookCellOutput = 'vscode-notebook-cell-output';
        Schemas.vscodeInteractiveInput = 'vscode-interactive-input';
        Schemas.vscodeSettings = 'vscode-settings';
        Schemas.vscodeWorkspaceTrust = 'vscode-workspace-trust';
        Schemas.vscodeTerminal = 'vscode-terminal';
        Schemas.vscodeChatSesssion = 'vscode-chat-editor';
        /**
         * Scheme used internally for webviews that aren't linked to a resource (i.e. not custom editors)
         */
        Schemas.webviewPanel = 'webview-panel';
        /**
         * Scheme used for loading the wrapper html and script in webviews.
         */
        Schemas.vscodeWebview = 'vscode-webview';
        /**
         * Scheme used for extension pages
         */
        Schemas.extension = 'extension';
        /**
         * Scheme used as a replacement of `file` scheme to load
         * files with our custom protocol handler (desktop only).
         */
        Schemas.vscodeFileResource = 'vscode-file';
        /**
         * Scheme used for temporary resources
         */
        Schemas.tmp = 'tmp';
        /**
         * Scheme used vs live share
         */
        Schemas.vsls = 'vsls';
        /**
         * Scheme used for the Source Control commit input's text document
         */
        Schemas.vscodeSourceControl = 'vscode-scm';
    })(Schemas || (exports.Schemas = Schemas = {}));
    exports.connectionTokenCookieName = 'vscode-tkn';
    exports.connectionTokenQueryName = 'tkn';
    class RemoteAuthoritiesImpl {
        constructor() {
            this._hosts = Object.create(null);
            this._ports = Object.create(null);
            this._connectionTokens = Object.create(null);
            this._preferredWebSchema = 'http';
            this._delegate = null;
            this._remoteResourcesPath = `/${Schemas.vscodeRemoteResource}`;
        }
        setPreferredWebSchema(schema) {
            this._preferredWebSchema = schema;
        }
        setDelegate(delegate) {
            this._delegate = delegate;
        }
        setServerRootPath(serverRootPath) {
            this._remoteResourcesPath = `${serverRootPath}/${Schemas.vscodeRemoteResource}`;
        }
        set(authority, host, port) {
            this._hosts[authority] = host;
            this._ports[authority] = port;
        }
        setConnectionToken(authority, connectionToken) {
            this._connectionTokens[authority] = connectionToken;
        }
        getPreferredWebSchema() {
            return this._preferredWebSchema;
        }
        rewrite(uri) {
            if (this._delegate) {
                try {
                    return this._delegate(uri);
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                    return uri;
                }
            }
            const authority = uri.authority;
            let host = this._hosts[authority];
            if (host && host.indexOf(':') !== -1 && host.indexOf('[') === -1) {
                host = `[${host}]`;
            }
            const port = this._ports[authority];
            const connectionToken = this._connectionTokens[authority];
            let query = `path=${encodeURIComponent(uri.path)}`;
            if (typeof connectionToken === 'string') {
                query += `&${exports.connectionTokenQueryName}=${encodeURIComponent(connectionToken)}`;
            }
            return uri_1.URI.from({
                scheme: platform.isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
                authority: `${host}:${port}`,
                path: this._remoteResourcesPath,
                query
            });
        }
    }
    exports.RemoteAuthorities = new RemoteAuthoritiesImpl();
    exports.builtinExtensionsPath = 'vs/../../extensions';
    exports.nodeModulesPath = 'vs/../../node_modules';
    exports.nodeModulesAsarPath = 'vs/../../node_modules.asar';
    exports.nodeModulesAsarUnpackedPath = 'vs/../../node_modules.asar.unpacked';
    class FileAccessImpl {
        static { this.FALLBACK_AUTHORITY = 'vscode-app'; }
        /**
         * Returns a URI to use in contexts where the browser is responsible
         * for loading (e.g. fetch()) or when used within the DOM.
         *
         * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
         */
        asBrowserUri(resourcePath) {
            const uri = this.toUri(resourcePath, require);
            return this.uriToBrowserUri(uri);
        }
        /**
         * Returns a URI to use in contexts where the browser is responsible
         * for loading (e.g. fetch()) or when used within the DOM.
         *
         * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
         */
        uriToBrowserUri(uri) {
            // Handle remote URIs via `RemoteAuthorities`
            if (uri.scheme === Schemas.vscodeRemote) {
                return exports.RemoteAuthorities.rewrite(uri);
            }
            // Convert to `vscode-file` resource..
            if (
            // ...only ever for `file` resources
            uri.scheme === Schemas.file &&
                (
                // ...and we run in native environments
                platform.isNative ||
                    // ...or web worker extensions on desktop
                    (platform.isWebWorker && platform.globals.origin === `${Schemas.vscodeFileResource}://${FileAccessImpl.FALLBACK_AUTHORITY}`))) {
                return uri.with({
                    scheme: Schemas.vscodeFileResource,
                    // We need to provide an authority here so that it can serve
                    // as origin for network and loading matters in chromium.
                    // If the URI is not coming with an authority already, we
                    // add our own
                    authority: uri.authority || FileAccessImpl.FALLBACK_AUTHORITY,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        /**
         * Returns the `file` URI to use in contexts where node.js
         * is responsible for loading.
         */
        asFileUri(resourcePath) {
            const uri = this.toUri(resourcePath, require);
            return this.uriToFileUri(uri);
        }
        /**
         * Returns the `file` URI to use in contexts where node.js
         * is responsible for loading.
         */
        uriToFileUri(uri) {
            // Only convert the URI if it is `vscode-file:` scheme
            if (uri.scheme === Schemas.vscodeFileResource) {
                return uri.with({
                    scheme: Schemas.file,
                    // Only preserve the `authority` if it is different from
                    // our fallback authority. This ensures we properly preserve
                    // Windows UNC paths that come with their own authority.
                    authority: uri.authority !== FileAccessImpl.FALLBACK_AUTHORITY ? uri.authority : null,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        toUri(uriOrModule, moduleIdToUrl) {
            if (uri_1.URI.isUri(uriOrModule)) {
                return uriOrModule;
            }
            return uri_1.URI.parse(moduleIdToUrl.toUrl(uriOrModule));
        }
    }
    exports.FileAccess = new FileAccessImpl();
    var COI;
    (function (COI) {
        const coiHeaders = new Map([
            ['1', { 'Cross-Origin-Opener-Policy': 'same-origin' }],
            ['2', { 'Cross-Origin-Embedder-Policy': 'require-corp' }],
            ['3', { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' }],
        ]);
        COI.CoopAndCoep = Object.freeze(coiHeaders.get('3'));
        const coiSearchParamName = 'vscode-coi';
        /**
         * Extract desired headers from `vscode-coi` invocation
         */
        function getHeadersFromQuery(url) {
            let params;
            if (typeof url === 'string') {
                params = new URL(url).searchParams;
            }
            else if (url instanceof URL) {
                params = url.searchParams;
            }
            else if (uri_1.URI.isUri(url)) {
                params = new URL(url.toString(true)).searchParams;
            }
            const value = params?.get(coiSearchParamName);
            if (!value) {
                return undefined;
            }
            return coiHeaders.get(value);
        }
        COI.getHeadersFromQuery = getHeadersFromQuery;
        /**
         * Add the `vscode-coi` query attribute based on wanting `COOP` and `COEP`. Will be a noop when `crossOriginIsolated`
         * isn't enabled the current context
         */
        function addSearchParam(urlOrSearch, coop, coep) {
            if (!globalThis.crossOriginIsolated) {
                // depends on the current context being COI
                return;
            }
            const value = coop && coep ? '3' : coep ? '2' : '1';
            if (urlOrSearch instanceof URLSearchParams) {
                urlOrSearch.set(coiSearchParamName, value);
            }
            else {
                urlOrSearch[coiSearchParamName] = value;
            }
        }
        COI.addSearchParam = addSearchParam;
    })(COI || (exports.COI = COI = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL25ldHdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLElBQWlCLE9BQU8sQ0FvR3ZCO0lBcEdELFdBQWlCLE9BQU87UUFFdkI7OztXQUdHO1FBQ1UsZ0JBQVEsR0FBRyxVQUFVLENBQUM7UUFFbkM7O1dBRUc7UUFDVSxjQUFNLEdBQUcsUUFBUSxDQUFDO1FBRS9COztXQUVHO1FBQ1UsZ0JBQVEsR0FBRyxTQUFTLENBQUM7UUFFbEM7O1dBRUc7UUFDVSxtQkFBVyxHQUFHLGFBQWEsQ0FBQztRQUV6Qzs7V0FFRztRQUNVLDBCQUFrQixHQUFHLG9CQUFvQixDQUFDO1FBRTFDLFlBQUksR0FBRyxNQUFNLENBQUM7UUFFZCxhQUFLLEdBQUcsT0FBTyxDQUFDO1FBRWhCLFlBQUksR0FBRyxNQUFNLENBQUM7UUFFZCxjQUFNLEdBQUcsUUFBUSxDQUFDO1FBRWxCLGdCQUFRLEdBQUcsVUFBVSxDQUFDO1FBRXRCLFlBQUksR0FBRyxNQUFNLENBQUM7UUFFZCxlQUFPLEdBQUcsU0FBUyxDQUFDO1FBRXBCLG9CQUFZLEdBQUcsZUFBZSxDQUFDO1FBRS9CLDRCQUFvQixHQUFHLHdCQUF3QixDQUFDO1FBRWhELG1DQUEyQixHQUFHLGdDQUFnQyxDQUFDO1FBRS9ELHNCQUFjLEdBQUcsaUJBQWlCLENBQUM7UUFFbkMsMEJBQWtCLEdBQUcsc0JBQXNCLENBQUM7UUFFNUMsMEJBQWtCLEdBQUcsc0JBQXNCLENBQUM7UUFDNUMsa0NBQTBCLEdBQUcsK0JBQStCLENBQUM7UUFDN0QsZ0NBQXdCLEdBQUcsNkJBQTZCLENBQUM7UUFDekQsOEJBQXNCLEdBQUcsMEJBQTBCLENBQUM7UUFFcEQsc0JBQWMsR0FBRyxpQkFBaUIsQ0FBQztRQUVuQyw0QkFBb0IsR0FBRyx3QkFBd0IsQ0FBQztR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