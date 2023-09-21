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
define(["require", "exports", "vs/nls!vs/workbench/contrib/issue/common/issue.contribution", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/product/common/productService", "vs/workbench/services/issue/common/issue"], function (require, exports, nls_1, actionCommonCategories_1, actions_1, commands_1, productService_1, issue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$e5b = void 0;
    const OpenIssueReporterActionId = 'workbench.action.openIssueReporter';
    const OpenIssueReporterApiId = 'vscode.openIssueReporter';
    const OpenIssueReporterCommandDescription = {
        description: 'Open the issue reporter and optionally prefill part of the form.',
        args: [
            {
                name: 'options',
                description: 'Data to use to prefill the issue reporter with.',
                isOptional: true,
                schema: {
                    oneOf: [
                        {
                            type: 'string',
                            description: 'The extension id to preselect.'
                        },
                        {
                            type: 'object',
                            properties: {
                                extensionId: {
                                    type: 'string'
                                },
                                issueTitle: {
                                    type: 'string'
                                },
                                issueBody: {
                                    type: 'string'
                                }
                            }
                        }
                    ]
                }
            },
        ]
    };
    let $e5b = class $e5b {
        constructor(productService) {
            if (!productService.reportIssueUrl) {
                return;
            }
            commands_1.$Gr.registerCommand({
                id: OpenIssueReporterActionId,
                handler: function (accessor, args) {
                    const data = typeof args === 'string'
                        ? { extensionId: args }
                        : Array.isArray(args)
                            ? { extensionId: args[0] }
                            : args ?? {};
                    return accessor.get(issue_1.$rtb).openReporter(data);
                },
                description: OpenIssueReporterCommandDescription
            });
            commands_1.$Gr.registerCommand({
                id: OpenIssueReporterApiId,
                handler: function (accessor, args) {
                    const data = typeof args === 'string'
                        ? { extensionId: args }
                        : Array.isArray(args)
                            ? { extensionId: args[0] }
                            : args ?? {};
                    return accessor.get(issue_1.$rtb).openReporter(data);
                },
                description: OpenIssueReporterCommandDescription
            });
            const reportIssue = {
                id: OpenIssueReporterActionId,
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Report Issue...'
                },
                category: actionCommonCategories_1.$Nl.Help
            };
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: reportIssue });
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarHelpMenu, {
                group: '3_feedback',
                command: {
                    id: OpenIssueReporterActionId,
                    title: (0, nls_1.localize)(1, null)
                },
                order: 3
            });
        }
    };
    exports.$e5b = $e5b;
    exports.$e5b = $e5b = __decorate([
        __param(0, productService_1.$kj)
    ], $e5b);
});
//# sourceMappingURL=issue.contribution.js.map