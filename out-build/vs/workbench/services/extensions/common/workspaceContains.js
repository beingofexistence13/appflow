/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/cancellation", "vs/base/common/errors", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/search/common/queryBuilder", "vs/workbench/services/search/common/search", "vs/platform/workspace/common/workspace"], function (require, exports, resources, uri_1, cancellation_1, errors, instantiation_1, queryBuilder_1, search_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Alb = exports.$zlb = void 0;
    const WORKSPACE_CONTAINS_TIMEOUT = 7000;
    function $zlb(host, desc) {
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
    exports.$zlb = $zlb;
    async function _activateIfFileName(host, fileName, activate) {
        // find exact path
        for (const uri of host.folders) {
            if (await host.exists(resources.$ig(uri_1.URI.revive(uri), fileName))) {
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
        const tokenSource = new cancellation_1.$pd();
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
            if (!errors.$2(err)) {
                errors.$Y(err);
            }
        }
        tokenSource.dispose();
        clearTimeout(timer);
        if (exists) {
            // a file was found matching one of the glob patterns
            activate(`workspaceContains:${globPatterns.join(',')}`);
        }
    }
    function $Alb(accessor, folders, includes, token) {
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const searchService = accessor.get(search_1.$oI);
        const queryBuilder = instantiationService.createInstance(queryBuilder_1.$AJ);
        const query = queryBuilder.file(folders.map(folder => (0, workspace_1.$Wh)(uri_1.URI.revive(folder))), {
            _reason: 'checkExists',
            includePattern: includes,
            exists: true
        });
        return searchService.fileSearch(query, token).then(result => {
            return !!result.limitHit;
        }, err => {
            if (!errors.$2(err)) {
                return Promise.reject(err);
            }
            return false;
        });
    }
    exports.$Alb = $Alb;
});
//# sourceMappingURL=workspaceContains.js.map