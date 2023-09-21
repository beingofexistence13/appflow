define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/search/browser/replace", "vs/workbench/contrib/search/browser/replaceService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, extensions_1, replace_1, replaceService_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContributions = void 0;
    function registerContributions() {
        (0, extensions_1.registerSingleton)(replace_1.IReplaceService, replaceService_1.ReplaceService, 1 /* InstantiationType.Delayed */);
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(replaceService_1.ReplacePreviewContentProvider, 1 /* LifecyclePhase.Starting */);
    }
    exports.registerContributions = registerContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZUNvbnRyaWJ1dGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvYnJvd3Nlci9yZXBsYWNlQ29udHJpYnV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBV0EsU0FBZ0IscUJBQXFCO1FBQ3BDLElBQUEsOEJBQWlCLEVBQUMseUJBQWUsRUFBRSwrQkFBYyxvQ0FBNEIsQ0FBQztRQUM5RSxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsOENBQTZCLGtDQUEwQixDQUFDO0lBQ25LLENBQUM7SUFIRCxzREFHQyJ9