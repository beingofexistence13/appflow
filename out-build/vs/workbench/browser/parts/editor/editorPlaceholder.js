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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorPlaceholder", "vs/base/common/severity", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/theme/common/themeService", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/platform/editor/common/editor", "vs/workbench/browser/editor", "vs/base/browser/ui/button/button", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/platform/files/common/files", "vs/base/common/errorMessage", "vs/platform/dialogs/common/dialogs", "vs/base/common/strings", "vs/css!./media/editorplaceholder"], function (require, exports, nls_1, severity_1, editor_1, editorPane_1, telemetry_1, scrollableElement_1, themeService_1, dom_1, lifecycle_1, storage_1, types_1, commands_1, workspace_1, editor_2, editor_3, button_1, defaultStyles_1, simpleIconLabel_1, files_1, errorMessage_1, dialogs_1, strings_1) {
    "use strict";
    var $Gvb_1, $Hvb_1, $Ivb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ivb = exports.$Hvb = exports.$Gvb = void 0;
    let $Gvb = class $Gvb extends editorPane_1.$0T {
        static { $Gvb_1 = this; }
        static { this.a = 1024; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            this.f = this.B(new lifecycle_1.$lc());
        }
        ab(parent) {
            // Container
            this.b = document.createElement('div');
            this.b.className = 'monaco-editor-pane-placeholder';
            this.b.style.outline = 'none';
            this.b.tabIndex = 0; // enable focus support from the editor part (do not remove)
            // Custom Scrollbars
            this.c = this.B(new scrollableElement_1.$UP(this.b, { horizontal: 1 /* ScrollbarVisibility.Auto */, vertical: 1 /* ScrollbarVisibility.Auto */ }));
            parent.appendChild(this.c.getDomNode());
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            // Check for cancellation
            if (token.isCancellationRequested) {
                return;
            }
            // Render Input
            this.f.value = await this.j(input, options);
        }
        async j(input, options) {
            const [container, scrollbar] = (0, types_1.$vf)(this.b, this.c);
            // Reset any previous contents
            (0, dom_1.$lO)(container);
            // Delegate to implementation for contents
            const disposables = new lifecycle_1.$jc();
            const { icon, label, actions } = await this.m(input, options, disposables);
            const truncatedLabel = (0, strings_1.$se)(label, $Gvb_1.a);
            // Icon
            const iconContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-icon-container'));
            const iconWidget = new simpleIconLabel_1.$LR(iconContainer);
            iconWidget.text = icon;
            // Label
            const labelContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-label-container'));
            const labelWidget = document.createElement('span');
            labelWidget.textContent = truncatedLabel;
            labelContainer.appendChild(labelWidget);
            // ARIA label
            container.setAttribute('aria-label', `${(0, editor_3.$cU)(input, undefined, this.group, undefined)}, ${truncatedLabel}`);
            // Buttons
            if (actions.length) {
                const actionsContainer = container.appendChild((0, dom_1.$)('.editor-placeholder-buttons-container'));
                const buttons = disposables.add(new button_1.$0Q(actionsContainer));
                for (let i = 0; i < actions.length; i++) {
                    const button = disposables.add(buttons.addButton({
                        ...defaultStyles_1.$i2,
                        secondary: i !== 0
                    }));
                    button.label = actions[i].label;
                    disposables.add(button.onDidClick(e => {
                        if (e) {
                            dom_1.$5O.stop(e, true);
                        }
                        actions[i].run();
                    }));
                }
            }
            // Adjust scrollbar
            scrollbar.scanDomNode();
            return disposables;
        }
        clearInput() {
            if (this.b) {
                (0, dom_1.$lO)(this.b);
            }
            this.f.clear();
            super.clearInput();
        }
        layout(dimension) {
            const [container, scrollbar] = (0, types_1.$vf)(this.b, this.c);
            // Pass on to Container
            (0, dom_1.$DO)(container, dimension.width, dimension.height);
            // Adjust scrollbar
            scrollbar.scanDomNode();
            // Toggle responsive class
            container.classList.toggle('max-height-200px', dimension.height <= 200);
        }
        focus() {
            const container = (0, types_1.$uf)(this.b);
            container.focus();
        }
        dispose() {
            this.b?.remove();
            super.dispose();
        }
    };
    exports.$Gvb = $Gvb;
    exports.$Gvb = $Gvb = $Gvb_1 = __decorate([
        __param(1, telemetry_1.$9k),
        __param(2, themeService_1.$gv),
        __param(3, storage_1.$Vo)
    ], $Gvb);
    let $Hvb = class $Hvb extends $Gvb {
        static { $Hvb_1 = this; }
        static { this.ID = 'workbench.editors.workspaceTrustRequiredEditor'; }
        static { this.r = (0, nls_1.localize)(0, null); }
        static { this.DESCRIPTOR = editor_3.$_T.create($Hvb_1, $Hvb_1.ID, $Hvb_1.r); }
        constructor(telemetryService, themeService, s, u, storageService) {
            super($Hvb_1.ID, telemetryService, themeService, storageService);
            this.s = s;
            this.u = u;
        }
        getTitle() {
            return $Hvb_1.r;
        }
        async m() {
            return {
                icon: '$(workspace-untrusted)',
                label: (0, workspace_1.$Lh)((0, workspace_1.$Ph)(this.u.getWorkspace())) ?
                    (0, nls_1.localize)(1, null) :
                    (0, nls_1.localize)(2, null),
                actions: [
                    {
                        label: (0, nls_1.localize)(3, null),
                        run: () => this.s.executeCommand('workbench.trust.manage')
                    }
                ]
            };
        }
    };
    exports.$Hvb = $Hvb;
    exports.$Hvb = $Hvb = $Hvb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, commands_1.$Fr),
        __param(3, workspace_1.$Kh),
        __param(4, storage_1.$Vo)
    ], $Hvb);
    let $Ivb = class $Ivb extends $Gvb {
        static { $Ivb_1 = this; }
        static { this.r = 'workbench.editors.errorEditor'; }
        static { this.s = (0, nls_1.localize)(4, null); }
        static { this.DESCRIPTOR = editor_3.$_T.create($Ivb_1, $Ivb_1.r, $Ivb_1.s); }
        constructor(telemetryService, themeService, storageService, u, y) {
            super($Ivb_1.r, telemetryService, themeService, storageService);
            this.u = u;
            this.y = y;
        }
        async m(input, options, disposables) {
            const resource = input.resource;
            const group = this.group;
            const error = options.error;
            const isFileNotFound = error?.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            // Error Label
            let label;
            if (isFileNotFound) {
                label = (0, nls_1.localize)(5, null);
            }
            else if ((0, editor_1.$6E)(error) && error.forceMessage) {
                label = error.message;
            }
            else if (error) {
                label = (0, nls_1.localize)(6, null, (0, errorMessage_1.$mi)(error));
            }
            else {
                label = (0, nls_1.localize)(7, null);
            }
            // Error Icon
            let icon = '$(error)';
            if ((0, editor_1.$6E)(error)) {
                if (error.forceSeverity === severity_1.default.Info) {
                    icon = '$(info)';
                }
                else if (error.forceSeverity === severity_1.default.Warning) {
                    icon = '$(warning)';
                }
            }
            // Actions
            let actions = undefined;
            if ((0, editor_1.$6E)(error) && error.actions.length > 0) {
                actions = error.actions.map(action => {
                    return {
                        label: action.label,
                        run: () => {
                            const result = action.run();
                            if (result instanceof Promise) {
                                result.catch(error => this.y.error((0, errorMessage_1.$mi)(error)));
                            }
                        }
                    };
                });
            }
            else if (group) {
                actions = [
                    {
                        label: (0, nls_1.localize)(8, null),
                        run: () => group.openEditor(input, { ...options, source: editor_2.EditorOpenSource.USER /* explicit user gesture */ })
                    }
                ];
            }
            // Auto-reload when file is added
            if (group && isFileNotFound && resource && this.u.hasProvider(resource)) {
                disposables.add(this.u.onDidFilesChange(e => {
                    if (e.contains(resource, 1 /* FileChangeType.ADDED */, 0 /* FileChangeType.UPDATED */)) {
                        group.openEditor(input, options);
                    }
                }));
            }
            return { icon, label, actions: actions ?? [] };
        }
    };
    exports.$Ivb = $Ivb;
    exports.$Ivb = $Ivb = $Ivb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, themeService_1.$gv),
        __param(2, storage_1.$Vo),
        __param(3, files_1.$6j),
        __param(4, dialogs_1.$oA)
    ], $Ivb);
});
//# sourceMappingURL=editorPlaceholder.js.map