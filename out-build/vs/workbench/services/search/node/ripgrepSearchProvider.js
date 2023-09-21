/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/workbench/services/search/node/ripgrepTextSearchEngine", "vs/platform/progress/common/progress", "vs/base/common/network"], function (require, exports, cancellation_1, ripgrepTextSearchEngine_1, progress_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jdc = void 0;
    class $Jdc {
        constructor(b) {
            this.b = b;
            this.a = new Set();
            process.once('exit', () => this.d());
        }
        provideTextSearchResults(query, options, progress, token) {
            const engine = new ripgrepTextSearchEngine_1.$zdc(this.b);
            if (options.folder.scheme === network_1.Schemas.vscodeUserData) {
                // Ripgrep search engine can only provide file-scheme results, but we want to use it to search some schemes that are backed by the filesystem, but with some other provider as the frontend,
                // case in point vscode-userdata. In these cases we translate the query to a file, and translate the results back to the frontend scheme.
                const translatedOptions = { ...options, folder: options.folder.with({ scheme: network_1.Schemas.file }) };
                const progressTranslator = new progress_1.$4u(data => progress.report({ ...data, uri: data.uri.with({ scheme: options.folder.scheme }) }));
                return this.c(token, token => engine.provideTextSearchResults(query, translatedOptions, progressTranslator, token));
            }
            else {
                return this.c(token, token => engine.provideTextSearchResults(query, options, progress, token));
            }
        }
        async c(token, fn) {
            const merged = mergedTokenSource(token);
            this.a.add(merged);
            const result = await fn(merged.token);
            this.a.delete(merged);
            return result;
        }
        d() {
            this.a.forEach(engine => engine.cancel());
        }
    }
    exports.$Jdc = $Jdc;
    function mergedTokenSource(token) {
        const tokenSource = new cancellation_1.$pd();
        token.onCancellationRequested(() => tokenSource.cancel());
        return tokenSource;
    }
});
//# sourceMappingURL=ripgrepSearchProvider.js.map