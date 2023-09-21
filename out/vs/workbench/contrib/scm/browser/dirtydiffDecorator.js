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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/resolverService", "vs/editor/common/services/editorWorker", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/scm/common/scm", "vs/editor/common/model/textModel", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/editor/common/core/position", "vs/base/common/numbers", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/base/common/actions", "vs/platform/keybinding/common/keybinding", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/common/model", "vs/base/common/arrays", "vs/editor/browser/services/codeEditorService", "vs/base/browser/dom", "vs/workbench/services/textfile/common/textfiles", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/errors", "vs/workbench/common/contextkeys", "vs/platform/progress/common/progress", "vs/base/common/color", "vs/base/common/map", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor", "vs/workbench/contrib/files/common/files", "vs/platform/audioCues/browser/audioCueService", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/scm/common/quickDiff", "vs/workbench/contrib/scm/browser/dirtyDiffSwitcher", "vs/css!./media/dirtydiffDecorator"], function (require, exports, nls, async_1, lifecycle_1, event_1, instantiation_1, resolverService_1, editorWorker_1, configuration_1, scm_1, textModel_1, themeService_1, colorRegistry_1, editorBrowser_1, editorExtensions_1, peekView_1, contextkey_1, editorContextKeys_1, position_1, numbers_1, keybindingsRegistry_1, embeddedCodeEditorWidget_1, actions_1, keybinding_1, resources_1, actions_2, menuEntryActionViewItem_1, model_1, arrays_1, codeEditorService_1, dom, textfiles_1, iconRegistry_1, codicons_1, themables_1, errors_1, contextkeys_1, progress_1, color_1, map_1, editorService_1, editor_1, files_1, audioCueService_1, accessibility_1, quickDiff_1, dirtyDiffSwitcher_1) {
    "use strict";
    var DirtyDiffController_1, DirtyDiffDecorator_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DirtyDiffWorkbenchController = exports.DirtyDiffModel = exports.getOriginalResource = exports.DirtyDiffController = exports.GotoNextChangeAction = exports.GotoPreviousChangeAction = exports.ShowNextChangeAction = exports.ShowPreviousChangeAction = exports.isDirtyDiffVisible = void 0;
    class DiffActionRunner extends actions_1.ActionRunner {
        runAction(action, context) {
            if (action instanceof actions_2.MenuItemAction) {
                return action.run(...context);
            }
            return super.runAction(action, context);
        }
    }
    exports.isDirtyDiffVisible = new contextkey_1.RawContextKey('dirtyDiffVisible', false);
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
    let UIEditorAction = class UIEditorAction extends actions_1.Action {
        constructor(editor, action, cssClass, keybindingService, instantiationService) {
            const keybinding = keybindingService.lookupKeybinding(action.id);
            const label = action.label + (keybinding ? ` (${keybinding.getLabel()})` : '');
            super(action.id, label, cssClass);
            this.instantiationService = instantiationService;
            this.action = action;
            this.editor = editor;
        }
        run() {
            return Promise.resolve(this.instantiationService.invokeFunction(accessor => this.action.run(accessor, this.editor, null)));
        }
    };
    UIEditorAction = __decorate([
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService)
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
        const diffEditors = accessor.get(codeEditorService_1.ICodeEditorService).listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.hasTextFocus() && diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                return diffEditor.getParentEditor();
            }
        }
        return (0, peekView_1.getOuterEditor)(accessor);
    }
    let DirtyDiffWidget = class DirtyDiffWidget extends peekView_1.PeekViewWidget {
        constructor(editor, model, themeService, instantiationService, menuService, contextKeyService) {
            super(editor, { isResizeable: true, frameWidth: 1, keepEditorSelection: true, className: 'dirty-diff' }, instantiationService);
            this.model = model;
            this.themeService = themeService;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this._index = 0;
            this._provider = '';
            this.height = undefined;
            this._disposables.add(themeService.onDidColorThemeChange(this._applyTheme, this));
            this._applyTheme(themeService.getColorTheme());
            if (this.model.original.length > 0) {
                contextKeyService = contextKeyService.createOverlay([['originalResourceScheme', this.model.original[0].uri.scheme], ['originalResourceSchemes', this.model.original.map(original => original.uri.scheme)]]);
            }
            this.create();
            if (editor.hasModel()) {
                this.title = (0, resources_1.basename)(editor.getModel().uri);
            }
            else {
                this.title = '';
            }
            this.setTitle(this.title);
        }
        get provider() {
            return this._provider;
        }
        get index() {
            return this._index;
        }
        get visibleRange() {
            const visibleRanges = this.diffEditor.getModifiedEditor().getVisibleRanges();
            return visibleRanges.length >= 0 ? visibleRanges[0] : undefined;
        }
        showChange(index, usePosition = true) {
            const labeledChange = this.model.changes[index];
            const change = labeledChange.change;
            this._index = index;
            this.contextKeyService.createKey('originalResourceScheme', this.model.changes[index].uri.scheme);
            this.updateActions();
            this._provider = labeledChange.label;
            this.change = change;
            const originalModel = this.model.original;
            if (!originalModel) {
                return;
            }
            const onFirstDiffUpdate = event_1.Event.once(this.diffEditor.onDidUpdateDiff);
            // TODO@joao TODO@alex need this setTimeout probably because the
            // non-side-by-side diff still hasn't created the view zones
            onFirstDiffUpdate(() => setTimeout(() => this.revealChange(change), 0));
            const diffEditorModel = this.model.getDiffEditorModel(labeledChange.uri.toString());
            if (!diffEditorModel) {
                return;
            }
            this.diffEditor.setModel(diffEditorModel);
            this.dropdown?.setSelection(labeledChange.label);
            const position = new position_1.Position(getModifiedEndLineNumber(change), 1);
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            const editorHeight = this.editor.getLayoutInfo().height;
            const editorHeightInLines = Math.floor(editorHeight / lineHeight);
            const height = Math.min(getChangeHeight(change) + /* padding */ 8, Math.floor(editorHeightInLines / 3));
            this.renderTitle(labeledChange.label);
            const changeType = getChangeType(change);
            const changeTypeColor = getChangeTypeColor(this.themeService.getColorTheme(), changeType);
            this.style({ frameColor: changeTypeColor, arrowColor: changeTypeColor });
            const providerSpecificChanges = [];
            let contextIndex = index;
            for (const change of this.model.changes) {
                if (change.label === this.model.changes[this._index].label) {
                    providerSpecificChanges.push(change.change);
                    if (labeledChange === change) {
                        contextIndex = providerSpecificChanges.length - 1;
                    }
                }
            }
            this._actionbarWidget.context = [diffEditorModel.modified.uri, providerSpecificChanges, contextIndex];
            if (usePosition) {
                this.show(position, height);
            }
            this.editor.focus();
        }
        renderTitle(label) {
            const providerChanges = this.model.mapChanges.get(label);
            const providerIndex = providerChanges.indexOf(this._index);
            let detail;
            if (!this.shouldUseDropdown()) {
                detail = this.model.changes.length > 1
                    ? nls.localize('changes', "{0} - {1} of {2} changes", label, providerIndex + 1, providerChanges.length)
                    : nls.localize('change', "{0} - {1} of {2} change", label, providerIndex + 1, providerChanges.length);
                this.dropdownContainer.style.display = 'none';
            }
            else {
                detail = this.model.changes.length > 1
                    ? nls.localize('multiChanges', "{0} of {1} changes", providerIndex + 1, providerChanges.length)
                    : nls.localize('multiChange', "{0} of {1} change", providerIndex + 1, providerChanges.length);
                this.dropdownContainer.style.display = 'inherit';
            }
            this.setTitle(this.title, detail);
        }
        switchQuickDiff(event) {
            const newProvider = event?.provider;
            if (newProvider === this.model.changes[this._index].label) {
                return;
            }
            let closestGreaterIndex = this._index < this.model.changes.length - 1 ? this._index + 1 : 0;
            for (let i = closestGreaterIndex; i !== this._index; i < this.model.changes.length - 1 ? i++ : i = 0) {
                if (this.model.changes[i].label === newProvider) {
                    closestGreaterIndex = i;
                    break;
                }
            }
            let closestLesserIndex = this._index > 0 ? this._index - 1 : this.model.changes.length - 1;
            for (let i = closestLesserIndex; i !== this._index; i >= 0 ? i-- : i = this.model.changes.length - 1) {
                if (this.model.changes[i].label === newProvider) {
                    closestLesserIndex = i;
                    break;
                }
            }
            const closestIndex = Math.abs(this.model.changes[closestGreaterIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber)
                < Math.abs(this.model.changes[closestLesserIndex].change.modifiedEndLineNumber - this.model.changes[this._index].change.modifiedEndLineNumber)
                ? closestGreaterIndex : closestLesserIndex;
            this.showChange(closestIndex, false);
        }
        shouldUseDropdown() {
            let providersWithChangesCount = 0;
            if (this.model.mapChanges.size > 1) {
                const keys = Array.from(this.model.mapChanges.keys());
                for (let i = 0; (i < keys.length) && (providersWithChangesCount <= 1); i++) {
                    if (this.model.mapChanges.get(keys[i]).length > 0) {
                        providersWithChangesCount++;
                    }
                }
            }
            return providersWithChangesCount >= 2;
        }
        updateActions() {
            if (!this._actionbarWidget) {
                return;
            }
            const previous = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowPreviousChangeAction(this.editor), themables_1.ThemeIcon.asClassName(iconRegistry_1.gotoPreviousLocation));
            const next = this.instantiationService.createInstance(UIEditorAction, this.editor, new ShowNextChangeAction(this.editor), themables_1.ThemeIcon.asClassName(iconRegistry_1.gotoNextLocation));
            this._disposables.add(previous);
            this._disposables.add(next);
            const actions = [];
            if (this.menu) {
                this.menu.dispose();
            }
            this.menu = this.menuService.createMenu(actions_2.MenuId.SCMChangeContext, this.contextKeyService);
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { shouldForwardArgs: true }, actions);
            this._actionbarWidget.clear();
            this._actionbarWidget.push(actions.reverse(), { label: false, icon: true });
            this._actionbarWidget.push([next, previous], { label: false, icon: true });
            this._actionbarWidget.push(new actions_1.Action('peekview.close', nls.localize('label.close', "Close"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close), true, () => this.dispose()), { label: false, icon: true });
        }
        _fillHead(container) {
            super._fillHead(container, true);
            this.dropdownContainer = dom.prepend(this._titleElement, dom.$('.dropdown'));
            this.dropdown = this.instantiationService.createInstance(dirtyDiffSwitcher_1.SwitchQuickDiffViewItem, new dirtyDiffSwitcher_1.SwitchQuickDiffBaseAction((event) => this.switchQuickDiff(event)), this.model.quickDiffs.map(quickDiffer => quickDiffer.label), this.model.changes[this._index].label);
            this.dropdown.render(this.dropdownContainer);
            this.updateActions();
        }
        _getActionBarOptions() {
            const actionRunner = new DiffActionRunner();
            // close widget on successful action
            actionRunner.onDidRun(e => {
                if (!(e.action instanceof UIEditorAction) && !e.error) {
                    this.dispose();
                }
            });
            return {
                ...super._getActionBarOptions(),
                actionRunner
            };
        }
        _fillBody(container) {
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
            this.diffEditor = this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, container, options, {}, this.editor);
            this._disposables.add(this.diffEditor);
        }
        _onWidth(width) {
            if (typeof this.height === 'undefined') {
                return;
            }
            this.diffEditor.layout({ height: this.height, width });
        }
        _doLayoutBody(height, width) {
            super._doLayoutBody(height, width);
            this.diffEditor.layout({ height, width });
            if (typeof this.height === 'undefined' && this.change) {
                this.revealChange(this.change);
            }
            this.height = height;
        }
        revealChange(change) {
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
            this.diffEditor.revealLinesInCenter(start, end, 1 /* ScrollType.Immediate */);
        }
        _applyTheme(theme) {
            const borderColor = theme.getColor(peekView_1.peekViewBorder) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView_1.peekViewTitleBackground) || color_1.Color.transparent,
                primaryHeadingColor: theme.getColor(peekView_1.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(peekView_1.peekViewTitleInfoForeground)
            });
        }
        revealRange(range) {
            this.editor.revealLineInCenterIfOutsideViewport(range.endLineNumber, 0 /* ScrollType.Smooth */);
        }
        hasFocus() {
            return this.diffEditor.hasTextFocus();
        }
        dispose() {
            super.dispose();
            this.menu?.dispose();
        }
    };
    DirtyDiffWidget = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, actions_2.IMenuService),
        __param(5, contextkey_1.IContextKeyService)
    ], DirtyDiffWidget);
    class ShowPreviousChangeAction extends editorExtensions_1.EditorAction {
        constructor(outerEditor) {
            super({
                id: 'editor.action.dirtydiff.previous',
                label: nls.localize('show previous change', "Show Previous Change"),
                alias: 'Show Previous Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
            this.outerEditor = outerEditor;
        }
        run(accessor) {
            const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.previous();
        }
    }
    exports.ShowPreviousChangeAction = ShowPreviousChangeAction;
    (0, editorExtensions_1.registerEditorAction)(ShowPreviousChangeAction);
    class ShowNextChangeAction extends editorExtensions_1.EditorAction {
        constructor(outerEditor) {
            super({
                id: 'editor.action.dirtydiff.next',
                label: nls.localize('show next change', "Show Next Change"),
                alias: 'Show Next Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 61 /* KeyCode.F3 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
            this.outerEditor = outerEditor;
        }
        run(accessor) {
            const outerEditor = this.outerEditor ?? getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            if (!controller.canNavigate()) {
                return;
            }
            controller.next();
        }
    }
    exports.ShowNextChangeAction = ShowNextChangeAction;
    (0, editorExtensions_1.registerEditorAction)(ShowNextChangeAction);
    // Go to menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '7_change_nav',
        command: {
            id: 'editor.action.dirtydiff.next',
            title: nls.localize({ key: 'miGotoNextChange', comment: ['&& denotes a mnemonic'] }, "Next &&Change")
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '7_change_nav',
        command: {
            id: 'editor.action.dirtydiff.previous',
            title: nls.localize({ key: 'miGotoPreviousChange', comment: ['&& denotes a mnemonic'] }, "Previous &&Change")
        },
        order: 2
    });
    class GotoPreviousChangeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'workbench.action.editor.previousChange',
                label: nls.localize('move to previous change', "Go to Previous Change"),
                alias: 'Go to Previous Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
        }
        async run(accessor) {
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
            const accessibilityService = accessor.get(accessibility_1.IAccessibilityService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            if (!outerEditor || !outerEditor.hasModel()) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
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
    exports.GotoPreviousChangeAction = GotoPreviousChangeAction;
    (0, editorExtensions_1.registerEditorAction)(GotoPreviousChangeAction);
    class GotoNextChangeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'workbench.action.editor.nextChange',
                label: nls.localize('move to next change', "Go to Next Change"),
                alias: 'Go to Next Change',
                precondition: contextkeys_1.TextCompareEditorActiveContext.toNegated(),
                kbOpts: { kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus, primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */, weight: 100 /* KeybindingWeight.EditorContrib */ }
            });
        }
        async run(accessor) {
            const audioCueService = accessor.get(audioCueService_1.IAudioCueService);
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            const accessibilityService = accessor.get(accessibility_1.IAccessibilityService);
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            if (!outerEditor || !outerEditor.hasModel()) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
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
    exports.GotoNextChangeAction = GotoNextChangeAction;
    function setPositionAndSelection(change, editor, accessibilityService, codeEditorService) {
        const position = new position_1.Position(change.modifiedStartLineNumber, 1);
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
                audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
            case ChangeType.Delete:
                audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
            case ChangeType.Modify:
                audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineModified, { allowManyInParallel: true, source: 'dirtyDiffDecoration' });
                break;
        }
    }
    (0, editorExtensions_1.registerEditorAction)(GotoNextChangeAction);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'closeDirtyDiff',
        weight: 100 /* KeybindingWeight.EditorContrib */ + 50,
        primary: 9 /* KeyCode.Escape */,
        secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        when: contextkey_1.ContextKeyExpr.and(exports.isDirtyDiffVisible),
        handler: (accessor) => {
            const outerEditor = getOuterEditorFromDiffEditor(accessor);
            if (!outerEditor) {
                return;
            }
            const controller = DirtyDiffController.get(outerEditor);
            if (!controller) {
                return;
            }
            controller.close();
        }
    });
    let DirtyDiffController = class DirtyDiffController extends lifecycle_1.Disposable {
        static { DirtyDiffController_1 = this; }
        static { this.ID = 'editor.contrib.dirtydiff'; }
        static get(editor) {
            return editor.getContribution(DirtyDiffController_1.ID);
        }
        constructor(editor, contextKeyService, configurationService, instantiationService) {
            super();
            this.editor = editor;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.modelRegistry = null;
            this.model = null;
            this.widget = null;
            this.session = lifecycle_1.Disposable.None;
            this.mouseDownInfo = null;
            this.enabled = false;
            this.gutterActionDisposables = new lifecycle_1.DisposableStore();
            this.enabled = !contextKeyService.getContextKeyValue('isInDiffEditor');
            this.stylesheet = dom.createStyleSheet();
            this._register((0, lifecycle_1.toDisposable)(() => this.stylesheet.remove()));
            if (this.enabled) {
                this.isDirtyDiffVisible = exports.isDirtyDiffVisible.bindTo(contextKeyService);
                this._register(editor.onDidChangeModel(() => this.close()));
                const onDidChangeGutterAction = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterAction'));
                this._register(onDidChangeGutterAction(this.onDidChangeGutterAction, this));
                this.onDidChangeGutterAction();
            }
        }
        onDidChangeGutterAction() {
            const gutterAction = this.configurationService.getValue('scm.diffDecorationsGutterAction');
            this.gutterActionDisposables.clear();
            if (gutterAction === 'diff') {
                this.gutterActionDisposables.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
                this.gutterActionDisposables.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
                this.stylesheet.textContent = `
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
                this.stylesheet.textContent = ``;
            }
        }
        canNavigate() {
            return !this.widget || (this.widget?.index === -1) || (!!this.model && this.model.changes.length > 1);
        }
        refresh() {
            this.widget?.showChange(this.widget.index, false);
        }
        next(lineNumber) {
            if (!this.assertWidget()) {
                return;
            }
            if (!this.widget || !this.model) {
                return;
            }
            let index;
            if (this.editor.hasModel() && (typeof lineNumber === 'number' || !this.widget.provider)) {
                index = this.model.findNextClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
            }
            else {
                const providerChanges = this.model.mapChanges.get(this.widget.provider) ?? this.model.mapChanges.values().next().value;
                const mapIndex = providerChanges.findIndex(value => value === this.widget.index);
                index = providerChanges[(0, numbers_1.rot)(mapIndex + 1, providerChanges.length)];
            }
            this.widget.showChange(index);
        }
        previous(lineNumber) {
            if (!this.assertWidget()) {
                return;
            }
            if (!this.widget || !this.model) {
                return;
            }
            let index;
            if (this.editor.hasModel() && (typeof lineNumber === 'number')) {
                index = this.model.findPreviousClosestChange(typeof lineNumber === 'number' ? lineNumber : this.editor.getPosition().lineNumber, true, this.widget.provider);
            }
            else {
                const providerChanges = this.model.mapChanges.get(this.widget.provider) ?? this.model.mapChanges.values().next().value;
                const mapIndex = providerChanges.findIndex(value => value === this.widget.index);
                index = providerChanges[(0, numbers_1.rot)(mapIndex - 1, providerChanges.length)];
            }
            this.widget.showChange(index);
        }
        close() {
            this.session.dispose();
            this.session = lifecycle_1.Disposable.None;
        }
        assertWidget() {
            if (!this.enabled) {
                return false;
            }
            if (this.widget) {
                if (!this.model || this.model.changes.length === 0) {
                    this.close();
                    return false;
                }
                return true;
            }
            if (!this.modelRegistry) {
                return false;
            }
            const editorModel = this.editor.getModel();
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
            this.model = model;
            this.widget = this.instantiationService.createInstance(DirtyDiffWidget, this.editor, model);
            this.isDirtyDiffVisible.set(true);
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(event_1.Event.once(this.widget.onDidClose)(this.close, this));
            const onDidModelChange = event_1.Event.chain(model.onDidChange, $ => $.filter(e => e.diff.length > 0)
                .map(e => e.diff));
            onDidModelChange(this.onDidModelChange, this, disposables);
            disposables.add(this.widget);
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                this.model = null;
                this.widget = null;
                this.isDirtyDiffVisible.set(false);
                this.editor.focus();
            }));
            this.session = disposables;
            return true;
        }
        onDidModelChange(splices) {
            if (!this.model || !this.widget || this.widget.hasFocus()) {
                return;
            }
            for (const splice of splices) {
                if (splice.start <= this.widget.index) {
                    this.next();
                    return;
                }
            }
            this.refresh();
        }
        onEditorMouseDown(e) {
            this.mouseDownInfo = null;
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
            this.mouseDownInfo = { lineNumber: range.startLineNumber };
        }
        onEditorMouseUp(e) {
            if (!this.mouseDownInfo) {
                return;
            }
            const { lineNumber } = this.mouseDownInfo;
            this.mouseDownInfo = null;
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
            const editorModel = this.editor.getModel();
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
            if (index === this.widget?.index) {
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
            if (!this.editor.hasModel()) {
                return [];
            }
            const model = this.modelRegistry.getModel(this.editor.getModel());
            if (!model) {
                return [];
            }
            return model.changes.map(change => change.change);
        }
        dispose() {
            this.gutterActionDisposables.dispose();
            super.dispose();
        }
    };
    exports.DirtyDiffController = DirtyDiffController;
    exports.DirtyDiffController = DirtyDiffController = DirtyDiffController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, instantiation_1.IInstantiationService)
    ], DirtyDiffController);
    const editorGutterModifiedBackground = (0, colorRegistry_1.registerColor)('editorGutter.modifiedBackground', {
        dark: '#1B81A8',
        light: '#2090D3',
        hcDark: '#1B81A8',
        hcLight: '#2090D3'
    }, nls.localize('editorGutterModifiedBackground', "Editor gutter background color for lines that are modified."));
    const editorGutterAddedBackground = (0, colorRegistry_1.registerColor)('editorGutter.addedBackground', {
        dark: '#487E02',
        light: '#48985D',
        hcDark: '#487E02',
        hcLight: '#48985D'
    }, nls.localize('editorGutterAddedBackground', "Editor gutter background color for lines that are added."));
    const editorGutterDeletedBackground = (0, colorRegistry_1.registerColor)('editorGutter.deletedBackground', {
        dark: colorRegistry_1.editorErrorForeground,
        light: colorRegistry_1.editorErrorForeground,
        hcDark: colorRegistry_1.editorErrorForeground,
        hcLight: colorRegistry_1.editorErrorForeground
    }, nls.localize('editorGutterDeletedBackground', "Editor gutter background color for lines that are deleted."));
    const minimapGutterModifiedBackground = (0, colorRegistry_1.registerColor)('minimapGutter.modifiedBackground', {
        dark: editorGutterModifiedBackground,
        light: editorGutterModifiedBackground,
        hcDark: editorGutterModifiedBackground,
        hcLight: editorGutterModifiedBackground
    }, nls.localize('minimapGutterModifiedBackground', "Minimap gutter background color for lines that are modified."));
    const minimapGutterAddedBackground = (0, colorRegistry_1.registerColor)('minimapGutter.addedBackground', {
        dark: editorGutterAddedBackground,
        light: editorGutterAddedBackground,
        hcDark: editorGutterAddedBackground,
        hcLight: editorGutterAddedBackground
    }, nls.localize('minimapGutterAddedBackground', "Minimap gutter background color for lines that are added."));
    const minimapGutterDeletedBackground = (0, colorRegistry_1.registerColor)('minimapGutter.deletedBackground', {
        dark: editorGutterDeletedBackground,
        light: editorGutterDeletedBackground,
        hcDark: editorGutterDeletedBackground,
        hcLight: editorGutterDeletedBackground
    }, nls.localize('minimapGutterDeletedBackground', "Minimap gutter background color for lines that are deleted."));
    const overviewRulerModifiedForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.modifiedForeground', { dark: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6), light: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6), hcDark: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6), hcLight: (0, colorRegistry_1.transparent)(editorGutterModifiedBackground, 0.6) }, nls.localize('overviewRulerModifiedForeground', 'Overview ruler marker color for modified content.'));
    const overviewRulerAddedForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.addedForeground', { dark: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6), light: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6), hcDark: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6), hcLight: (0, colorRegistry_1.transparent)(editorGutterAddedBackground, 0.6) }, nls.localize('overviewRulerAddedForeground', 'Overview ruler marker color for added content.'));
    const overviewRulerDeletedForeground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.deletedForeground', { dark: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6), light: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6), hcDark: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6), hcLight: (0, colorRegistry_1.transparent)(editorGutterDeletedBackground, 0.6) }, nls.localize('overviewRulerDeletedForeground', 'Overview ruler marker color for deleted content.'));
    let DirtyDiffDecorator = DirtyDiffDecorator_1 = class DirtyDiffDecorator extends lifecycle_1.Disposable {
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
                    color: (0, themeService_1.themeColorFromId)(options.overview.color),
                    position: model_1.OverviewRulerLane.Left
                };
            }
            if (options.minimap.active) {
                decorationOptions.minimap = {
                    color: (0, themeService_1.themeColorFromId)(options.minimap.color),
                    position: model_1.MinimapPosition.Gutter
                };
            }
            return textModel_1.ModelDecorationOptions.createDynamic(decorationOptions);
        }
        constructor(editorModel, model, configurationService) {
            super();
            this.model = model;
            this.configurationService = configurationService;
            this.decorations = [];
            this.editorModel = editorModel;
            const decorations = configurationService.getValue('scm.diffDecorations');
            const gutter = decorations === 'all' || decorations === 'gutter';
            const overview = decorations === 'all' || decorations === 'overview';
            const minimap = decorations === 'all' || decorations === 'minimap';
            this.addedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-added', {
                gutter,
                overview: { active: overview, color: overviewRulerAddedForeground },
                minimap: { active: minimap, color: minimapGutterAddedBackground },
                isWholeLine: true
            });
            this.addedPatternOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-added-pattern', {
                gutter,
                overview: { active: overview, color: overviewRulerAddedForeground },
                minimap: { active: minimap, color: minimapGutterAddedBackground },
                isWholeLine: true
            });
            this.modifiedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified', {
                gutter,
                overview: { active: overview, color: overviewRulerModifiedForeground },
                minimap: { active: minimap, color: minimapGutterModifiedBackground },
                isWholeLine: true
            });
            this.modifiedPatternOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-modified-pattern', {
                gutter,
                overview: { active: overview, color: overviewRulerModifiedForeground },
                minimap: { active: minimap, color: minimapGutterModifiedBackground },
                isWholeLine: true
            });
            this.deletedOptions = DirtyDiffDecorator_1.createDecoration('dirty-diff-deleted', {
                gutter,
                overview: { active: overview, color: overviewRulerDeletedForeground },
                minimap: { active: minimap, color: minimapGutterDeletedBackground },
                isWholeLine: false
            });
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('scm.diffDecorationsGutterPattern')) {
                    this.onDidChange();
                }
            }));
            this._register(model.onDidChange(this.onDidChange, this));
        }
        onDidChange() {
            if (!this.editorModel) {
                return;
            }
            const pattern = this.configurationService.getValue('scm.diffDecorationsGutterPattern');
            const decorations = this.model.changes.map((labeledChange) => {
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
                            options: pattern.added ? this.addedPatternOptions : this.addedOptions
                        };
                    case ChangeType.Delete:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: Number.MAX_VALUE,
                                endLineNumber: startLineNumber, endColumn: Number.MAX_VALUE
                            },
                            options: this.deletedOptions
                        };
                    case ChangeType.Modify:
                        return {
                            range: {
                                startLineNumber: startLineNumber, startColumn: 1,
                                endLineNumber: endLineNumber, endColumn: 1
                            },
                            options: pattern.modified ? this.modifiedPatternOptions : this.modifiedOptions
                        };
                }
            });
            this.decorations = this.editorModel.deltaDecorations(this.decorations, decorations);
        }
        dispose() {
            super.dispose();
            if (this.editorModel && !this.editorModel.isDisposed()) {
                this.editorModel.deltaDecorations(this.decorations, []);
            }
            this.editorModel = null;
            this.decorations = [];
        }
    };
    DirtyDiffDecorator = DirtyDiffDecorator_1 = __decorate([
        __param(2, configuration_1.IConfigurationService)
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
    async function getOriginalResource(quickDiffService, uri, language, isSynchronized) {
        const quickDiffs = await quickDiffService.getQuickDiffs(uri, language, isSynchronized);
        return quickDiffs.length > 0 ? quickDiffs[0].originalResource : null;
    }
    exports.getOriginalResource = getOriginalResource;
    let DirtyDiffModel = class DirtyDiffModel extends lifecycle_1.Disposable {
        get original() { return this._originalTextModels; }
        get changes() { return this._changes; }
        get mapChanges() { return this._mapChanges; }
        constructor(textFileModel, scmService, quickDiffService, editorWorkerService, configurationService, textModelResolverService, progressService) {
            super();
            this.scmService = scmService;
            this.quickDiffService = quickDiffService;
            this.editorWorkerService = editorWorkerService;
            this.configurationService = configurationService;
            this.textModelResolverService = textModelResolverService;
            this.progressService = progressService;
            this._quickDiffs = [];
            this._originalModels = new Map(); // key is uri.toString()
            this._originalTextModels = [];
            this.diffDelayer = new async_1.ThrottledDelayer(200);
            this.repositoryDisposables = new Set();
            this.originalModelDisposables = this._register(new lifecycle_1.DisposableStore());
            this._disposed = false;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._changes = [];
            this._mapChanges = new Map(); // key is the quick diff name, value is the index of the change in this._changes
            this._model = textFileModel;
            this._register(textFileModel.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
            this._register(event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsIgnoreTrimWhitespace') || e.affectsConfiguration('diffEditor.ignoreTrimWhitespace'))(this.triggerDiff, this));
            this._register(scmService.onDidAddRepository(this.onDidAddRepository, this));
            for (const r of scmService.repositories) {
                this.onDidAddRepository(r);
            }
            this._register(this._model.onDidChangeEncoding(() => {
                this.diffDelayer.cancel();
                this._quickDiffs = [];
                this._originalModels.clear();
                this._originalTextModels = [];
                this._quickDiffsPromise = undefined;
                this.setChanges([], new Map());
                this.triggerDiff();
            }));
            this._register(this.quickDiffService.onDidChangeQuickDiffProviders(() => this.triggerDiff()));
            this.triggerDiff();
        }
        get quickDiffs() {
            return this._quickDiffs;
        }
        getDiffEditorModel(originalUri) {
            if (!this._originalModels.has(originalUri)) {
                return;
            }
            const original = this._originalModels.get(originalUri);
            return {
                modified: this._model.textEditorModel,
                original: original.textEditorModel
            };
        }
        onDidAddRepository(repository) {
            const disposables = new lifecycle_1.DisposableStore();
            this.repositoryDisposables.add(disposables);
            disposables.add((0, lifecycle_1.toDisposable)(() => this.repositoryDisposables.delete(disposables)));
            const onDidChange = event_1.Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
            disposables.add(onDidChange(this.triggerDiff, this));
            const onDidRemoveThis = event_1.Event.filter(this.scmService.onDidRemoveRepository, r => r === repository);
            disposables.add(onDidRemoveThis(() => (0, lifecycle_1.dispose)(disposables), null));
            this.triggerDiff();
        }
        triggerDiff() {
            if (!this.diffDelayer) {
                return Promise.resolve(null);
            }
            return this.diffDelayer
                .trigger(() => this.diff())
                .then((result) => {
                const originalModels = Array.from(this._originalModels.values());
                if (!result || this._disposed || this._model.isDisposed() || originalModels.some(originalModel => originalModel.isDisposed())) {
                    return; // disposed
                }
                if (originalModels.every(originalModel => originalModel.textEditorModel.getValueLength() === 0)) {
                    result.changes = [];
                }
                if (!result.changes) {
                    result.changes = [];
                }
                this.setChanges(result.changes, result.mapChanges);
            }, (err) => (0, errors_1.onUnexpectedError)(err));
        }
        setChanges(changes, mapChanges) {
            const diff = (0, arrays_1.sortedDiff)(this._changes, changes, (a, b) => compareChanges(a.change, b.change));
            this._changes = changes;
            this._mapChanges = mapChanges;
            this._onDidChange.fire({ changes, diff });
        }
        diff() {
            return this.progressService.withProgress({ location: 3 /* ProgressLocation.Scm */, delay: 250 }, async () => {
                const originalURIs = await this.getQuickDiffsPromise();
                if (this._disposed || this._model.isDisposed() || (originalURIs.length === 0)) {
                    return Promise.resolve({ changes: [], mapChanges: new Map() }); // disposed
                }
                const filteredToDiffable = originalURIs.filter(quickDiff => this.editorWorkerService.canComputeDirtyDiff(quickDiff.originalResource, this._model.resource));
                if (filteredToDiffable.length === 0) {
                    return Promise.resolve({ changes: [], mapChanges: new Map() }); // All files are too large
                }
                const ignoreTrimWhitespaceSetting = this.configurationService.getValue('scm.diffDecorationsIgnoreTrimWhitespace');
                const ignoreTrimWhitespace = ignoreTrimWhitespaceSetting === 'inherit'
                    ? this.configurationService.getValue('diffEditor.ignoreTrimWhitespace')
                    : ignoreTrimWhitespaceSetting !== 'false';
                const allDiffs = [];
                for (const quickDiff of filteredToDiffable) {
                    const dirtyDiff = await this.editorWorkerService.computeDirtyDiff(quickDiff.originalResource, this._model.resource, ignoreTrimWhitespace);
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
        getQuickDiffsPromise() {
            if (this._quickDiffsPromise) {
                return this._quickDiffsPromise;
            }
            this._quickDiffsPromise = this.getOriginalResource().then(async (quickDiffs) => {
                if (this._disposed) { // disposed
                    return [];
                }
                if (quickDiffs.length === 0) {
                    this._quickDiffs = [];
                    this._originalModels.clear();
                    this._originalTextModels = [];
                    return [];
                }
                if ((0, arrays_1.equals)(this._quickDiffs, quickDiffs, (a, b) => a.originalResource.toString() === b.originalResource.toString() && a.label === b.label)) {
                    return quickDiffs;
                }
                this.originalModelDisposables.clear();
                this._originalModels.clear();
                this._originalTextModels = [];
                this._quickDiffs = quickDiffs;
                return (await Promise.all(quickDiffs.map(async (quickDiff) => {
                    try {
                        const ref = await this.textModelResolverService.createModelReference(quickDiff.originalResource);
                        if (this._disposed) { // disposed
                            ref.dispose();
                            return [];
                        }
                        this._originalModels.set(quickDiff.originalResource.toString(), ref.object);
                        this._originalTextModels.push(ref.object.textEditorModel);
                        if ((0, textfiles_1.isTextFileEditorModel)(ref.object)) {
                            const encoding = this._model.getEncoding();
                            if (encoding) {
                                ref.object.setEncoding(encoding, 1 /* EncodingMode.Decode */);
                            }
                        }
                        this.originalModelDisposables.add(ref);
                        this.originalModelDisposables.add(ref.object.textEditorModel.onDidChangeContent(() => this.triggerDiff()));
                        return quickDiff;
                    }
                    catch (error) {
                        return []; // possibly invalid reference
                    }
                }))).flat();
            });
            return this._quickDiffsPromise.finally(() => {
                this._quickDiffsPromise = undefined;
            });
        }
        async getOriginalResource() {
            if (this._disposed) {
                return Promise.resolve([]);
            }
            const uri = this._model.resource;
            return this.quickDiffService.getQuickDiffs(uri, this._model.getLanguageId(), this._model.textEditorModel ? (0, model_1.shouldSynchronizeModel)(this._model.textEditorModel) : undefined);
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
            this._disposed = true;
            this._quickDiffs = [];
            this._originalModels.clear();
            this._originalTextModels = [];
            this.diffDelayer.cancel();
            this.repositoryDisposables.forEach(d => (0, lifecycle_1.dispose)(d));
            this.repositoryDisposables.clear();
        }
    };
    exports.DirtyDiffModel = DirtyDiffModel;
    exports.DirtyDiffModel = DirtyDiffModel = __decorate([
        __param(1, scm_1.ISCMService),
        __param(2, quickDiff_1.IQuickDiffService),
        __param(3, editorWorker_1.IEditorWorkerService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, resolverService_1.ITextModelService),
        __param(6, progress_1.IProgressService)
    ], DirtyDiffModel);
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
    let DirtyDiffWorkbenchController = class DirtyDiffWorkbenchController extends lifecycle_1.Disposable {
        constructor(editorService, instantiationService, configurationService, textFileService) {
            super();
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.textFileService = textFileService;
            this.enabled = false;
            this.viewState = { width: 3, visibility: 'always' };
            this.items = new map_1.ResourceMap();
            this.transientDisposables = this._register(new lifecycle_1.DisposableStore());
            this.stylesheet = dom.createStyleSheet();
            this._register((0, lifecycle_1.toDisposable)(() => this.stylesheet.parentElement.removeChild(this.stylesheet)));
            const onDidChangeConfiguration = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorations'));
            this._register(onDidChangeConfiguration(this.onDidChangeConfiguration, this));
            this.onDidChangeConfiguration();
            const onDidChangeDiffWidthConfiguration = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterWidth'));
            onDidChangeDiffWidthConfiguration(this.onDidChangeDiffWidthConfiguration, this);
            this.onDidChangeDiffWidthConfiguration();
            const onDidChangeDiffVisibilityConfiguration = event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.diffDecorationsGutterVisibility'));
            onDidChangeDiffVisibilityConfiguration(this.onDidChangeDiffVisibiltiyConfiguration, this);
            this.onDidChangeDiffVisibiltiyConfiguration();
        }
        onDidChangeConfiguration() {
            const enabled = this.configurationService.getValue('scm.diffDecorations') !== 'none';
            if (enabled) {
                this.enable();
            }
            else {
                this.disable();
            }
        }
        onDidChangeDiffWidthConfiguration() {
            let width = this.configurationService.getValue('scm.diffDecorationsGutterWidth');
            if (isNaN(width) || width <= 0 || width > 5) {
                width = 3;
            }
            this.setViewState({ ...this.viewState, width });
        }
        onDidChangeDiffVisibiltiyConfiguration() {
            const visibility = this.configurationService.getValue('scm.diffDecorationsGutterVisibility');
            this.setViewState({ ...this.viewState, visibility });
        }
        setViewState(state) {
            this.viewState = state;
            this.stylesheet.textContent = `
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
        enable() {
            if (this.enabled) {
                this.disable();
            }
            this.transientDisposables.add(event_1.Event.any(this.editorService.onDidCloseEditor, this.editorService.onDidVisibleEditorsChange)(() => this.onEditorsChanged()));
            this.onEditorsChanged();
            this.enabled = true;
        }
        disable() {
            if (!this.enabled) {
                return;
            }
            this.transientDisposables.clear();
            for (const [, dirtyDiff] of this.items) {
                dirtyDiff.dispose();
            }
            this.items.clear();
            this.enabled = false;
        }
        onEditorsChanged() {
            for (const editor of this.editorService.visibleTextEditorControls) {
                if ((0, editorBrowser_1.isCodeEditor)(editor)) {
                    const textModel = editor.getModel();
                    const controller = DirtyDiffController.get(editor);
                    if (controller) {
                        controller.modelRegistry = this;
                    }
                    if (textModel && !this.items.has(textModel.uri)) {
                        const textFileModel = this.textFileService.files.get(textModel.uri);
                        if (textFileModel?.isResolved()) {
                            const dirtyDiffModel = this.instantiationService.createInstance(DirtyDiffModel, textFileModel);
                            const decorator = new DirtyDiffDecorator(textFileModel.textEditorModel, dirtyDiffModel, this.configurationService);
                            this.items.set(textModel.uri, new DirtyDiffItem(dirtyDiffModel, decorator));
                        }
                    }
                }
            }
            for (const [uri, item] of this.items) {
                if (!this.editorService.isOpened({ resource: uri, typeId: files_1.FILE_EDITOR_INPUT_ID, editorId: editor_1.DEFAULT_EDITOR_ASSOCIATION.id })) {
                    item.dispose();
                    this.items.delete(uri);
                }
            }
        }
        getModel(editorModel) {
            return this.items.get(editorModel.uri)?.model;
        }
        dispose() {
            this.disable();
            super.dispose();
        }
    };
    exports.DirtyDiffWorkbenchController = DirtyDiffWorkbenchController;
    exports.DirtyDiffWorkbenchController = DirtyDiffWorkbenchController = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, textfiles_1.ITextFileService)
    ], DirtyDiffWorkbenchController);
    (0, editorExtensions_1.registerEditorContribution)(DirtyDiffController.ID, DirtyDiffController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlydHlkaWZmRGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2NtL2Jyb3dzZXIvZGlydHlkaWZmRGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0RGhHLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVk7UUFFdkIsU0FBUyxDQUFDLE1BQWUsRUFBRSxPQUFZO1lBQ3pELElBQUksTUFBTSxZQUFZLHdCQUFjLEVBQUU7Z0JBQ3JDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO2FBQzlCO1lBRUQsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0Q7SUFVWSxRQUFBLGtCQUFrQixHQUFHLElBQUksMEJBQWEsQ0FBVSxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV4RixTQUFTLGVBQWUsQ0FBQyxNQUFlO1FBQ3ZDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBQ25GLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDO1FBRW5GLElBQUksTUFBTSxDQUFDLHFCQUFxQixLQUFLLENBQUMsRUFBRTtZQUN2QyxPQUFPLFFBQVEsQ0FBQztTQUNoQjthQUFNLElBQUksTUFBTSxDQUFDLHFCQUFxQixLQUFLLENBQUMsRUFBRTtZQUM5QyxPQUFPLFFBQVEsQ0FBQztTQUNoQjthQUFNO1lBQ04sT0FBTyxRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQzNCO0lBQ0YsQ0FBQztJQUVELFNBQVMsd0JBQXdCLENBQUMsTUFBZTtRQUNoRCxJQUFJ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