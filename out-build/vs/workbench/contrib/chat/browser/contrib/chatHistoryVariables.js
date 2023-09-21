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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/chat/common/chatVariables"], function (require, exports, lifecycle_1, platform_1, contributions_1, chatVariables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ChatHistoryVariables = class ChatHistoryVariables extends lifecycle_1.$kc {
        constructor(chatVariablesService) {
            super();
            this.B(chatVariablesService.registerVariable({ name: 'response', description: '', canTakeArgument: true, hidden: true }, async (message, arg, model, token) => {
                if (!arg) {
                    return undefined;
                }
                const responseNum = parseInt(arg, 10);
                const response = model.getRequests()[responseNum - 1].response;
                if (!response) {
                    return undefined;
                }
                return [{ level: 'full', value: response.response.asString() }];
            }));
        }
    };
    ChatHistoryVariables = __decorate([
        __param(0, chatVariables_1.$DH)
    ], ChatHistoryVariables);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ChatHistoryVariables, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=chatHistoryVariables.js.map