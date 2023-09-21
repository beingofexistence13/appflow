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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/contrib/preferences/common/smartSnippetInserter", "vs/workbench/contrib/preferences/browser/keybindingWidgets", "vs/base/common/json", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/platform/theme/common/themeService", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/model", "vs/base/common/keybindingParser", "vs/base/common/types", "vs/base/common/resources", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/preferences/common/preferences"], function (require, exports, nls, async_1, htmlContent_1, lifecycle_1, keybinding_1, instantiation_1, range_1, editorExtensions_1, snippetController2_1, smartSnippetInserter_1, keybindingWidgets_1, json_1, windowsKeyboardMapper_1, themeService_1, editorColorRegistry_1, model_1, keybindingParser_1, types_1, resources_1, userDataProfile_1, preferences_1) {
    "use strict";
    var KeybindingEditorDecorationsRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingEditorDecorationsRenderer = void 0;
    const NLS_KB_LAYOUT_ERROR_MESSAGE = nls.localize('defineKeybinding.kbLayoutErrorMessage', "You won't be able to produce this key combination under your current keyboard layout.");
    let DefineKeybindingEditorContribution = class DefineKeybindingEditorContribution extends lifecycle_1.Disposable {
        constructor(_editor, _instantiationService, _userDataProfileService) {
            super();
            this._editor = _editor;
            this._instantiationService = _instantiationService;
            this._userDataProfileService = _userDataProfileService;
            this._keybindingDecorationRenderer = this._register(new lifecycle_1.MutableDisposable());
            this._defineWidget = this._register(this._instantiationService.createInstance(keybindingWidgets_1.DefineKeybindingOverlayWidget, this._editor));
            this._register(this._editor.onDidChangeModel(e => this._update()));
            this._update();
        }
        _update() {
            this._keybindingDecorationRenderer.value = isInterestingEditorModel(this._editor, this._userDataProfileService)
                // Decorations are shown for the default keybindings.json **and** for the user keybindings.json
                ? this._instantiationService.createInstance(KeybindingEditorDecorationsRenderer, this._editor)
                : undefined;
        }
        showDefineKeybindingWidget() {
            if (isInterestingEditorModel(this._editor, this._userDataProfileService)) {
                this._defineWidget.start().then(keybinding => this._onAccepted(keybinding));
            }
        }
        _onAccepted(keybinding) {
            this._editor.focus();
            if (keybinding && this._editor.hasModel()) {
                const regexp = new RegExp(/\\/g);
                const backslash = regexp.test(keybinding);
                if (backslash) {
                    keybinding = keybinding.slice(0, -1) + '\\\\';
                }
                let snippetText = [
                    '{',
                    '\t"key": ' + JSON.stringify(keybinding) + ',',
                    '\t"command": "${1:commandId}",',
                    '\t"when": "${2:editorTextFocus}"',
                    '}$0'
                ].join('\n');
                const smartInsertInfo = smartSnippetInserter_1.SmartSnippetInserter.insertSnippet(this._editor.getModel(), this._editor.getPosition());
                snippetText = smartInsertInfo.prepend + snippetText + smartInsertInfo.append;
                this._editor.setPosition(smartInsertInfo.position);
                snippetController2_1.SnippetController2.get(this._editor)?.insert(snippetText, { overwriteBefore: 0, overwriteAfter: 0 });
            }
        }
    };
    DefineKeybindingEditorContribution = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, userDataProfile_1.IUserDataProfileService)
    ], DefineKeybindingEditorContribution);
    let KeybindingEditorDecorationsRenderer = KeybindingEditorDecorationsRenderer_1 = class KeybindingEditorDecorationsRenderer extends lifecycle_1.Disposable {
        constructor(_editor, _keybindingService) {
            super();
            this._editor = _editor;
            this._keybindingService = _keybindingService;
            this._dec = this._editor.createDecorationsCollection();
            this._updateDecorations = this._register(new async_1.RunOnceScheduler(() => this._updateDecorationsNow(), 500));
            const model = (0, types_1.assertIsDefined)(this._editor.getModel());
            this._register(model.onDidChangeContent(() => this._updateDecorations.schedule()));
            this._register(this._keybindingService.onDidUpdateKeybindings(() => this._updateDecorations.schedule()));
            this._register({
                dispose: () => {
                    this._dec.clear();
                    this._updateDecorations.cancel();
                }
            });
            this._updateDecorations.schedule();
        }
        _updateDecorationsNow() {
            const model = (0, types_1.assertIsDefined)(this._editor.getModel());
            const newDecorations = [];
            const root = (0, json_1.parseTree)(model.getValue());
            if (root && Array.isArray(root.children)) {
                for (let i = 0, len = root.children.length; i < len; i++) {
                    const entry = root.children[i];
                    const dec = this._getDecorationForEntry(model, entry);
                    if (dec !== null) {
                        newDecorations.push(dec);
                    }
                }
            }
            this._dec.set(newDecorations);
        }
        _getDecorationForEntry(model, entry) {
            if (!Array.isArray(entry.children)) {
                return null;
            }
            for (let i = 0, len = entry.children.length; i < len; i++) {
                const prop = entry.children[i];
                if (prop.type !== 'property') {
                    continue;
                }
                if (!Array.isArray(prop.children) || prop.children.length !== 2) {
                    continue;
                }
                const key = prop.children[0];
                if (key.value !== 'key') {
                    continue;
                }
                const value = prop.children[1];
                if (value.type !== 'string') {
                    continue;
                }
                const resolvedKeybindings = this._keybindingService.resolveUserBinding(value.value);
                if (resolvedKeybindings.length === 0) {
                    return this._createDecoration(true, null, null, model, value);
                }
                const resolvedKeybinding = resolvedKeybindings[0];
                let usLabel = null;
                if (resolvedKeybinding instanceof windowsKeyboardMapper_1.WindowsNativeResolvedKeybinding) {
                    usLabel = resolvedKeybinding.getUSLabel();
                }
                if (!resolvedKeybinding.isWYSIWYG()) {
                    const uiLabel = resolvedKeybinding.getLabel();
                    if (typeof uiLabel === 'string' && value.value.toLowerCase() === uiLabel.toLowerCase()) {
                        // coincidentally, this is actually WYSIWYG
                        return null;
                    }
                    return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
                }
                if (/abnt_|oem_/.test(value.value)) {
                    return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
                }
                const expectedUserSettingsLabel = resolvedKeybinding.getUserSettingsLabel();
                if (typeof expectedUserSettingsLabel === 'string' && !KeybindingEditorDecorationsRenderer_1._userSettingsFuzzyEquals(value.value, expectedUserSettingsLabel)) {
                    return this._createDecoration(false, resolvedKeybinding.getLabel(), usLabel, model, value);
                }
                return null;
            }
            return null;
        }
        static _userSettingsFuzzyEquals(a, b) {
            a = a.trim().toLowerCase();
            b = b.trim().toLowerCase();
            if (a === b) {
                return true;
            }
            const aKeybinding = keybindingParser_1.KeybindingParser.parseKeybinding(a);
            const bKeybinding = keybindingParser_1.KeybindingParser.parseKeybinding(b);
            if (aKeybinding === null && bKeybinding === null) {
                return true;
            }
            if (!aKeybinding || !bKeybinding) {
                return false;
            }
            return aKeybinding.equals(bKeybinding);
        }
        _createDecoration(isError, uiLabel, usLabel, model, keyNode) {
            let msg;
            let className;
            let overviewRulerColor;
            if (isError) {
                // this is the error case
                msg = new htmlContent_1.MarkdownString().appendText(NLS_KB_LAYOUT_ERROR_MESSAGE);
                className = 'keybindingError';
                overviewRulerColor = (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerError);
            }
            else {
                // this is the info case
                if (usLabel && uiLabel !== usLabel) {
                    msg = new htmlContent_1.MarkdownString(nls.localize({
                        key: 'defineKeybinding.kbLayoutLocalAndUSMessage',
                        comment: [
                            'Please translate maintaining the stars (*) around the placeholders such that they will be rendered in bold.',
                            'The placeholders will contain a keyboard combination e.g. Ctrl+Shift+/'
                        ]
                    }, "**{0}** for your current keyboard layout (**{1}** for US standard).", uiLabel, usLabel));
                }
                else {
                    msg = new htmlContent_1.MarkdownString(nls.localize({
                        key: 'defineKeybinding.kbLayoutLocalMessage',
                        comment: [
                            'Please translate maintaining the stars (*) around the placeholder such that it will be rendered in bold.',
                            'The placeholder will contain a keyboard combination e.g. Ctrl+Shift+/'
                        ]
                    }, "**{0}** for your current keyboard layout.", uiLabel));
                }
                className = 'keybindingInfo';
                overviewRulerColor = (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerInfo);
            }
            const startPosition = model.getPositionAt(keyNode.offset);
            const endPosition = model.getPositionAt(keyNode.offset + keyNode.length);
            const range = new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
            // icon + highlight + message decoration
            return {
                range: range,
                options: {
                    description: 'keybindings-widget',
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                    className: className,
                    hoverMessage: msg,
                    overviewRuler: {
                        color: overviewRulerColor,
                        position: model_1.OverviewRulerLane.Right
                    }
                }
            };
        }
    };
    exports.KeybindingEditorDecorationsRenderer = KeybindingEditorDecorationsRenderer;
    exports.KeybindingEditorDecorationsRenderer = KeybindingEditorDecorationsRenderer = KeybindingEditorDecorationsRenderer_1 = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], KeybindingEditorDecorationsRenderer);
    function isInterestingEditorModel(editor, userDataProfileService) {
        const model = editor.getModel();
        if (!model) {
            return false;
        }
        return (0, resources_1.isEqual)(model.uri, userDataProfileService.currentProfile.keybindingsResource);
    }
    (0, editorExtensions_1.registerEditorContribution)(preferences_1.DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, DefineKeybindingEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3NFZGl0b3JDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9icm93c2VyL2tleWJpbmRpbmdzRWRpdG9yQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLE1BQU0sMkJBQTJCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsRUFBRSx1RkFBdUYsQ0FBQyxDQUFDO0lBRW5MLElBQU0sa0NBQWtDLEdBQXhDLE1BQU0sa0NBQW1DLFNBQVEsc0JBQVU7UUFNMUQsWUFDUyxPQUFvQixFQUNMLHFCQUE2RCxFQUMzRCx1QkFBaUU7WUFFMUYsS0FBSyxFQUFFLENBQUM7WUFKQSxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQ1ksMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUMxQyw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBUG5GLGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBdUMsQ0FBQyxDQUFDO1lBV3BILElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLGlEQUE2QixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzVILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxPQUFPO1lBQ2QsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssR0FBRyx3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