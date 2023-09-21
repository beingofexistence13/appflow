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
    exports.$l1b = void 0;
    let $l1b = class $l1b extends lifecycle_1.$kc {
        constructor(extensionPoint, c, languageFeaturesService) {
            super();
            this.c = c;
            this.a = [];
            this.b = {
                actions: [],
                dispose: () => { }
            };
            this.B(languageFeaturesService.codeActionProvider.register('*', this));
            extensionPoint.setHandler(points => {
                this.a = [];
                for (const documentation of points) {
                    if (!documentation.value.refactoring) {
                        continue;
                    }
                    for (const contribution of documentation.value.refactoring) {
                        const precondition = contextkey_1.$Ii.deserialize(contribution.when);
                        if (!precondition) {
                            continue;
                        }
                        this.a.push({
                            title: contribution.title,
                            when: precondition,
                            command: contribution.command
                        });
                    }
                }
            });
        }
        async provideCodeActions(_model, _range, context, _token) {
            return this.b;
        }
        _getAdditionalMenuItems(context, actions) {
            if (context.only !== types_1.$v1.Refactor.value) {
                if (!actions.some(action => action.kind && types_1.$v1.Refactor.contains(new types_1.$v1(action.kind)))) {
                    return [];
                }
            }
            return this.a
                .filter(contribution => this.c.contextMatchesRules(contribution.when))
                .map(contribution => {
                return {
                    id: contribution.command,
                    title: contribution.title
                };
            });
        }
    };
    exports.$l1b = $l1b;
    exports.$l1b = $l1b = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, languageFeatures_1.$hF)
    ], $l1b);
});
//# sourceMappingURL=documentationContribution.js.map