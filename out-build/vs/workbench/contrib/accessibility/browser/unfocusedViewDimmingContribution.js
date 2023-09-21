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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/platform/configuration/common/configuration"], function (require, exports, event_1, lifecycle_1, numbers_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$S1b = void 0;
    let $S1b = class $S1b extends lifecycle_1.$kc {
        constructor(configurationService) {
            super();
            this.B((0, lifecycle_1.$ic)(() => this.c()));
            this.B(event_1.Event.runAndSubscribe(configurationService.onDidChangeConfiguration, e => {
                if (e && !e.affectsConfiguration("accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */) && !e.affectsConfiguration("accessibility.dimUnfocused.opacity" /* AccessibilityWorkbenchSettingId.DimUnfocusedOpacity */)) {
                    return;
                }
                let cssTextContent = '';
                const enabled = ensureBoolean(configurationService.getValue("accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */), false);
                if (enabled) {
                    const opacity = (0, numbers_1.$Hl)(ensureNumber(configurationService.getValue("accessibility.dimUnfocused.opacity" /* AccessibilityWorkbenchSettingId.DimUnfocusedOpacity */), 0.75 /* ViewDimUnfocusedOpacityProperties.Default */), 0.2 /* ViewDimUnfocusedOpacityProperties.Minimum */, 1 /* ViewDimUnfocusedOpacityProperties.Maximum */);
                    if (opacity !== 1) {
                        // These filter rules are more specific than may be expected as the `filter`
                        // rule can cause problems if it's used inside the element like on editor hovers
                        const rules = new Set();
                        const filterRule = `filter: opacity(${opacity});`;
                        // Terminal tabs
                        rules.add(`.monaco-workbench .pane-body.integrated-terminal:not(:focus-within) .tabs-container { ${filterRule} }`);
                        // Terminals
                        rules.add(`.monaco-workbench .pane-body.integrated-terminal .terminal-wrapper:not(:focus-within) { ${filterRule} }`);
                        // Text editors
                        rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .monaco-editor { ${filterRule} }`);
                        // Breadcrumbs
                        rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .breadcrumbs-below-tabs { ${filterRule} }`);
                        // Terminal editors
                        rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .terminal-wrapper { ${filterRule} }`);
                        // Settings editor
                        rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .settings-editor { ${filterRule} }`);
                        // Keybindings editor
                        rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .keybindings-editor { ${filterRule} }`);
                        // Editor placeholder (error case)
                        rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .monaco-editor-pane-placeholder { ${filterRule} }`);
                        // Welcome editor
                        rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .gettingStartedContainer { ${filterRule} }`);
                        cssTextContent = [...rules].join('\n');
                    }
                }
                if (cssTextContent.length === 0) {
                    this.c();
                }
                else {
                    this.b().textContent = cssTextContent;
                }
            }));
        }
        b() {
            if (!this.a) {
                this.a = document.createElement('style');
                this.a.className = 'accessibilityUnfocusedViewOpacity';
                document.head.appendChild(this.a);
            }
            return this.a;
        }
        c() {
            this.a?.remove();
            this.a = undefined;
        }
    };
    exports.$S1b = $S1b;
    exports.$S1b = $S1b = __decorate([
        __param(0, configuration_1.$8h)
    ], $S1b);
    function ensureBoolean(value, defaultValue) {
        return typeof value === 'boolean' ? value : defaultValue;
    }
    function ensureNumber(value, defaultValue) {
        return typeof value === 'number' ? value : defaultValue;
    }
});
//# sourceMappingURL=unfocusedViewDimmingContribution.js.map