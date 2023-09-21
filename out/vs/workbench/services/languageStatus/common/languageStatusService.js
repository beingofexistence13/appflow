/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/languageFeatureRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation"], function (require, exports, strings_1, languageFeatureRegistry_1, extensions_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ILanguageStatusService = void 0;
    exports.ILanguageStatusService = (0, instantiation_1.createDecorator)('ILanguageStatusService');
    class LanguageStatusServiceImpl {
        constructor() {
            this._provider = new languageFeatureRegistry_1.LanguageFeatureRegistry();
            this.onDidChange = this._provider.onDidChange;
        }
        addStatus(status) {
            return this._provider.register(status.selector, status);
        }
        getLanguageStatus(model) {
            return this._provider.ordered(model).sort((a, b) => {
                let res = b.severity - a.severity;
                if (res === 0) {
                    res = (0, strings_1.compare)(a.source, b.source);
                }
                if (res === 0) {
                    res = (0, strings_1.compare)(a.id, b.id);
                }
                return res;
            });
        }
    }
    (0, extensions_1.registerSingleton)(exports.ILanguageStatusService, LanguageStatusServiceImpl, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTdGF0dXNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2xhbmd1YWdlU3RhdHVzL2NvbW1vbi9sYW5ndWFnZVN0YXR1c1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NuRixRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsd0JBQXdCLENBQUMsQ0FBQztJQWN4RyxNQUFNLHlCQUF5QjtRQUEvQjtZQUlrQixjQUFTLEdBQUcsSUFBSSxpREFBdUIsRUFBbUIsQ0FBQztZQUVuRSxnQkFBVyxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO1FBa0IvRCxDQUFDO1FBaEJBLFNBQVMsQ0FBQyxNQUF1QjtZQUNoQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELGlCQUFpQixDQUFDLEtBQWlCO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQ2xDLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtvQkFDZCxHQUFHLEdBQUcsSUFBQSxpQkFBTyxFQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNsQztnQkFDRCxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7b0JBQ2QsR0FBRyxHQUFHLElBQUEsaUJBQU8sRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDMUI7Z0JBQ0QsT0FBTyxHQUFHLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQUVELElBQUEsOEJBQWlCLEVBQUMsOEJBQXNCLEVBQUUseUJBQXlCLG9DQUE0QixDQUFDIn0=