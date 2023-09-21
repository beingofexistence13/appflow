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
define(["require", "exports", "vs/nls!vs/workbench/contrib/preferences/browser/keybindingsEditorContribution", "vs/base/common/async", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/platform/keybinding/common/keybinding", "vs/platform/instantiation/common/instantiation", "vs/editor/common/core/range", "vs/editor/browser/editorExtensions", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/contrib/preferences/common/smartSnippetInserter", "vs/workbench/contrib/preferences/browser/keybindingWidgets", "vs/base/common/json", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/platform/theme/common/themeService", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/model", "vs/base/common/keybindingParser", "vs/base/common/types", "vs/base/common/resources", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/workbench/services/preferences/common/preferences"], function (require, exports, nls, async_1, htmlContent_1, lifecycle_1, keybinding_1, instantiation_1, range_1, editorExtensions_1, snippetController2_1, smartSnippetInserter_1, keybindingWidgets_1, json_1, windowsKeyboardMapper_1, themeService_1, editorColorRegistry_1, model_1, keybindingParser_1, types_1, resources_1, userDataProfile_1, preferences_1) {
    "use strict";
    var $bEb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bEb = void 0;
    const NLS_KB_LAYOUT_ERROR_MESSAGE = nls.localize(0, null);
    let DefineKeybindingEditorContribution = class DefineKeybindingEditorContribution extends lifecycle_1.$kc {
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.c = this.B(new lifecycle_1.$lc());
            this.f = this.B(this.h.createInstance(keybindingWidgets_1.$aCb, this.g));
            this.B(this.g.onDidChangeModel(e => this.m()));
            this.m();
        }
        m() {
            this.c.value = isInterestingEditorModel(this.g, this.j)
                // Decorations are shown for the default keybindings.json **and** for the user keybindings.json
                ? this.h.createInstance($bEb, this.g)
                : undefined;
        }
        showDefineKeybindingWidget() {
            if (isInterestingEditorModel(this.g, this.j)) {
                this.f.start().then(keybinding => this.n(keybinding));
            }
        }
        n(keybinding) {
            this.g.focus();
            if (keybinding && this.g.hasModel()) {
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
                const smartInsertInfo = smartSnippetInserter_1.$0Db.insertSnippet(this.g.getModel(), this.g.getPosition());
                snippetText = smartInsertInfo.prepend + snippetText + smartInsertInfo.append;
                this.g.setPosition(smartInsertInfo.position);
                snippetController2_1.$05.get(this.g)?.insert(snippetText, { overwriteBefore: 0, overwriteAfter: 0 });
            }
        }
    };
    DefineKeybindingEditorContribution = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, userDataProfile_1.$CJ)
    ], DefineKeybindingEditorContribution);
    let $bEb = $bEb_1 = class $bEb extends lifecycle_1.$kc {
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.f = this.g.createDecorationsCollection();
            this.c = this.B(new async_1.$Sg(() => this.j(), 500));
            const model = (0, types_1.$uf)(this.g.getModel());
            this.B(model.onDidChangeContent(() => this.c.schedule()));
            this.B(this.h.onDidUpdateKeybindings(() => this.c.schedule()));
            this.B({
                dispose: () => {
                    this.f.clear();
                    this.c.cancel();
                }
            });
            this.c.schedule();
        }
        j() {
            const model = (0, types_1.$uf)(this.g.getModel());
            const newDecorations = [];
            const root = (0, json_1.$Mm)(model.getValue());
            if (root && Array.isArray(root.children)) {
                for (let i = 0, len = root.children.length; i < len; i++) {
                    const entry = root.children[i];
                    const dec = this.m(model, entry);
                    if (dec !== null) {
                        newDecorations.push(dec);
                    }
                }
            }
            this.f.set(newDecorations);
        }
        m(model, entry) {
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
                const resolvedKeybindings = this.h.resolveUserBinding(value.value);
                if (resolvedKeybindings.length === 0) {
                    return this.n(true, null, null, model, value);
                }
                const resolvedKeybinding = resolvedKeybindings[0];
                let usLabel = null;
                if (resolvedKeybinding instanceof windowsKeyboardMapper_1.$_Db) {
                    usLabel = resolvedKeybinding.getUSLabel();
                }
                if (!resolvedKeybinding.isWYSIWYG()) {
                    const uiLabel = resolvedKeybinding.getLabel();
                    if (typeof uiLabel === 'string' && value.value.toLowerCase() === uiLabel.toLowerCase()) {
                        // coincidentally, this is actually WYSIWYG
                        return null;
                    }
                    return this.n(false, resolvedKeybinding.getLabel(), usLabel, model, value);
                }
                if (/abnt_|oem_/.test(value.value)) {
                    return this.n(false, resolvedKeybinding.getLabel(), usLabel, model, value);
                }
                const expectedUserSettingsLabel = resolvedKeybinding.getUserSettingsLabel();
                if (typeof expectedUserSettingsLabel === 'string' && !$bEb_1._userSettingsFuzzyEquals(value.value, expectedUserSettingsLabel)) {
                    return this.n(false, resolvedKeybinding.getLabel(), usLabel, model, value);
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
            const aKeybinding = keybindingParser_1.$GS.parseKeybinding(a);
            const bKeybinding = keybindingParser_1.$GS.parseKeybinding(b);
            if (aKeybinding === null && bKeybinding === null) {
                return true;
            }
            if (!aKeybinding || !bKeybinding) {
                return false;
            }
            return aKeybinding.equals(bKeybinding);
        }
        n(isError, uiLabel, usLabel, model, keyNode) {
            let msg;
            let className;
            let overviewRulerColor;
            if (isError) {
                // this is the error case
                msg = new htmlContent_1.$Xj().appendText(NLS_KB_LAYOUT_ERROR_MESSAGE);
                className = 'keybindingError';
                overviewRulerColor = (0, themeService_1.$hv)(editorColorRegistry_1.$sB);
            }
            else {
                // this is the info case
                if (usLabel && uiLabel !== usLabel) {
                    msg = new htmlContent_1.$Xj(nls.localize(1, null, uiLabel, usLabel));






                }
                else {
                    msg = new htmlContent_1.$Xj(nls.localize(2, null, uiLabel));






                }
                className = 'keybindingInfo';
                overviewRulerColor = (0, themeService_1.$hv)(editorColorRegistry_1.$uB);
            }
            const startPosition = model.getPositionAt(keyNode.offset);
            const endPosition = model.getPositionAt(keyNode.offset + keyNode.length);
            const range = new range_1.$ks(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
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
    exports.$bEb = $bEb;
    exports.$bEb = $bEb = $bEb_1 = __decorate([
        __param(1, keybinding_1.$2D)
    ], $bEb);
    function isInterestingEditorModel(editor, userDataProfileService) {
        const model = editor.getModel();
        if (!model) {
            return false;
        }
        return (0, resources_1.$bg)(model.uri, userDataProfileService.currentProfile.keybindingsResource);
    }
    (0, editorExtensions_1.$AV)(preferences_1.$CE, DefineKeybindingEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=keybindingsEditorContribution.js.map