define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/search/browser/replaceService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/search/common/notebookSearch", "vs/workbench/contrib/search/browser/notebookSearchService"], function (require, exports, extensions_1, replaceService_1, platform_1, contributions_1, notebookSearch_1, notebookSearchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContributions = void 0;
    function registerContributions() {
        (0, extensions_1.registerSingleton)(notebookSearch_1.INotebookSearchService, notebookSearchService_1.NotebookSearchService, 1 /* InstantiationType.Delayed */);
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(replaceService_1.ReplacePreviewContentProvider, 1 /* LifecyclePhase.Starting */);
    }
    exports.registerContributions = registerContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTZWFyY2hDb250cmlidXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvbm90ZWJvb2tTZWFyY2hDb250cmlidXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFZQSxTQUFnQixxQkFBcUI7UUFDcEMsSUFBQSw4QkFBaUIsRUFBQyx1Q0FBc0IsRUFBRSw2Q0FBcUIsb0NBQTRCLENBQUM7UUFDNUYsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLDhDQUE2QixrQ0FBMEIsQ0FBQztJQUNuSyxDQUFDO0lBSEQsc0RBR0MifQ==