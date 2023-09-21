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
define(["require", "exports", "vs/base/common/lazy", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/platform/keybinding/common/keybinding"], function (require, exports, lazy_1, codeAction_1, types_1, keybinding_1) {
    "use strict";
    var CodeActionKeybindingResolver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionKeybindingResolver = void 0;
    let CodeActionKeybindingResolver = class CodeActionKeybindingResolver {
        static { CodeActionKeybindingResolver_1 = this; }
        static { this.codeActionCommands = [
            codeAction_1.refactorCommandId,
            codeAction_1.codeActionCommandId,
            codeAction_1.sourceActionCommandId,
            codeAction_1.organizeImportsCommandId,
            codeAction_1.fixAllCommandId
        ]; }
        constructor(keybindingService) {
            this.keybindingService = keybindingService;
        }
        getResolver() {
            // Lazy since we may not actually ever read the value
            const allCodeActionBindings = new lazy_1.Lazy(() => this.keybindingService.getKeybindings()
                .filter(item => CodeActionKeybindingResolver_1.codeActionCommands.indexOf(item.command) >= 0)
                .filter(item => item.resolvedKeybinding)
                .map((item) => {
                // Special case these commands since they come built-in with VS Code and don't use 'commandArgs'
                let commandArgs = item.commandArgs;
                if (item.command === codeAction_1.organizeImportsCommandId) {
                    commandArgs = { kind: types_1.CodeActionKind.SourceOrganizeImports.value };
                }
                else if (item.command === codeAction_1.fixAllCommandId) {
                    commandArgs = { kind: types_1.CodeActionKind.SourceFixAll.value };
                }
                return {
                    resolvedKeybinding: item.resolvedKeybinding,
                    ...types_1.CodeActionCommandArgs.fromUser(commandArgs, {
                        kind: types_1.CodeActionKind.None,
                        apply: "never" /* CodeActionAutoApply.Never */
                    })
                };
            }));
            return (action) => {
                if (action.kind) {
                    const binding = this.bestKeybindingForCodeAction(action, allCodeActionBindings.value);
                    return binding?.resolvedKeybinding;
                }
                return undefined;
            };
        }
        bestKeybindingForCodeAction(action, candidates) {
            if (!action.kind) {
                return undefined;
            }
            const kind = new types_1.CodeActionKind(action.kind);
            return candidates
                .filter(candidate => candidate.kind.contains(kind))
                .filter(candidate => {
                if (candidate.preferred) {
                    // If the candidate keybinding only applies to preferred actions, the this action must also be preferred
                    return action.isPreferred;
                }
                return true;
            })
                .reduceRight((currentBest, candidate) => {
                if (!currentBest) {
                    return candidate;
                }
                // Select the more specific binding
                return currentBest.kind.contains(candidate.kind) ? candidate : currentBest;
            }, undefined);
        }
    };
    exports.CodeActionKeybindingResolver = CodeActionKeybindingResolver;
    exports.CodeActionKeybindingResolver = CodeActionKeybindingResolver = CodeActionKeybindingResolver_1 = __decorate([
        __param(0, keybinding_1.IKeybindingService)
    ], CodeActionKeybindingResolver);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbktleWJpbmRpbmdSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvZGVBY3Rpb24vYnJvd3Nlci9jb2RlQWN0aW9uS2V5YmluZGluZ1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFlekYsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNEI7O2lCQUNoQix1QkFBa0IsR0FBc0I7WUFDL0QsOEJBQWlCO1lBQ2pCLGdDQUFtQjtZQUNuQixrQ0FBcUI7WUFDckIscUNBQXdCO1lBQ3hCLDRCQUFlO1NBQ2YsQUFOeUMsQ0FNeEM7UUFFRixZQUNzQyxpQkFBcUM7WUFBckMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtRQUN2RSxDQUFDO1FBRUUsV0FBVztZQUNqQixxREFBcUQ7WUFDckQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLFdBQUksQ0FBeUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRTtpQkFDMUgsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsOEJBQTRCLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztpQkFDdkMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUErQixFQUFFO2dCQUMxQyxnR0FBZ0c7Z0JBQ2hHLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ25DLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxxQ0FBd0IsRUFBRTtvQkFDOUMsV0FBVyxHQUFHLEVBQUUsSUFBSSxFQUFFLHNCQUFjLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ25FO3FCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyw0QkFBZSxFQUFFO29CQUM1QyxXQUFXLEdBQUcsRUFBRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQzFEO2dCQUVELE9BQU87b0JBQ04sa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFtQjtvQkFDNUMsR0FBRyw2QkFBcUIsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFO3dCQUM5QyxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxJQUFJO3dCQUN6QixLQUFLLHlDQUEyQjtxQkFDaEMsQ0FBQztpQkFDRixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVMLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDakIsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO29CQUNoQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxFQUFFLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN0RixPQUFPLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQztpQkFDbkM7Z0JBQ0QsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQyxDQUFDO1FBQ0gsQ0FBQztRQUVPLDJCQUEyQixDQUNsQyxNQUFrQixFQUNsQixVQUFrRDtZQUVsRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDakIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLHNCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdDLE9BQU8sVUFBVTtpQkFDZixNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNuQixJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7b0JBQ3hCLHdHQUF3RztvQkFDeEcsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDO2lCQUMxQjtnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQztpQkFDRCxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtnQkFDRCxtQ0FBbUM7Z0JBQ25DLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUM1RSxDQUFDLEVBQUUsU0FBb0QsQ0FBQyxDQUFDO1FBQzNELENBQUM7O0lBdEVXLG9FQUE0QjsyQ0FBNUIsNEJBQTRCO1FBVXRDLFdBQUEsK0JBQWtCLENBQUE7T0FWUiw0QkFBNEIsQ0F1RXhDIn0=