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
define(["require", "exports", "vs/nls!vs/workbench/contrib/scm/browser/dirtydiffDecorator", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/resolverService", "vs/editor/common/services/editorWorker", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/scm/common/scm", "vs/editor/common/model/textModel", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/common/core/position", "vs/base/common/numbers", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/base/common/actions", "vs/platform/keybinding/common/keybinding", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/common/model", "vs/base/common/arrays", "vs/editor/browser/services/codeEditorService", "vs/base/browser/dom", "vs/workbench/services/textfile/common/textfiles", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/errors", "vs/workbench/common/contextkeys", "vs/platform/progress/common/progress", "vs/base/common/color", "vs/base/common/map", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/workbench/contrib/files/common/files", "vs/platform/audioCues/browser/audioCueService", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/scm/common/quickDiff", "vs/workbench/contrib/scm/browser/dirtyDiffSwitcher", "vs/css!./media/dirtydiffDecorator"], function (require, exports, nls, async_1, lifecycle_1, event_1, instantiation_1, resolverService_1, editorWorker_1, configuration_1, scm_1, textModel_1, themeService_1, colorRegistry_1, editorBrowser_1, editorExtensions_1, peekView_1, contextkey_1, editorContextKeys_1, position_1, numbers_1, keybindingsRegistry_1, embeddedCodeEditorWidget_1, actions_1, keybinding_1, resources_1, actions_2, menuEntryActionViewItem_1, model_1, arrays_1, codeEditorService_1, dom, textfiles_1, iconRegistry_1, codicons_1, themables_1, errors_1, contextkeys_1, progress_1, color_1, map_1, editorService_1, editor_1, files_1, audioCueService_1, accessibility_1, quickDiff_1, dirtyDiffSwitcher_1) {
    "use strict";
    var $ieb_1, DirtyDiffDecorator_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$leb = exports.$keb = exports.$jeb = exports.$ieb = exports.$heb = exports.$geb = exports.$feb = exports.$eeb = exports.$deb = void 0;
    class DiffActionRunner extends actions_1.$hi {
        u(action, context) {
            if (action instanceof actions_2.$Vu) {
                return action.run(...context);
            }
            return super.u(action, context);
        }
    }
    exports.$deb = new contextkey_1.$2i('dirtyDiffVisible', false);
    function getChangeHeight(change) {
        const modified = change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
        const original = change.originalEndLineNumber - change.originalStartLineNumber + 1;
        if (change.originalEndLineNumber === 0) {
            return modified;
        }
        else if (change.modifiedEndLineNumber === 0) {
            return original;
        }
        else {
            return modified + original;
        }
    }
    function getModifiedEndLineNumber(change) {
        if (change.modifiedEndLineNumber === 0) {
            return change.modifiedStartLineNumber === 0 ? 1 : change.modifiedStartLineNumber;
        }
        else {
            return change.modifiedEndLineNumber;
        }
    }
    function lineIntersectsChange(lineNumber, change) {
        // deletion at the beginning of the file
        if (lineNumber === 1 && change.modifiedStartLineNumber === 0 && change.modifiedEndLineNumber === 0) {
            return true;
        }
        return lineNumber >= change.modifiedStartLineNumber && lineNumber <= (change.modifiedEndLineNumber || change.modifiedStartLineNumber);
    }
    let UIEditorAction = class UIEditorAction extends actions_1.$gi {
        constructor(editor, action, cssClass, keybindingService, instantiationService) {
            const keybinding = keybindingService.lookupKeybinding(action.id);
            const label = action.label + (keybinding ? ` (${keybinding.getLabel()})` : '');
            super(action.id, label, cssClass);
            this.g = instantiationService;
            this.f = action;
            this.c = editor;
        }
        run() {
            return Promise.resolve(this.g.invokeFunction(accessor => this.f.run(accessor, this.c, null)));
        }
    };
    UIEditorAction = __decorate([
        __param(3, keybinding_1.$2D),
        __param(4, instantiation_1.$Ah)
    ], UIEditorAction);
    var ChangeType;
    (function (ChangeType) {
        ChangeType[ChangeType["Modify"] = 0] = "Modify";
        ChangeType[ChangeType["Add"] = 1] = "Add";
        ChangeType[ChangeType["Delete"] = 2] = "Delete";
    })(ChangeType || (ChangeType = {}));
    function getChangeType(change) {
        if (change.originalEndLineNumber === 0) {
            return ChangeType.Add;
        }
        else if (change.modifiedEndLineNumber === 0) {
            return ChangeType.Delete;
        }
        else {
            return ChangeType.Modify;
        }
    }
    function getChangeTypeColor(theme, changeType) {
        switch (changeType) {
            case ChangeType.Modify: return theme.getColor(editorGutterModifiedBackground);
            case ChangeType.Add: return theme.getColor(editorGutterAddedBackground);
            case ChangeType.Delete: return theme.getColor(editorGutterDeletedBackground);
        }
    }
    function getOuterEditorFromDiffEditor(accessor) {
        const diffEditors = accessor.get(codeEditorService_1.$nV).listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.hasTextFocus() && diffEditor instanceof embeddedCodeEditorWidget_1.$x3) {
                return diffEditor.getParentEditor();
            }
        }
        return (0, peekView_1.$H3)(accessor);
    }
    let DirtyDiffWidget = class DirtyDiffWidget extends peekView_1.$I3 {
        constructor(editor, eb, fb, instantiationService, gb, hb) {
            super(editor, { isResizeable: true, frameWidth: 1, keepEditorSelection: true, className: 'dirty-diff' }, instantiationService);
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.p = 0;
            this.t = '';
            this.T = undefined;
            this.o.add(fb.onDidColorThemeChange(this.sb, this));
            this.sb(fb.getColorTheme());
            if (this.eb.original.length > 0) {
                hb = hb.createOverlay([['originalResourceScheme', this.eb.original[0].uri.scheme], ['originalResourceSchemes', this.eb.original.map(original => original.uri.scheme)]]);
            }
            this.create();
            if (editor.hasModel()) {
                this.l = (0, resources_1.$fg)(editor.getModel().uri);
            }
            else {
                this.l = '';
            }
            this.setTitle(this.l);
        }
        get provider() {
            return this.t;
        }
        get index() {
            return this.p;
        }
        get visibleRange() {
            const visibleRanges = this.c.getModifiedEditor().getVisibleRanges();
            return visibleRanges.length >= 0 ? visibleRanges[0] : undefined;
        }
        showChange(index, usePosition = true) {
            const labeledChange = this.eb.changes[index];
            const change = labeledChange.change;
            this.p = index;
            this.hb.createKey('originalResourceScheme', this.eb.changes[index].uri.scheme);
            this.lb();
            this.t = labeledChange.label;
            this.v = change;
            const originalModel = this.eb.original;
            if (!originalModel) {
                return;
            }
            const onFirstDiffUpdate = event_1.Event.once(this.c.onDidUpdateDiff);
            // TODO@joao TODO@alex need this setTimeout probably because the
            // non-side-by-side diff still hasn't created the view zones
            onFirstDiffUpdate(() => setTimeout(() => this.rb(change), 0));
            const diffEditorModel = this.eb.getDiffEditorModel(labeledChange.uri.toString());
            if (!diffEditorModel) {
                return;
            }
            this.c.setModel(diffEditorModel);
            this.cb?.setSelection(labeledChange.label);
            const position = new position_1.$js(getModifiedEndLineNumber(change), 1);
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            const editorHeight = this.editor.getLayoutInfo().height;
            const editorHeightInLines = Math.floor(editorHeight / lineHeight);
            const height = Math.min(getChangeHeight(change) + /* padding */ 8, Math.floor(editorHeightInLines / 3));
            this.ib(labeledChange.label);
            const changeType = getChangeType(change);
            const changeTypeColor = getChangeTypeColor(this.fb.getColorTheme(), changeType);
            this.style({ frameColor: changeTypeColor, arrowColor: changeTypeColor });
            const providerSpecificChanges = [];
            let contextIndex = index;
            for (const change of this.eb.changes) {
                if (change.label === this.eb.changes[this.p].label) {
                    providerSpecificChanges.push(change.change);
                    if (labeledChange === change) {
                        contextIndex = providerSpecificChanges.length - 1;
                    }
                }
            }
            this.O.context = [diffEditorModel.modified.uri, providerSpecificChanges, contextIndex];
            if (usePosition) {
                this.show(position, height);
            }
            this.editor.focus();
        }
        ib(label) {
            const providerChanges = this.eb.mapChanges.get(label);
            const providerIndex = providerChanges.indexOf(this.p);
            let detail;
            if (!this.kb()) {
                detail = this.eb.changes.length > 1
                    ? nls.localize(0, null, label, providerIndex + 1, providerChanges.length)
                    : nls.localize(1, null, label, providerIndex + 1, providerChanges.length);
                this.db.style.display = 'none';
            }
            else {
                detail = this.eb.changes.length > 1
                    ? nls.localize(2, null, providerIndex + 1, providerChanges.length)
                    : nls.localize(3, null, providerIndex + 1, providerChanges.length);
                this.db.style.display = 'inherit';
            }
            this.setTitle(this.l, detail);
        }
        jb(event) {
            const newProvider = event?.provider;
            if (newProvider === this.eb.changes[this.p].label) {
                return;
            }
            let closestGreaterIndex = this.p < this.eb.changes.length - 1 ? this.p + 1 : 0;
            for (let i = closestGreaterIndex; i !== this.p; i < this.eb.changes.length - 1 ? i++ : i = 0) {
                if (this.eb.changes[i].label === newProvider) {
                    closestGreaterIndex = i;
                    break;
                }
            }
            let closestLesserIndex = this.p > 0 ? this.p - 1 : this.eb.changes.length - 1;
            for (let i = closestLesserIndex; i !== this.p; i >= 0 ? i-- : i = this.eb.changes.length - 1) {
                if (this.eb.changes[i].label === newProvider) {
                    closestLesserIndex = i;
                    break;
                }
            }
            const closestIndex = Math.abs(this.eb.changes[closestGreaterIndex].change.modifiedEndLineNumber - this.eb.changes[this.p].change.modifiedEndLineNumber)
                < Math.abs(this.eb.changes[closestLesserIndex].change.modifiedEndLineNumber - this.eb.changes[this.p].change.modifiedEndLineNumber)
                ? closestGreaterIndex : closestLesserIndex;
            this.showChange(closestIndex, false);
        }
        kb() {
            let providersWithChangesCount = 0;
            if (this.eb.mapChanges.size > 1) {
                const keys = Array.from(this.eb.mapChanges.keys());
                for (let i = 0; (i < keys.length) && (providersWithChangesCount <= 1); i++) {
                    if (this.eb.mapChanges.get(keys[i]).length > 0) {
                        providersWithChangesCount++;
                    }
                }
            }
            return providersWithChangesCount >= 2;
        }
        lb() {
            if (!this.O) {
                return;
            }
            const previous = this.Q.createInstance(UIEditorAction, this.editor, new $eeb(this.editor), themables_1.ThemeIcon.asClassName(iconRegistry_1.$av));
            const next = this.Q.createInstance(UIEditorAction, this.editor, new $feb(this.editor), themables_1.ThemeIcon.asClassName(iconRegistry_1.$bv));
            this.o.add(previous);
            this.o.add(next);
            const actions = [];
            if (this.m) {
                this.m.dispose();
            }
            this.m = this.gb.createMenu(actions_2.$Ru.SCMChangeContext, this.hb);
            (0, menuEntryActionViewItem_1.$B3)(this.m, { shouldForwardArgs: true }, actions);
            this.O.clear();
            this.O.push(actions.reverse(), { label: false, icon: true });
            this.O.push([next, previous], { label: false, icon: true });
            this.O.push(new actions_1.$gi('peekview.close', nls.localize(4, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close), true, () => this.dispose()), { label: false, icon: true });
        }
        U(container) {
            super.U(container, true);
            this.db = dom.$$O(this.K, dom.$('.dropdown'));
            this.cb = this.Q.createInstance(dirtyDiffSwitcher_1.$beb, new dirtyDiffSwitcher_1.$ceb((event) => this.jb(event)), this.eb.quickDiffs.map(quickDiffer => quickDiffer.label), this.eb.changes[this.p].label);
            this.cb.render(this.db);
            this.lb();
        }
        W() {
            const actionRunner = new DiffActionRunner();
            // close widget on successful action
            actionRunner.onDidRun(e => {
                if (!(e.action instanceof UIEditorAction) && !e.error) {
                    this.dispose();
                }
            });
            return {
                ...super.W(),
                actionRunner
            };
        }
        Y(container) {
            const options = {
                scrollBeyondLastLine: true,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false
                },
                overviewRulerLanes: 2,
                fixedOverflowWidgets: true,
                minimap: { enabled: false },
                renderSideBySide: false,
                readOnly: false,
                renderIndicators: false,
                diffAlgorithm: 'advanced',
                stickyScroll: { enabled: false }
            };
            this.c = this.Q.createInstance(embeddedCodeEditorWidget_1.$x3, container, options, {}, this.editor);
            this.o.add(this.c);
        }
        F(width) {
            if (typeof this.T === 'undefined') {
                return;
            }
            this.c.layout({ height: this.T, width });
        }
        bb(height, width) {
            super.bb(height, width);
            this.c.layout({ height, width });
            if (typeof this.T === 'undefined' && this.v) {
                this.rb(this.v);
            }
            this.T = height;
        }
        rb(change) {
            let start, end;
            if (change.modifiedEndLineNumber === 0) { // deletion
                start = change.modifiedStartLineNumber;
                end = change.modifiedStartLineNumber + 1;
            }
            else if (change.originalEndLineNumber > 0) { // modification
                start = change.modifiedStartLineNumber - 1;
                end = change.modifiedEndLineNumber + 1;
            }
            else { // insertion
                start = change.modifiedStartLineNumber;
                end = change.modifiedEndLineNumber;
            }
            this.c.revealLinesInCenter(start, end, 1 /* ScrollType.Immediate */);
        }
        sb(theme) {
            const borderColor = theme.getColor(peekView_1.$M3) || color_1.$Os.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView_1.$J3) || color_1.$Os.transparent,
                primaryHeadingColor: theme.getColor(peekView_1.$K3),
                secondaryHeadingColor: theme.getColor(peekView_1.$L3)
            });
        }
        C(range) {
            this.editor.revealLineInCenterIfOutsideViewport(range.endLineNumber, 0 /* ScrollType.Smooth */);
        }
        hasFocus() {
            return this.c.hasTextFocus();
        }
        dispose() {
            super.dispose();
            this.m?.dispose();
        }
    };
    DirtyDiffWidget = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, instantiation_1.$Ah),
        __param(4, actions_2.$Su),
        __param(5, contextkey_1.$3i)
    ], DirtyDiffWidget);
    class $eeb extends editorExtensions_1.$sV {
        constructor(h) {
            super({
                id: 'editor.action.dirtydiff.previous',
                label: nls.localize(5, null),
                alias: 'Show Previous Change',
                precondition: contextkeys_1.$bdb.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
            this.h = h;
        }
        run(accessor) {
            const outerEditor = this.h ?? getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = $ieb.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.previous();
        }
    }
    exports.$eeb = $eeb;
    (0, editorExtensions_1.$xV)($eeb);
    class $feb extends editorExtensions_1.$sV {
        constructor(h) {
            super({
                id: 'editor.action.dirtydiff.next',
                label: nls.localize(6, null),
                alias: 'Show Next Change',
                precondition: contextkeys_1.$bdb.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
            this.h = h;
        }
        run(accessor) {
            const outerEditor = this.h ?? getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = $ieb.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.next();
        }
    }
    exports.$feb = $feb;
    (0, editorExtensions_1.$xV)($feb);
    // Go to menu
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.MenubarGoMenu, {
        group: '7_change_nav',
        command: {
            id: 'editor.action.dirtydiff.next',
            title: nls.localize(7, null)
        },
        order: 1
    });
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.MenubarGoMenu, {
        group: '7_change_nav',
        command: {
            id: 'editor.action.dirtydiff.previous',
            title: nls.localize(8, null)
        },
        order: 2
    });
    class $geb extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'workbench.action.editor.previousChange',
                label: nls.localize(9, null),
                alias: 'Go to Previous Change',
                precondition: contextkeys_1.$bdb.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
        }
        async run(accessor) {
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            const audioCueService = accessor.get(audioCueService_1.$sZ);
            const accessibilityService = accessor.get(accessibility_1.$1r);
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            if (!outerEditor || !outerEditor.hasModel()) {
                return;
            }
            const controller = $ieb.get(outerEditor);
            if (!controller || !controller.modelRegistry) {
                return;
            }
            const lineNumber = outerEditor.getPosition().lineNumber;
            const model = controller.modelRegistry.getModel(outerEditor.getModel());
            if (!model || model.changes.length === 0) {
                return;
            }
            const index = model.findPreviousClosestChange(lineNumber, false);
            const change = model.changes[index];
            await playAudioCueForChange(change.change, audioCueService);
            setPositionAndSelection(change.change, outerEditor, accessibilityService, codeEditorService);
        }
    }
    exports.$geb = $geb;
    (0, editorExtensions_1.$xV)($geb);
    class $heb extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'workbench.action.editor.nextChange',
                label: nls.localize(10, null),
                alias: 'Go to Next Change',
                precondition: contextkeys_1.$bdb.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
        }
        async run(accessor) {
            const audioCueService = accessor.get(audioCueService_1.$sZ);
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            const accessibilityService = accessor.get(accessibility_1.$1r);
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            if (!outerEditor || !outerEditor.hasModel()) {
                return;
            }
            const controller = $ieb.get(outerEditor);
            if (!controller || !controller.modelRegistry) {
                return;
            }
            const lineNumber = outerEditor.getPosition().lineNumber;
            const model = controller.modelRegistry.getModel(outerEditor.getModel());
            if (!model || model.changes.length === 0) {
                return;
            }
            const index = model.findNextClosestChange(lineNumber, false);
            const change = model.changes[index].change;
            await playAudioCueForChange(change, audioCueService);
            setPositionAndSelection(change, outerEditor, accessibilityService, codeEditorService);
        }
    }
    exports.$heb = $heb;
    function setPositionAndSelection(change, editor, accessibilityService, codeEditorService) {
        const position = new position_1.$js(change.modifiedStartLineNumber, 1);
        editor.setPosition(position);
        editor.revealPositionInCenter(position);
        if (accessibilityService.isScreenReaderOptimized()) {
            editor.setSelection({ startLineNumber: change.modifiedStartLineNumber, startColumn: 0, endLineNumber: change.modifiedStartLineNumber, endColumn: Number.MAX_VALUE });
            codeEditorService.getActiveCodeEditor()?.writeScreenReaderContent('diff-navigation');
        }
    }
    async function playAudioCueForChange(change, audioCueService) {
        const changeType = getChangeType(change);
        switch (changeType) {
            case ChangeType.Add:
                audioCueService.playAudioCue(audioCueService_1.$wZ.diffLineInserted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
            case ChangeType.Delete:
                audioCueService.playAudioCue(audioCueService_1.$wZ.diffLineDeleted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
            case ChangeType.Modify:
                audioCueService.playAudioCue(audioCueService_1.$wZ.diffLineModified, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
        }
    }
    (0, editorExtensions_1.$xV)($heb);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'closeDirtyDiff',
        weight: 100 /* KeybindingWeight.EditorContrib */ + 50,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: contextkey_1.$Ii.and(exports.$deb),
        handler: (accessor) => {
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = $ieb.get(outerEditor);
            if (!controller) {
                return;
            }
            controller.close();
        }
    });
    let $ieb = class $ieb extends lifecycle_1.$kc {
        static { $ieb_1 = this; }
        static { this.ID = 'editor.contrib.dirtydiff'; }
        static get(editor) {
            return editor.getContribution($ieb_1.ID);
        }
        constructor(t, contextKeyService, u, w) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.modelRegistry = null;
            this.c = null;
            this.f = null;
            this.h = lifecycle_1.$kc.None;
            this.j = null;
            this.m = false;
            this.n = new lifecycle_1.$jc();
            this.m = !contextKeyService.getContextKeyValue('isInDiffEditor');
            this.s = dom.$XO();
            this.B((0, lifecycle_1.$ic)(() => this.s.remove()));
            if (this.m) {
                this.g = exports.$deb.bindTo(contextKeyService);
                this.B(t.onDidChangeModel(() => this.close()));
                const onDidChangeGutterAction = event_1.Event.filter(u.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterAction'));
                this.B(onDidChangeGutterAction(this.y, this));
                this.y();
            }
        }
        y() {
            const gutterAction = this.u.getValue('scm.diffDecorationsGutterAction');
            this.n.clear();
            if (gutterAction === 'diff') {
                this.n.add(this.t.onMouseDown(e => this.D(e)));
                this.n.add(this.t.onMouseUp(e => this.F(e)));
                this.s.textContent = `
				.monaco-editor .dirty-diff-glyph {
					cursor: pointer;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-glyph:hover::before {
					height: 100%;
					width: 6px;
					left: -6px;
				}

				.monaco-editor .margin-view-overlays .dirty-diff-deleted:hover::after {
					bottom: 0;
					border-top-width: 0;
					border-bottom-width: 0;
				}
			`;
            }
            else {
                this.s.textContent = ``;
            }
        }
        canNavigate() {
            return !this.f || (this.f?.index === -1) || (!!this.c && this.c.changes.length > 1);
        }
        refresh() {
            this.f?.showChange(this.f.index, false);
        }
        next(lineNumber) {
            if (!this.z()) {
                return;
            }
            if (!this.f || !this.c) {
                return;
            }
            let index;
            if (this.t.hasModel() && (typeof lineNumber === 'number' || !this.f.provider)) {
                index = this.c.findNextClosestChange(typeof lineNumber === 'number' ? lineNumber : this.t.getPosition().lineNumber, true, this.f.provider);
            }
            else {
                const providerChanges = this.c.mapChanges.get(this.f.provider) ?? this.c.mapChanges.values().next().value;
                const mapIndex = providerChanges.findIndex(value => value === this.f.index);
                index = providerChanges[(0, numbers_1.rot)(mapIndex + 1, providerChanges.length)];
            }
            this.f.showChange(index);
        }
        previous(lineNumber) {
            if (!this.z()) {
                return;
            }
            if (!this.f || !this.c) {
                return;
            }
            let index;
            if (this.t.hasModel() && (typeof lineNumber === 'number')) {
                index = this.c.findPreviousClosestChange(typeof lineNumber === 'number' ? lineNumber : this.t.getPosition().lineNumber, true, this.f.provider);
            }
            else {
                const providerChanges = this.c.mapChanges.get(this.f.provider) ?? this.c.mapChanges.values().next().value;
                const mapIndex = providerChanges.findIndex(value => value === this.f.index);
                index = providerChanges[(0, numbers_1.rot)(mapIndex - 1, providerChanges.length)];
            }
            this.f.showChange(index);
        }
        close() {
            this.h.dispose();
            this.h = lifecycle_1.$kc.None;
        }
        z() {
            if (!this.m) {
                return false;
            }
            if (this.f) {
                if (!this.c || this.c.changes.length === 0) {
                    this.close();
                    return false;
                }
                return true;
            }
            if (!this.modelRegistry) {
                return false;
            }
            const editorModel = this.t.getModel();
            if (!editorModel) {
                return false;
            }
            const model = this.modelRegistry.getModel(editorModel);
            if (!model) {
                return false;
            }
            if (model.changes.length === 0) {
                return false;
            }
            this.c = model;
            this.f = this.w.createInstance(DirtyDiffWidget, this.t, model);
            this.g.set(true);
            const disposables = new lifecycle_1.$jc();
            disposables.add(event_1.Event.once(this.f.onDidClose)(this.close, this));
            const onDidModelChange = event_1.Event.chain(model.onDidChange, $ => $.filter(e => e.diff.length > 0)
                .map(e => e.diff));
            onDidModelChange(this.C, this, disposables);
            disposables.add(this.f);
            disposables.add((0, lifecycle_1.$ic)(() => {
                this.c = null;
                this.f = null;
                this.g.set(false);
                this.t.focus();
            }));
            this.h = disposables;
            return true;
        }
        C(splices) {
            if (!this.c || !this.f || this.f.hasFocus()) {
                return;
            }
            for (const splice of splices) {
                if (splice.start <= this.f.index) {
                    this.next();
                    return;
                }
            }
            this.refresh();
        }
        D(e) {
            this.j = null;
            const range = e.target.range;
            if (!range) {
                return;
            }
            if (!e.event.leftButton) {
                return;
            }
            if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
                return;
            }
            if (!e.target.element) {
                return;
            }
            if (e.target.element.className.indexOf('dirty-diff-glyph') < 0) {
                return;
            }
            const data = e.target.detail;
            const offsetLeftInGutter = e.target.element.offsetLeft;
            const gutterOffsetX = data.offsetX - offsetLeftInGutter;
            // TODO@joao TODO@alex TODO@martin this is such that we don't collide with folding
            if (gutterOffsetX < -3 || gutterOffsetX > 3) { // dirty diff decoration on hover is 6px wide
                return;
            }
            this.j = { lineNumber: range.startLineNumber };
        }
        F(e) {
            if (!this.j) {
                return;
            }
            const { lineNumber } = this.j;
            this.j = null;
            const range = e.target.range;
            if (!range || range.startLineNumber !== lineNumber) {
                return;
            }
            if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
                return;
            }
            if (!this.modelRegistry) {
                return;
            }
            const editorModel = this.t.getModel();
            if (!editorModel) {
                return;
            }
            const model = this.modelRegistry.getModel(editorModel);
            if (!model) {
                return;
            }
            const index = model.changes.findIndex(change => lineIntersectsChange(lineNumber, change.change));
            if (index < 0) {
                return;
            }
            if (index === this.f?.index) {
                this.close();
            }
            else {
                this.next(lineNumber);
            }
        }
        getChanges() {
            if (!this.modelRegistry) {
                return [];
            }
            if (!this.t.hasModel()) {
                return [];
            }
            const model = this.modelRegistry.getModel(this.t.getModel());
            if (!model) {
                return [];
            }
            return model.changes.map(change => change.change);
        }
        dispose() {
            this.n.dispose();
            super.dispose();
        }
    };
    exports.$ieb = $ieb;
    exports.$ieb = $ieb = $ieb_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, configuration_1.$8h),
        __param(3, instantiation_1.$Ah)
    ], $ieb);
    const editorGutterModifiedBackground = (0, colorRegistry_1.$sv)('editorGutter.modifiedBackground', {
        dark: '#1B81A8',
        light: '#2090D3',
        hcDark: '#1B81A8',
        hcLight: '#2090D3'
    }, nls.localize(11, null));
    const editorGutterAddedBackground = (0, colorRegistry_1.$sv)('editorGutter.addedBackground', {
        dark: '#487E02',
        light: '#48985D',
        hcDark: '#487E02',
        hcLight: '#48985D'
    }, nls.localize(12, null));
    const editorGutterDeletedBackground = (0, colorRegistry_1.$sv)('editorGutter.deletedBackground', {
        dark: colorRegistry_1.$lw,
        light: colorRegistry_1.$lw,
        hcDark: colorRegistry_1.$lw,
        hcLight: colorRegistry_1.$lw
    }, nls.localize(13, null));
    const minimapGutterModifiedBackground = (0, colorRegistry_1.$sv)('minimapGutter.modifiedBackground', {
        dark: editorGutterModifiedBackground,
        light: editorGutterModifiedBackground,
        hcDark: editorGutterModifiedBackground,
        hcLight: editorGutterModifiedBackground
    }, nls.localize(14, null));
    const minimapGutterAddedBackground = (0, colorRegistry_1.$sv)('minimapGutter.addedBackground', {
        dark: editorGutterAddedBackground,
        light: editorGutterAddedBackground,
        hcDark: editorGutterAddedBackground,
        hcLight: editorGutterAddedBackground
    }, nls.localize(15, null));
    const minimapGutterDeletedBackground = (0, colorRegistry_1.$sv)('minimapGutter.deletedBackground', {
        dark: editorGutterDeletedBackground,
        light: editorGutterDeletedBackground,
        hcDark: editorGutterDeletedBackground,
        hcLight: editorGutterDeletedBackground
    }, nls.localize(16, null));
    const overviewRulerModifiedForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.modifiedForeground', { dark: (0, colorRegistry_1.$1y)(editorGutterModifiedBackground, 0.6), light: (0, colorRegistry_1.$1y)(editorGutterModifiedBackground, 0.6), hcDark: (0, colorRegistry_1.$1y)(editorGutterModifiedBackground, 0.6), hcLight: (0, colorRegistry_1.$1y)(editorGutterModifiedBackground, 0.6) }, nls.localize(17, null));
    const overviewRulerAddedForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.addedForeground', { dark: (0, colorRegistry_1.$1y)(editorGutterAddedBackground, 0.6), light: (0, colorRegistry_1.$1y)(editorGutterAddedBackground, 0.6), hcDark: (0, colorRegistry_1.$1y)(editorGutterAddedBackground, 0.6), hcLight: (0, colorRegistry_1.$1y)(editorGutterAddedBackground, 0.6) }, nls.localize(18, null));
    const overviewRulerDeletedForeground = (0, colorRegistry_1.$sv)('editorOverviewRuler.deletedForeground', { dark: (0, colorRegistry_1.$1y)(editorGutterDeletedBackground, 0.6), light: (0, colorRegistry_1.$1y)(editorGutterDeletedBackground, 0.6), hcDark: (0, colorRegistry_1.$1y)(editorGutterDeletedBackground, 0.6), hcLight: (0, colorRegistry_1.$1y)(editorGutterDeletedBackground, 0.6) }, nls.localize(19, null));
    let DirtyDiffDecorator = DirtyDiffDecorator_1 = class DirtyDiffDecorator extends lifecycle_1.$kc {
        static createDecoration(className, options) {
            const decorationOptions = {
                description: 'dirty-diff-decoration',
                isWholeLine: options.isWholeLine,
            };
            if (options.gutter) {
                decorationOptions.linesDecorationsClassName = `dirty-diff-glyph ${className}`;
            }
            if (options.overview.active) {
                decorationOptions.overviewRuler = {
                    color: (0, themeService_1.$hv)(options.overview.color),
                    position: model_1.OverviewRulerLane.Left
                };
            }
            if (options.minimap.active) {
                decorationOptions.minimap = {
                    color: (0, themeService_1.$hv)(options.minimap.color),
                    position: model_1.MinimapPosition.Gutter
                };
            }
            return textModel_1.$RC.createDynamic(decorationOptions);
        }
        constructor(editorModel, s, t) {
            super();
            this.s = s;
            this.t = t;
            this.m = [];
            this.n = editorModel;
            const decorations = t.getValue('scm.diffDecorations');
            const gutter = decorations === 'all' || decorations === 'gutter';
            const overview = decorations === 'all' || decorations === 'overview';
            const minimap = decorations === 'all' || decorations === 'minimap';
            this.c = DirtyDiffDecorator_1.createDecoration('dirty-diff-added', {
                gutter,
                overview: { active: overview, color: overviewRulerAddedForeground },
                minimap: { active: minimap, color: minimapGutterAddedBackground },
                isWholeLine: true
            });
            this.f = DirtyDiffDecorator_1.createDecoration('dirty-diff-added-pattern', {
                gutter,
                overview: { active: overview, color: overviewRulerAddedForeground },
                minimap: { active: minimap, color: minimapGutterAddedBackground },
                isWholeLine: true
            });
            this.g = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified', {
                gutter,
                overview: { active: overview, color: overviewRulerModifiedForeground },
                minimap: { active: minimap, color: minimapGutterModifiedBackground },
                isWholeLine: true
            });
            this.h = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified-pattern', {
                gutter,
                overview: { active: overview, color: overviewRulerModifiedForeground },
                minimap: { active: minimap, color: minimapGutterModifiedBackground },
                isWholeLine: true
            });
            this.j = DirtyDiffDecorator_1.createDecoration('dirty-diff-deleted', {
                gutter,
                overview: { active: overview, color: overviewRulerDeletedForeground },
                minimap: { active: minimap, color: minimapGutterDeletedBackground },
                isWholeLine: false
            });
            this.B(t.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('scm.diffDecorationsGutterPattern')) {
                    this.u();
                }
            }));
            this.B(s.onDidChange(this.u, this));
        }
        u() {
            if (!this.n) {
                return;
            }
            const pattern = this.t.getValue('scm.diffDecorationsGutterPattern');
            const decorations = this.s.changes.map((labeledChange) => {
                const change = labeledChange.change;
                const changeType = getChangeType(change);
                const startLineNumber = change.modifiedStartLineNumber;
                const endLineNumber = change.modifiedEndLineNumber || startLineNumber;
                switch (changeType) {
                    case ChangeType.Add:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: endLineNumber, endColumn: 1
                            },
                            options: pattern.added ? this.f : this.c
                        };
                    case ChangeType.Delete:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: Number.MAX_VALUE,
                                endLineNumber: startLineNumber, endColumn: Number.MAX_VALUE
                            },
                            options: this.j
                        };
                    case ChangeType.Modify:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: endLineNumber, endColumn: 1
                            },
                            options: pattern.modified ? this.h : this.g
                        };
                }
            });
            this.m = this.n.deltaDecorations(this.m, decorations);
        }
        dispose() {
            super.dispose();
            if (this.n && !this.n.isDisposed()) {
                this.n.deltaDecorations(this.m, []);
            }
            this.n = null;
            this.m = [];
        }
    };
    DirtyDiffDecorator = DirtyDiffDecorator_1 = __decorate([
        __param(2, configuration_1.$8h)
    ], DirtyDiffDecorator);
    function compareChanges(a, b) {
        let result = a.modifiedStartLineNumber - b.modifiedStartLineNumber;
        if (result !== 0) {
            return result;
        }
        result = a.modifiedEndLineNumber - b.modifiedEndLineNumber;
        if (result !== 0) {
            return result;
        }
        result = a.originalStartLineNumber - b.originalStartLineNumber;
        if (result !== 0) {
            return result;
        }
        return a.originalEndLineNumber - b.originalEndLineNumber;
    }
    async function $jeb(quickDiffService, uri, language, isSynchronized) {
        const quickDiffs = await quickDiffService.getQuickDiffs(uri, language, isSynchronized);
        return quickDiffs.length > 0 ? quickDiffs[0].originalResource : null;
    }
    exports.$jeb = $jeb;
    let $keb = class $keb extends lifecycle_1.$kc {
        get original() { return this.g; }
        get changes() { return this.w; }
        get mapChanges() { return this.y; }
        constructor(textFileModel, z, C, D, F, G, H) {
            super();
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.c = [];
            this.f = new Map(); // key is uri.toString()
            this.g = [];
            this.j = new async_1.$Eg(200);
            this.n = new Set();
            this.s = this.B(new lifecycle_1.$jc());
            this.t = false;
            this.u = new event_1.$fd();
            this.onDidChange = this.u.event;
            this.w = [];
            this.y = new Map(); // key is the quick diff name, value is the index of the change in this._changes
            this.h = textFileModel;
            this.B(textFileModel.textEditorModel.onDidChangeContent(() => this.J()));
            this.B(event_1.Event.filter(F.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsIgnoreTrimWhitespace') || e.affectsConfiguration('diffEditor.ignoreTrimWhitespace'))(this.J, this));
            this.B(z.onDidAddRepository(this.I, this));
            for (const r of z.repositories) {
                this.I(r);
            }
            this.B(this.h.onDidChangeEncoding(() => {
                this.j.cancel();
                this.c = [];
                this.f.clear();
                this.g = [];
                this.m = undefined;
                this.L([], new Map());
                this.J();
            }));
            this.B(this.C.onDidChangeQuickDiffProviders(() => this.J()));
            this.J();
        }
        get quickDiffs() {
            return this.c;
        }
        getDiffEditorModel(originalUri) {
            if (!this.f.has(originalUri)) {
                return;
            }
            const original = this.f.get(originalUri);
            return {
                modified: this.h.textEditorModel,
                original: original.textEditorModel
            };
        }
        I(repository) {
            const disposables = new lifecycle_1.$jc();
            this.n.add(disposables);
            disposables.add((0, lifecycle_1.$ic)(() => this.n.delete(disposables)));
            const onDidChange = event_1.Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            disposables.add(onDidChange(this.J, this));
            const onDidRemoveThis = event_1.Event.filter(this.z.onDidRemoveRepository, r => r === repository);
            disposables.add(onDidRemoveThis(() => (0, lifecycle_1.$fc)(disposables), null));
            this.J();
        }
        J() {
            if (!this.j) {
                return Promise.resolve(null);
            }
            return this.j
                .trigger(() => this.M())
                .then((result) => {
                const originalModels = Array.from(this.f.values());
                if (!result || this.t || this.h.isDisposed() || originalModels.some(originalModel => originalModel.isDisposed())) {
                    return; // disposed
                }
                if (originalModels.every(originalModel => originalModel.textEditorModel.getValueLength() === 0)) {
                    result.changes = [];
                }
                if (!result.changes) {
                    result.changes = [];
                }
                this.L(result.changes, result.mapChanges);
            }, (err) => (0, errors_1.$Y)(err));
        }
        L(changes, mapChanges) {
            const diff = (0, arrays_1.$Bb)(this.w, changes, (a, b) => compareChanges(a.change, b.change));
            this.w = changes;
            this.y = mapChanges;
            this.u.fire({ changes, diff });
        }
        M() {
            return this.H.withProgress({ location: 3 /* ProgressLocation.Scm */, delay: 250 }, async () => {
                const originalURIs = await this.N();
                if (this.t || this.h.isDisposed() || (originalURIs.length === 0)) {
                    return Promise.resolve({ changes: [], mapChanges: new Map() }); // disposed
                }
                const filteredToDiffable = originalURIs.filter(quickDiff => this.D.canComputeDirtyDiff(quickDiff.originalResource, this.h.resource));
                if (filteredToDiffable.length === 0) {
                    return Promise.resolve({ changes: [], mapChanges: new Map() }); // All files are too large
                }
                const ignoreTrimWhitespaceSetting = this.F.getValue('scm.diffDecorationsIgnoreTrimWhitespace');
                const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === 'inherit'
                    ? this.F.getValue('diffEditor.ignoreTrimWhitespace')
                    : ignoreTrimWhitespaceSetting !== 'false';
                const allDiffs = [];
                for (const quickDiff of filteredToDiffable) {
                    const dirtyDiff = await this.D.computeDirtyDiff(quickDiff.originalResource, this.h.resource, ignoreTrimWhitespace);
                    if (dirtyDiff) {
                        for (const diff of dirtyDiff) {
                            if (diff) {
                                allDiffs.push({ change: diff, label: quickDiff.label, uri: quickDiff.originalResource });
                            }
                        }
                    }
                }
                const sorted = allDiffs.sort((a, b) => compareChanges(a.change, b.change));
                const map = new Map();
                for (let i = 0; i < sorted.length; i++) {
                    const label = sorted[i].label;
                    if (!map.has(label)) {
                        map.set(label, []);
                    }
                    map.get(label).push(i);
                }
                return { changes: sorted, mapChanges: map };
            });
        }
        N() {
            if (this.m) {
                return this.m;
            }
            this.m = this.O().then(async (quickDiffs) => {
                if (this.t) { // disposed
                    return [];
                }
                if (quickDiffs.length === 0) {
                    this.c = [];
                    this.f.clear();
                    this.g = [];
                    return [];
                }
                if ((0, arrays_1.$sb)(this.c, quickDiffs, (a, b) => a.originalResource.toString() === b.originalResource.toString() && a.label === b.label)) {
                    return quickDiffs;
                }
                this.s.clear();
                this.f.clear();
                this.g = [];
                this.c = quickDiffs;
                return (await Promise.all(quickDiffs.map(async (quickDiff) => {
                    try {
                        const ref = await this.G.createModelReference(quickDiff.originalResource);
                        if (this.t) { // disposed
                            ref.dispose();
                            return [];
                        }
                        this.f.set(quickDiff.originalResource.toString(), ref.object);
                        this.g.push(ref.object.textEditorModel);
                        if ((0, textfiles_1.$LD)(ref.object)) {
                            const encoding = this.h.getEncoding();
                            if (encoding) {
                                ref.object.setEncoding(encoding, 1 /* EncodingMode.Decode */);
                            }
                        }
                        this.s.add(ref);
                        this.s.add(ref.object.textEditorModel.onDidChangeContent(() => this.J()));
                        return quickDiff;
                    }
                    catch (error) {
                        return []; // possibly invalid reference
                    }
                }))).flat();
            });
            return this.m.finally(() => {
                this.m = undefined;
            });
        }
        async O() {
            if (this.t) {
                return Promise.resolve([]);
            }
            const uri = this.h.resource;
            return this.C.getQuickDiffs(uri, this.h.getLanguageId(), this.h.textEditorModel ? (0, model_1.$Gu)(this.h.textEditorModel) : undefined);
        }
        findNextClosestChange(lineNumber, inclusive = true, provider) {
            let preferredProvider;
            if (!provider && inclusive) {
                preferredProvider = this.quickDiffs.find(value => value.isSCM)?.label;
            }
            const possibleChanges = [];
            for (let i = 0; i < this.changes.length; i++) {
                if (provider && this.changes[i].label !== provider) {
                    continue;
                }
                const change = this.changes[i];
                const possibleChangesLength = possibleChanges.length;
                if (inclusive) {
                    if (getModifiedEndLineNumber(change.change) >= lineNumber) {
                        if (preferredProvider && change.label !== preferredProvider) {
                            possibleChanges.push(i);
                        }
                        else {
                            return i;
                        }
                    }
                }
                else {
                    if (change.change.modifiedStartLineNumber > lineNumber) {
                        return i;
                    }
                }
                if ((possibleChanges.length > 0) && (possibleChanges.length === possibleChangesLength)) {
                    return possibleChanges[0];
                }
            }
            return possibleChanges.length > 0 ? possibleChanges[0] : 0;
        }
        findPreviousClosestChange(lineNumber, inclusive = true, provider) {
            for (let i = this.changes.length - 1; i >= 0; i--) {
                if (provider && this.changes[i].label !== provider) {
                    continue;
                }
                const change = this.changes[i].change;
                if (inclusive) {
                    if (change.modifiedStartLineNumber <= lineNumber) {
                        return i;
                    }
                }
                else {
                    if (getModifiedEndLineNumber(change) < lineNumber) {
                        return i;
                    }
                }
            }
            return this.changes.length - 1;
        }
        dispose() {
            super.dispose();
            this.t = true;
            this.c = [];
            this.f.clear();
            this.g = [];
            this.j.cancel();
            this.n.forEach(d => (0, lifecycle_1.$fc)(d));
            this.n.clear();
        }
    };
    exports.$keb = $keb;
    exports.$keb = $keb = __decorate([
        __param(1, scm_1.$fI),
        __param(2, quickDiff_1.$aeb),
        __param(3, editorWorker_1.$4Y),
        __param(4, configuration_1.$8h),
        __param(5, resolverService_1.$uA),
        __param(6, progress_1.$2u)
    ], $keb);
    class DirtyDiffItem {
        constructor(model, decorator) {
            this.model = model;
            this.decorator = decorator;
        }
        dispose() {
            this.decorator.dispose();
            this.model.dispose();
        }
    }
    let $leb = class $leb extends lifecycle_1.$kc {
        constructor(m, n, s, t) {
            super();
            this.m = m;
            this.n = n;
            this.s = s;
            this.t = t;
            this.c = false;
            this.f = { width: 3, visibility: 'always' };
            this.g = new map_1.$zi();
            this.h = this.B(new lifecycle_1.$jc());
            this.j = dom.$XO();
            this.B((0, lifecycle_1.$ic)(() => this.j.parentElement.removeChild(this.j)));
            const onDidChangeConfiguration = event_1.Event.filter(s.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorations'));
            this.B(onDidChangeConfiguration(this.u, this));
            this.u();
            const onDidChangeDiffWidthConfiguration = event_1.Event.filter(s.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterWidth'));
            onDidChangeDiffWidthConfiguration(this.w, this);
            this.w();
            const onDidChangeDiffVisibilityConfiguration = event_1.Event.filter(s.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterVisibility'));
            onDidChangeDiffVisibilityConfiguration(this.y, this);
            this.y();
        }
        u() {
            const enabled = this.s.getValue('scm.diffDecorations') !== 'none';
            if (enabled) {
                this.C();
            }
            else {
                this.D();
            }
        }
        w() {
            let width = this.s.getValue('scm.diffDecorationsGutterWidth');
            if (isNaN(width) || width <= 0 || width > 5) {
                width = 3;
            }
            this.z({ ...this.f, width });
        }
        y() {
            const visibility = this.s.getValue('scm.diffDecorationsGutterVisibility');
            this.z({ ...this.f, visibility });
        }
        z(state) {
            this.f = state;
            this.j.textContent = `
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-modified {
				border-left-width:${state.width}px;
			}
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-added-pattern:before,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-modified-pattern:before {
				background-size: ${state.width}px ${state.width}px;
			}
			.monaco-editor .dirty-diff-added,
			.monaco-editor .dirty-diff-added-pattern,
			.monaco-editor .dirty-diff-modified,
			.monaco-editor .dirty-diff-modified-pattern,
			.monaco-editor .dirty-diff-deleted {
				opacity: ${state.visibility === 'always' ? 1 : 0};
			}
		`;
        }
        C() {
            if (this.c) {
                this.D();
            }
            this.h.add(event_1.Event.any(this.m.onDidCloseEditor, this.m.onDidVisibleEditorsChange)(() => this.F()));
            this.F();
            this.c = true;
        }
        D() {
            if (!this.c) {
                return;
            }
            this.h.clear();
            for (const [, dirtyDiff] of this.g) {
                dirtyDiff.dispose();
            }
            this.g.clear();
            this.c = false;
        }
        F() {
            for (const editor of this.m.visibleTextEditorControls) {
                if ((0, editorBrowser_1.$iV)(editor)) {
                    const textModel = editor.getModel();
                    const controller = $ieb.get(editor);
                    if (controller) {
                        controller.modelRegistry = this;
                    }
                    if (textModel && !this.g.has(textModel.uri)) {
                        const textFileModel = this.t.files.get(textModel.uri);
                        if (textFileModel?.isResolved()) {
                            const dirtyDiffModel = this.n.createInstance($keb, textFileModel);
                            const decorator = new DirtyDiffDecorator(textFileModel.textEditorModel, dirtyDiffModel, this.s);
                            this.g.set(textModel.uri, new DirtyDiffItem(dirtyDiffModel, decorator));
                        }
                    }
                }
            }
            for (const [uri, item] of this.g) {
                if (!this.m.isOpened({ resource: uri, typeId: files_1.$8db, editorId: editor_1.$HE.id })) {
                    item.dispose();
                    this.g.delete(uri);
                }
            }
        }
        getModel(editorModel) {
            return this.g.get(editorModel.uri)?.model;
        }
        dispose() {
            this.D();
            super.dispose();
        }
    };
    exports.$leb = $leb;
    exports.$leb = $leb = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, instantiation_1.$Ah),
        __param(2, configuration_1.$8h),
        __param(3, textfiles_1.$JD)
    ], $leb);
    (0, editorExtensions_1.$AV)($ieb.ID, $ieb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=dirtydiffDecorator.js.map