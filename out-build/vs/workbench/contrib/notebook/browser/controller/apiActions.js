/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, glob, uri_1, commands_1, notebookCommon_1, notebookKernelService_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    commands_1.$Gr.registerCommand('_resolveNotebookContentProvider', (accessor) => {
        const notebookService = accessor.get(notebookService_1.$ubb);
        const contentProviders = notebookService.getContributedNotebookTypes();
        return contentProviders.map(provider => {
            const filenamePatterns = provider.selectors.map(selector => {
                if (typeof selector === 'string') {
                    return selector;
                }
                if (glob.$sj(selector)) {
                    return selector;
                }
                if ((0, notebookCommon_1.$5H)(selector)) {
                    return {
                        include: selector.include,
                        exclude: selector.exclude
                    };
                }
                return null;
            }).filter(pattern => pattern !== null);
            return {
                viewType: provider.id,
                displayName: provider.displayName,
                filenamePattern: filenamePatterns,
                options: {
                    transientCellMetadata: provider.options.transientCellMetadata,
                    transientDocumentMetadata: provider.options.transientDocumentMetadata,
                    transientOutputs: provider.options.transientOutputs
                }
            };
        });
    });
    commands_1.$Gr.registerCommand('_resolveNotebookKernels', async (accessor, args) => {
        const notebookKernelService = accessor.get(notebookKernelService_1.$Bbb);
        const uri = uri_1.URI.revive(args.uri);
        const kernels = notebookKernelService.getMatchingKernel({ uri, viewType: args.viewType });
        return kernels.all.map(provider => ({
            id: provider.id,
            label: provider.label,
            description: provider.description,
            detail: provider.detail,
            isPreferred: false,
            preloads: provider.preloadUris,
        }));
    });
});
//# sourceMappingURL=apiActions.js.map