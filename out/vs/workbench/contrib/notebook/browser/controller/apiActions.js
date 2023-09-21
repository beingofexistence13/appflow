/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, glob, uri_1, commands_1, notebookCommon_1, notebookKernelService_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    commands_1.CommandsRegistry.registerCommand('_resolveNotebookContentProvider', (accessor) => {
        const notebookService = accessor.get(notebookService_1.INotebookService);
        const contentProviders = notebookService.getContributedNotebookTypes();
        return contentProviders.map(provider => {
            const filenamePatterns = provider.selectors.map(selector => {
                if (typeof selector === 'string') {
                    return selector;
                }
                if (glob.isRelativePattern(selector)) {
                    return selector;
                }
                if ((0, notebookCommon_1.isDocumentExcludePattern)(selector)) {
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
    commands_1.CommandsRegistry.registerCommand('_resolveNotebookKernels', async (accessor, args) => {
        const notebookKernelService = accessor.get(notebookKernelService_1.INotebookKernelService);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJvbGxlci9hcGlBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLFFBQVEsRUFLekUsRUFBRTtRQUNMLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQW1CLGtDQUFnQixDQUFDLENBQUM7UUFDekUsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUN2RSxPQUFPLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN0QyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMxRCxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtvQkFDakMsT0FBTyxRQUFRLENBQUM7aUJBQ2hCO2dCQUVELElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNyQyxPQUFPLFFBQVEsQ0FBQztpQkFDaEI7Z0JBRUQsSUFBSSxJQUFBLHlDQUF3QixFQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUN2QyxPQUFPO3dCQUNOLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTzt3QkFDekIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO3FCQUN6QixDQUFDO2lCQUNGO2dCQUVELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBOEgsQ0FBQztZQUVwSyxPQUFPO2dCQUNOLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRTtnQkFDckIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO2dCQUNqQyxlQUFlLEVBQUUsZ0JBQWdCO2dCQUNqQyxPQUFPLEVBQUU7b0JBQ1IscUJBQXFCLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUI7b0JBQzdELHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMseUJBQXlCO29CQUNyRSxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQjtpQkFDbkQ7YUFDRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILDJCQUFnQixDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBRzVFLEVBT0ksRUFBRTtRQUNOLE1BQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4Q0FBc0IsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sR0FBRyxHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQW9CLENBQUMsQ0FBQztRQUNsRCxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFMUYsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ2YsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1lBQ3JCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztZQUNqQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07WUFDdkIsV0FBVyxFQUFFLEtBQUs7WUFDbEIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxXQUFXO1NBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUMifQ==