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
    exports.UnfocusedViewDimmingContribution = void 0;
    let UnfocusedViewDimmingContribution = class UnfocusedViewDimmingContribution extends lifecycle_1.Disposable {
        constructor(configurationService) {
            super();
            this._register((0, lifecycle_1.toDisposable)(() => this._removeStyleElement()));
            this._register(event_1.Event.runAndSubscribe(configurationService.onDidChangeConfiguration, e => {
                if (e && !e.affectsConfiguration("accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */) && !e.affectsConfiguration("accessibility.dimUnfocused.opacity" /* AccessibilityWorkbenchSettingId.DimUnfocusedOpacity */)) {
                    return;
                }
                let cssTextContent = '';
                const enabled = ensureBoolean(configurationService.getValue("accessibility.dimUnfocused.enabled" /* AccessibilityWorkbenchSettingId.DimUnfocusedEnabled */), false);
                if (enabled) {
                    const opacity = (0, numbers_1.clamp)(ensureNumber(configurationService.getValue("accessibility.dimUnfocused.opacity" /* AccessibilityWorkbenchSettingId.DimUnfocusedOpacity */), 0.75 /* ViewDimUnfocusedOpacityProperties.Default */), 0.2 /* ViewDimUnfocusedOpacityProperties.Minimum */, 1 /* ViewDimUnfocusedOpacityProperties.Maximum */);
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
                    this._removeStyleElement();
                }
                else {
                    this._getStyleElement().textContent = cssTextContent;
                }
            }));
        }
        _getStyleElement() {
            if (!this._styleElement) {
                this._styleElement = document.createElement('style');
                this._styleElement.className = 'accessibilityUnfocusedViewOpacity';
                document.head.appendChild(this._styleElement);
            }
            return this._styleElement;
        }
        _removeStyleElement() {
            this._styleElement?.remove();
            this._styleElement = undefined;
        }
    };
    exports.UnfocusedViewDimmingContribution = UnfocusedViewDimmingContribution;
    exports.UnfocusedViewDimmingContribution = UnfocusedViewDimmingContribution = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], UnfocusedViewDimmingContribution);
    function ensureBoolean(value, defaultValue) {
        return typeof value === 'boolean' ? value : defaultValue;
    }
    function ensureNumber(value, defaultValue) {
        return typeof value === 'number' ? value : defaultValue;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5mb2N1c2VkVmlld0RpbW1pbmdDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvdW5mb2N1c2VkVmlld0RpbW1pbmdDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU3pGLElBQU0sZ0NBQWdDLEdBQXRDLE1BQU0sZ0NBQWlDLFNBQVEsc0JBQVU7UUFHL0QsWUFDd0Isb0JBQTJDO1lBRWxFLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRS9ELElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDdkYsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLGdHQUFxRCxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixnR0FBcUQsRUFBRTtvQkFDdEssT0FBTztpQkFDUDtnQkFFRCxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7Z0JBRXhCLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLGdHQUFxRCxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN6SCxJQUFJLE9BQU8sRUFBRTtvQkFDWixNQUFNLE9BQU8sR0FBRyxJQUFBLGVBQUssRUFDcEIsWUFBWSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsZ0dBQXFELHVEQUE0Qyx5R0FHM0ksQ0FBQztvQkFFRixJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUU7d0JBQ2xCLDRFQUE0RTt3QkFDNUUsZ0ZBQWdGO3dC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