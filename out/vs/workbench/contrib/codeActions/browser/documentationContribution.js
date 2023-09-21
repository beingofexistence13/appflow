/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/common/types", "vs/platform/contextkey/common/contextkey"], function (require, exports, lifecycle_1, languageFeatures_1, types_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionDocumentationContribution = void 0;
    let CodeActionDocumentationContribution = class CodeActionDocumentationContribution extends lifecycle_1.Disposable {
        constructor(extensionPoint, contextKeyService, languageFeaturesService) {
            super();
            this.contextKeyService = contextKeyService;
            this.contributions = [];
            this.emptyCodeActionsList = {
                actions: [],
                dispose: () => { }
            };
            this._register(languageFeaturesService.codeActionProvider.register('*', this));
            extensionPoint.setHandler(points => {
                this.contributions = [];
                for (const documentation of points) {
                    if (!documentation.value.refactoring) {
                        continue;
                    }
                    for (const contribution of documentation.value.refactoring) {
                        const precondition = contextkey_1.ContextKeyExpr.deserialize(contribution.when);
                        if (!precondition) {
                            continue;
                        }
                        this.contributions.push({
                            title: contribution.title,
                            when: precondition,
                            command: contribution.command
                        });
                    }
                }
            });
        }
        async provideCodeActions(_model, _range, context, _token) {
            return this.emptyCodeActionsList;
        }
        _getAdditionalMenuItems(context, actions) {
            if (context.only !== types_1.CodeActionKind.Refactor.value) {
                if (!actions.some(action => action.kind && types_1.CodeActionKind.Refactor.contains(new types_1.CodeActionKind(action.kind)))) {
                    return [];
                }
            }
            return this.contributions
                .filter(contribution => this.contextKeyService.contextMatchesRules(contribution.when))
                .map(contribution => {
                return {
                    id: contribution.command,
                    title: contribution.title
                };
            });
        }
    };
    exports.CodeActionDocumentationContribution = CodeActionDocumentationContribution;
    exports.CodeActionDocumentationContribution = CodeActionDocumentationContribution = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], CodeActionDocumentationContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRhdGlvbkNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVBY3Rpb25zL2Jyb3dzZXIvZG9jdW1lbnRhdGlvbkNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQnpGLElBQU0sbUNBQW1DLEdBQXpDLE1BQU0sbUNBQW9DLFNBQVEsc0JBQVU7UUFhbEUsWUFDQyxjQUE0RCxFQUN4QyxpQkFBc0QsRUFDaEQsdUJBQWlEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBSDZCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFibkUsa0JBQWEsR0FJZixFQUFFLENBQUM7WUFFUSx5QkFBb0IsR0FBRztnQkFDdkMsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7YUFDbEIsQ0FBQztZQVNELElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRS9FLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO2dCQUN4QixLQUFLLE1BQU0sYUFBYSxJQUFJLE1BQU0sRUFBRTtvQkFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFO3dCQUNyQyxTQUFTO3FCQUNUO29CQUVELEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUU7d0JBQzNELE1BQU0sWUFBWSxHQUFHLDJCQUFjLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDbkUsSUFBSSxDQUFDLFlBQVksRUFBRTs0QkFDbEIsU0FBUzt5QkFDVDt3QkFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQzs0QkFDdkIsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLOzRCQUN6QixJQUFJLEVBQUUsWUFBWTs0QkFDbEIsT0FBTyxFQUFFLFlBQVksQ0FBQyxPQUFPO3lCQUM3QixDQUFDLENBQUM7cUJBRUg7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBa0IsRUFBRSxNQUF5QixFQUFFLE9BQW9DLEVBQUUsTUFBeUI7WUFDdEksT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7UUFDbEMsQ0FBQztRQUVNLHVCQUF1QixDQUFDLE9BQW9DLEVBQUUsT0FBd0M7WUFDNUcsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLHNCQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtnQkFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLHNCQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLHNCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDOUcsT0FBTyxFQUFFLENBQUM7aUJBQ1Y7YUFDRDtZQUVELE9BQU8sSUFBSSxDQUFDLGFBQWE7aUJBQ3ZCLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3JGLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDbkIsT0FBTztvQkFDTixFQUFFLEVBQUUsWUFBWSxDQUFDLE9BQU87b0JBQ3hCLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztpQkFDekIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNELENBQUE7SUFsRVksa0ZBQW1DO2tEQUFuQyxtQ0FBbUM7UUFlN0MsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLDJDQUF3QixDQUFBO09BaEJkLG1DQUFtQyxDQWtFL0MifQ==