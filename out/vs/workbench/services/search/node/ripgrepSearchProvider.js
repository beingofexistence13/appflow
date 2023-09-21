/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/workbench/services/search/node/ripgrepTextSearchEngine", "vs/platform/progress/common/progress", "vs/base/common/network"], function (require, exports, cancellation_1, ripgrepTextSearchEngine_1, progress_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RipgrepSearchProvider = void 0;
    class RipgrepSearchProvider {
        constructor(outputChannel) {
            this.outputChannel = outputChannel;
            this.inProgress = new Set();
            process.once('exit', () => this.dispose());
        }
        provideTextSearchResults(query, options, progress, token) {
            const engine = new ripgrepTextSearchEngine_1.RipgrepTextSearchEngine(this.outputChannel);
            if (options.folder.scheme === network_1.Schemas.vscodeUserData) {
                // Ripgrep search engine can only provide file-scheme results, but we want to use it to search some schemes that are backed by the filesystem, but with some other provider as the frontend,
                // case in point vscode-userdata. In these cases we translate the query to a file, and translate the results back to the frontend scheme.
                const translatedOptions = { ...options, folder: options.folder.with({ scheme: network_1.Schemas.file }) };
                const progressTranslator = new progress_1.Progress(data => progress.report({ ...data, uri: data.uri.with({ scheme: options.folder.scheme }) }));
                return this.withToken(token, token => engine.provideTextSearchResults(query, translatedOptions, progressTranslator, token));
            }
            else {
                return this.withToken(token, token => engine.provideTextSearchResults(query, options, progress, token));
            }
        }
        async withToken(token, fn) {
            const merged = mergedTokenSource(token);
            this.inProgress.add(merged);
            const result = await fn(merged.token);
            this.inProgress.delete(merged);
            return result;
        }
        dispose() {
            this.inProgress.forEach(engine => engine.cancel());
        }
    }
    exports.RipgrepSearchProvider = RipgrepSearchProvider;
    function mergedTokenSource(token) {
        const tokenSource = new cancellation_1.CancellationTokenSource();
        token.onCancellationRequested(() => tokenSource.cancel());
        return tokenSource;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmlwZ3JlcFNlYXJjaFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC9ub2RlL3JpcGdyZXBTZWFyY2hQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsTUFBYSxxQkFBcUI7UUFHakMsWUFBb0IsYUFBNEI7WUFBNUIsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFGeEMsZUFBVSxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCx3QkFBd0IsQ0FBQyxLQUFzQixFQUFFLE9BQTBCLEVBQUUsUUFBb0MsRUFBRSxLQUF3QjtZQUMxSSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlEQUF1QixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMvRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsY0FBYyxFQUFFO2dCQUNyRCw0TEFBNEw7Z0JBQzVMLHlJQUF5STtnQkFDekksTUFBTSxpQkFBaUIsR0FBRyxFQUFFLEdBQUcsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDaEcsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLG1CQUFRLENBQW1CLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZKLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDNUg7aUJBQU07Z0JBQ04sT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3hHO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxTQUFTLENBQUksS0FBd0IsRUFBRSxFQUE0QztZQUNoRyxNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1QixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFL0IsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sT0FBTztZQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDcEQsQ0FBQztLQUNEO0lBaENELHNEQWdDQztJQUVELFNBQVMsaUJBQWlCLENBQUMsS0FBd0I7UUFDbEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1FBQ2xELEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUUxRCxPQUFPLFdBQVcsQ0FBQztJQUNwQixDQUFDIn0=