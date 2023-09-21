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
    var $K1_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$K1 = void 0;
    let $K1 = class $K1 {
        static { $K1_1 = this; }
        static { this.a = [
            codeAction_1.$D1,
            codeAction_1.$A1,
            codeAction_1.$F1,
            codeAction_1.$G1,
            codeAction_1.$H1
        ]; }
        constructor(b) {
            this.b = b;
        }
        getResolver() {
            // Lazy since we may not actually ever read the value
            const allCodeActionBindings = new lazy_1.$T(() => this.b.getKeybindings()
                .filter(item => $K1_1.a.indexOf(item.command) >= 0)
                .filter(item => item.resolvedKeybinding)
                .map((item) => {
                // Special case these commands since they come built-in with VS Code and don't use 'commandArgs'
                let commandArgs = item.commandArgs;
                if (item.command === codeAction_1.$G1) {
                    commandArgs = { kind: types_1.$v1.SourceOrganizeImports.value };
                }
                else if (item.command === codeAction_1.$H1) {
                    commandArgs = { kind: types_1.$v1.SourceFixAll.value };
                }
                return {
                    resolvedKeybinding: item.resolvedKeybinding,
                    ...types_1.$y1.fromUser(commandArgs, {
                        kind: types_1.$v1.None,
                        apply: "never" /* CodeActionAutoApply.Never */
                    })
                };
            }));
            return (action) => {
                if (action.kind) {
                    const binding = this.c(action, allCodeActionBindings.value);
                    return binding?.resolvedKeybinding;
                }
                return undefined;
            };
        }
        c(action, candidates) {
            if (!action.kind) {
                return undefined;
            }
            const kind = new types_1.$v1(action.kind);
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
    exports.$K1 = $K1;
    exports.$K1 = $K1 = $K1_1 = __decorate([
        __param(0, keybinding_1.$2D)
    ], $K1);
});
//# sourceMappingURL=codeActionKeybindingResolver.js.map