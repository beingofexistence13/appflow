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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorConfiguration", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/arrays", "vs/base/common/event", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files"], function (require, exports, nls_1, platform_1, lifecycle_1, configurationRegistry_1, configuration_1, editorResolverService_1, extensions_1, arrays_1, event_1, environmentService_1, files_1) {
    "use strict";
    var $wxb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wxb = void 0;
    let $wxb = class $wxb extends lifecycle_1.$kc {
        static { $wxb_1 = this; }
        static { this.a = new Set(['terminalEditor']); }
        static { this.b = [
            // List some editor input identifiers that are not
            // registered yet via the editor resolver infrastructure
            {
                id: 'workbench.input.interactive',
                label: (0, nls_1.localize)(0, null),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            },
            {
                id: 'mainThreadWebview-markdown.preview',
                label: (0, nls_1.localize)(1, null),
                priority: editorResolverService_1.RegisteredEditorPriority.builtin
            }
        ]; }
        static { this.c = new Set([
            // List some editor types that the above `AUTO_LOCK_EXTRA_EDITORS`
            // already covers to avoid duplicates.
            'vscode-interactive-input',
            'interactive',
            'vscode.markdown.preview.editor'
        ]); }
        constructor(n, extensionService, r) {
            super();
            this.n = n;
            this.r = r;
            this.f = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            // Editor configurations are getting updated very aggressively
            // (atleast 20 times) while the extensions are getting registered.
            // As such push out the dynamic configuration until after extensions
            // are registered.
            (async () => {
                await extensionService.whenInstalledExtensionsRegistered();
                this.t();
                this.s();
            })();
        }
        s() {
            // Registered editors (debounced to reduce perf overhead)
            event_1.Event.debounce(this.n.onDidChangeEditorRegistrations, (_, e) => e)(() => this.t());
        }
        t() {
            const lockableEditors = [...this.n.getEditors(), ...$wxb_1.b].filter(e => !$wxb_1.c.has(e.id));
            const binaryEditorCandidates = this.n.getEditors().filter(e => e.priority !== editorResolverService_1.RegisteredEditorPriority.exclusive).map(e => e.id);
            // Build config from registered editors
            const autoLockGroupConfiguration = Object.create(null);
            for (const editor of lockableEditors) {
                autoLockGroupConfiguration[editor.id] = {
                    type: 'boolean',
                    default: $wxb_1.a.has(editor.id),
                    description: editor.label
                };
            }
            // Build default config too
            const defaultAutoLockGroupConfiguration = Object.create(null);
            for (const editor of lockableEditors) {
                defaultAutoLockGroupConfiguration[editor.id] = $wxb_1.a.has(editor.id);
            }
            // Register setting for auto locking groups
            const oldAutoLockConfigurationNode = this.g;
            this.g = {
                ...configuration_1.$$y,
                properties: {
                    'workbench.editor.autoLockGroups': {
                        type: 'object',
                        description: (0, nls_1.localize)(2, null),
                        properties: autoLockGroupConfiguration,
                        default: defaultAutoLockGroupConfiguration,
                        additionalProperties: false
                    }
                }
            };
            // Registers setting for default binary editors
            const oldDefaultBinaryEditorConfigurationNode = this.h;
            this.h = {
                ...configuration_1.$$y,
                properties: {
                    'workbench.editor.defaultBinaryEditor': {
                        type: 'string',
                        default: '',
                        // This allows for intellisense autocompletion
                        enum: [...binaryEditorCandidates, ''],
                        description: (0, nls_1.localize)(3, null),
                    }
                }
            };
            // Registers setting for editorAssociations
            const oldEditorAssociationsConfigurationNode = this.j;
            this.j = {
                ...configuration_1.$$y,
                properties: {
                    'workbench.editorAssociations': {
                        type: 'object',
                        markdownDescription: (0, nls_1.localize)(4, null),
                        patternProperties: {
                            '.*': {
                                type: 'string',
                                enum: binaryEditorCandidates,
                            }
                        }
                    }
                }
            };
            // Registers setting for large file confirmation based on environment
            const oldEditorLargeFileConfirmationConfigurationNode = this.m;
            this.m = {
                ...configuration_1.$$y,
                properties: {
                    'workbench.editorLargeFileConfirmation': {
                        type: 'number',
                        default: (0, files_1.$Bk)(this.r.remoteAuthority) / files_1.$Ak.MB,
                        minimum: 1,
                        scope: 4 /* ConfigurationScope.RESOURCE */,
                        markdownDescription: (0, nls_1.localize)(5, null),
                    }
                }
            };
            this.f.updateConfigurations({
                add: [
                    this.g,
                    this.h,
                    this.j,
                    this.m
                ],
                remove: (0, arrays_1.$Fb)([
                    oldAutoLockConfigurationNode,
                    oldDefaultBinaryEditorConfigurationNode,
                    oldEditorAssociationsConfigurationNode,
                    oldEditorLargeFileConfirmationConfigurationNode
                ])
            });
        }
    };
    exports.$wxb = $wxb;
    exports.$wxb = $wxb = $wxb_1 = __decorate([
        __param(0, editorResolverService_1.$pbb),
        __param(1, extensions_1.$MF),
        __param(2, environmentService_1.$hJ)
    ], $wxb);
});
//# sourceMappingURL=editorConfiguration.js.map