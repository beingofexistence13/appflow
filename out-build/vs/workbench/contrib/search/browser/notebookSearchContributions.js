define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/search/browser/replaceService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/search/common/notebookSearch", "vs/workbench/contrib/search/browser/notebookSearchService"], function (require, exports, extensions_1, replaceService_1, platform_1, contributions_1, notebookSearch_1, notebookSearchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aNb = void 0;
    function $aNb() {
        (0, extensions_1.$mr)(notebookSearch_1.$LMb, notebookSearchService_1.$_Mb, 1 /* InstantiationType.Delayed */);
        platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(replaceService_1.$9Mb, 1 /* LifecyclePhase.Starting */);
    }
    exports.$aNb = $aNb;
});
//# sourceMappingURL=notebookSearchContributions.js.map