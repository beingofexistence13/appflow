define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/replaceService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, extensions_1, replace_1, replaceService_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$Mb = void 0;
    function $$Mb() {
        (0, extensions_1.$mr)(replace_1.$8Mb, replaceService_1.$0Mb, 1 /* InstantiationType.Delayed */);
        platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(replaceService_1.$9Mb, 1 /* LifecyclePhase.Starting */);
    }
    exports.$$Mb = $$Mb;
});
//# sourceMappingURL=replaceContributions.js.map