/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/cancellation", "vs/base/common/errors", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search", "vs/platform/workspace/common/workspace"], function (require, exports, resources, uri_1, cancellation_1, errors, instantiation_1, queryBuilder_1, search_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkGlobFileExists = exports.checkActivateWorkspaceContainsExtension = void 0;
    const WORKSPACE_CONTAINS_TIMEOUT = 7000;
    function checkActivateWorkspaceContainsExtension(host, desc) {
        const activationEvents = desc.activationEvents;
        if (!activationEvents) {
            return Promise.resolve(undefined);
        }
        const fileNames = [];
        const globPatterns = [];
        for (const activationEvent of activationEvents) {
            if (/^workspaceContains:/.test(activationEvent)) {
                const fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
                if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0 || host.forceUsingSearch) {
                    globPatterns.push(fileNameOrGlob);
                }
                else {
                    fileNames.push(fileNameOrGlob);
                }
            }
        }
        if (fileNames.length === 0 && globPatterns.length === 0) {
            return Promise.resolve(undefined);
        }
        let resolveResult;
        const result = new Promise((resolve, reject) => { resolveResult = resolve; });
        const activate = (activationEvent) => resolveResult({ activationEvent });
        const fileNamePromise = Promise.all(fileNames.map((fileName) => _activateIfFileName(host, fileName, activate))).then(() => { });
        const globPatternPromise = _activateIfGlobPatterns(host, desc.identifier, globPatterns, activate);
        Promise.all([fileNamePromise, globPatternPromise]).then(() => {
            // when all are done, resolve with undefined (relevant only if it was not activated so far)
            resolveResult(undefined);
        });
        return result;
    }
    exports.checkActivateWorkspaceContainsExtension = checkActivateWorkspaceContainsExtension;
    async function _activateIfFileName(host, fileName, activate) {
        // find exact path
        for (const uri of host.folders) {
            if (await host.exists(resources.joinPath(uri_1.URI.revive(uri), fileName))) {
                // the file was found
                activate(`workspaceContains:${fileName}`);
                return;
            }
        }
    }
    async function _activateIfGlobPatterns(host, extensionId, globPatterns, activate) {
        if (globPatterns.length === 0) {
            return Promise.resolve(undefined);
        }
        const tokenSource = new cancellation_1.CancellationTokenSource();
        const searchP = host.checkExists(host.folders, globPatterns, tokenSource.token);
        const timer = setTimeout(async () => {
            tokenSource.cancel();
            host.logService.info(`Not activating extension '${extensionId.value}': Timed out while searching for 'workspaceContains' pattern ${globPatterns.join(',')}`);
        }, WORKSPACE_CONTAINS_TIMEOUT);
        let exists = false;
        try {
            exists = await searchP;
        }
        catch (err) {
            if (!errors.isCancellationError(err)) {
                errors.onUnexpectedError(err);
            }
        }
        tokenSource.dispose();
        clearTimeout(timer);
        if (exists) {
            // a file was found matching one of the glob patterns
            activate(`workspaceContains:${globPatterns.join(',')}`);
        }
    }
    function checkGlobFileExists(accessor, folders, includes, token) {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const searchService = accessor.get(search_1.ISearchService);
        const queryBuilder = instantiationService.createInstance(queryBuilder_1.QueryBuilder);
        const query = queryBuilder.file(folders.map(folder => (0, workspace_1.toWorkspaceFolder)(uri_1.URI.revive(folder))), {
            _reason: 'checkExists',
            includePattern: includes,
            exists: true
        });
        return searchService.fileSearch(query, token).then(result => {
            return !!result.limitHit;
        }, err => {
            if (!errors.isCancellationError(err)) {
                return Promise.reject(err);
            }
            return false;
        });
    }
    exports.checkGlobFileExists = checkGlobFileExists;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlQ29udGFpbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9ucy9jb21tb24vd29ya3NwYWNlQ29udGFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDO0lBZXhDLFNBQWdCLHVDQUF1QyxDQUFDLElBQThCLEVBQUUsSUFBMkI7UUFDbEgsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDL0MsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3RCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNsQztRQUVELE1BQU0sU0FBUyxHQUFhLEVBQUUsQ0FBQztRQUMvQixNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFFbEMsS0FBSyxNQUFNLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRTtZQUMvQyxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQ2xHLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7aUJBQ2xDO3FCQUFNO29CQUNOLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7aUJBQy9CO2FBQ0Q7U0FDRDtRQUVELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksWUFB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