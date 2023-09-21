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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/textEditor", "vs/base/common/objects", "vs/base/common/event", "vs/base/common/types", "vs/base/common/lifecycle", "vs/workbench/browser/editor", "vs/workbench/browser/parts/editor/editorWithViewState", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files"], function (require, exports, nls_1, objects_1, event_1, types_1, lifecycle_1, editor_1, editorWithViewState_1, storage_1, instantiation_1, telemetry_1, themeService_1, textResourceConfiguration_1, editorGroupsService_1, editorService_1, files_1) {
    "use strict";
    var $oeb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$peb = exports.$oeb = void 0;
    /**
     * The base class of editors that leverage any kind of text editor for the editing experience.
     */
    let $oeb = class $oeb extends editorWithViewState_1.$neb {
        static { $oeb_1 = this; }
        static { this.rb = 'textEditorViewState'; }
        constructor(id, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, xb) {
            super(id, $oeb_1.rb, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
            this.xb = xb;
            this.sb = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.sb.event;
            this.wb = this.B(new lifecycle_1.$lc());
            // Listen to configuration changes
            this.B(this.s.onDidChangeConfiguration(e => this.yb(e)));
            // ARIA: if a group is added or removed, update the editor's ARIA
            // label so that it appears in the label for when there are > 1 groups
            this.B(event_1.Event.any(this.y.onDidAddGroup, this.y.onDidRemoveGroup)(() => {
                const ariaLabel = this.Cb();
                this.tb?.setAttribute('aria-label', ariaLabel);
                this.Mb({ ariaLabel });
            }));
            // Listen to file system provider changes
            this.B(this.xb.onDidChangeFileSystemProviderCapabilities(e => this.Db(e.scheme)));
            this.B(this.xb.onDidChangeFileSystemProviderRegistrations(e => this.Db(e.scheme)));
        }
        yb(e) {
            const resource = this.Rb();
            if (!this.zb(e, resource)) {
                return;
            }
            if (this.isVisible()) {
                this.Qb(resource);
            }
            else {
                this.ub = true;
            }
        }
        zb(e, resource) {
            return e.affectsConfiguration(resource, 'editor');
        }
        Ab() {
            if (this.ub) {
                this.Qb();
                this.ub = false;
            }
        }
        Bb(configuration) {
            // Specific editor options always overwrite user configuration
            const editorConfiguration = (0, types_1.$lf)(configuration.editor) ? (0, objects_1.$Vm)(configuration.editor) : Object.create(null);
            Object.assign(editorConfiguration, this.Hb());
            // ARIA label
            editorConfiguration.ariaLabel = this.Cb();
            return editorConfiguration;
        }
        Cb() {
            return this.X ? (0, editor_1.$cU)(this.X, undefined, this.group, this.y.count) : (0, nls_1.localize)(0, null);
        }
        Db(scheme) {
            if (!this.input) {
                return;
            }
            if (this.Rb()?.scheme === scheme) {
                this.Fb(this.input);
            }
        }
        Eb(input) {
            if (this.input === input) {
                this.Fb(input);
            }
        }
        Fb(input) {
            this.Mb({ ...this.Gb(input.isReadonly()) });
        }
        Gb(isReadonly) {
            return {
                readOnly: !!isReadonly,
                readOnlyMessage: typeof isReadonly !== 'boolean' ? isReadonly : undefined
            };
        }
        Hb() {
            return {
                overviewRulerLanes: 3,
                lineNumbersMinChars: 3,
                fixedOverflowWidgets: true,
                ...this.Gb(this.input?.isReadonly()),
                renderValidationDecorations: 'on' // render problems even in readonly editors (https://github.com/microsoft/vscode/issues/89057)
            };
        }
        ab(parent) {
            // Create editor control
            this.tb = parent;
            this.Lb(parent, this.Bb(this.s.getValue(this.Rb())));
            // Listeners
            this.Jb();
        }
        Jb() {
            const mainControl = this.Nb();
            if (mainControl) {
                this.B(mainControl.onDidChangeModelLanguage(() => this.Qb()));
                this.B(mainControl.onDidChangeModel(() => this.Qb()));
                this.B(mainControl.onDidChangeCursorPosition(e => this.sb.fire({ reason: this.Kb(e) })));
                this.B(mainControl.onDidChangeModelContent(() => this.sb.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            }
        }
        Kb(e) {
            switch (e.source) {
                case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
                case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
                case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
                default: return 2 /* EditorPaneSelectionChangeReason.USER */;
            }
        }
        getSelection() {
            const mainControl = this.Nb();
            if (mainControl) {
                const selection = mainControl.getSelection();
                if (selection) {
                    return new $peb(selection);
                }
            }
            return undefined;
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            // Update our listener for input capabilities
            this.wb.value = input.onDidChangeCapabilities(() => this.Eb(input));
            // Update editor options after having set the input. We do this because there can be
            // editor input specific options (e.g. an ARIA label depending on the input showing)
            this.Qb();
            // Update aria label on editor
            const editorContainer = (0, types_1.$uf)(this.tb);
            editorContainer.setAttribute('aria-label', this.Cb());
        }
        clearInput() {
            // Clear input listener
            this.wb.clear();
            super.clearInput();
        }
        bb(visible, group) {
            if (visible) {
                this.Ab();
            }
            super.bb(visible, group);
        }
        qb(input) {
            return input.resource;
        }
        Qb(resource = this.Rb()) {
            let configuration = undefined;
            if (resource) {
                configuration = this.s.getValue(resource);
            }
            if (!configuration) {
                return;
            }
            const editorConfiguration = this.Bb(configuration);
            // Try to figure out the actual editor options that changed from the last time we updated the editor.
            // We do this so that we are not overwriting some dynamic editor settings (e.g. word wrap) that might
            // have been applied to the editor directly.
            let editorSettingsToApply = editorConfiguration;
            if (this.vb) {
                editorSettingsToApply = (0, objects_1.$2m)(this.vb, editorSettingsToApply);
            }
            if (Object.keys(editorSettingsToApply).length > 0) {
                this.vb = editorConfiguration;
                this.Mb(editorSettingsToApply);
            }
        }
        Rb() {
            const mainControl = this.Nb();
            if (mainControl) {
                const model = mainControl.getModel();
                if (model) {
                    return model.uri;
                }
            }
            if (this.input) {
                return this.input.resource;
            }
            return undefined;
        }
        dispose() {
            this.vb = undefined;
            super.dispose();
        }
    };
    exports.$oeb = $oeb;
    exports.$oeb = $oeb = $oeb_1 = __decorate([
        __param(1, telemetry_1.$9k),
        __param(2, instantiation_1.$Ah),
        __param(3, storage_1.$Vo),
        __param(4, textResourceConfiguration_1.$FA),
        __param(5, themeService_1.$gv),
        __param(6, editorService_1.$9C),
        __param(7, editorGroupsService_1.$5C),
        __param(8, files_1.$6j)
    ], $oeb);
    class $peb {
        static { this.a = 10; } // number of lines to move in editor to justify for significant change
        constructor(b) {
            this.b = b;
        }
        compare(other) {
            if (!(other instanceof $peb)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            const thisLineNumber = Math.min(this.b.selectionStartLineNumber, this.b.positionLineNumber);
            const otherLineNumber = Math.min(other.b.selectionStartLineNumber, other.b.positionLineNumber);
            if (thisLineNumber === otherLineNumber) {
                return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
            }
            if (Math.abs(thisLineNumber - otherLineNumber) < $peb.a) {
                return 2 /* EditorPaneSelectionCompareResult.SIMILAR */; // when in close proximity, treat selection as being similar
            }
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        restore(options) {
            const textEditorOptions = {
                ...options,
                selection: this.b,
                selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */
            };
            return textEditorOptions;
        }
        log() {
            return `line: ${this.b.startLineNumber}-${this.b.endLineNumber}, col:  ${this.b.startColumn}-${this.b.endColumn}`;
        }
    }
    exports.$peb = $peb;
});
//# sourceMappingURL=textEditor.js.map