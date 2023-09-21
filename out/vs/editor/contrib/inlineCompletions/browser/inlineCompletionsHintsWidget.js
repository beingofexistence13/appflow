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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/platform", "vs/base/common/themables", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/iconRegistry", "vs/css!./inlineCompletionsHintsWidget"], function (require, exports, dom_1, actionViewItems_1, keybindingLabel_1, actions_1, arrays_1, async_1, codicons_1, lifecycle_1, observable_1, platform_1, themables_1, position_1, languages_1, commandIds_1, nls_1, menuEntryActionViewItem_1, toolbar_1, actions_2, commands_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, telemetry_1, iconRegistry_1) {
    "use strict";
    var InlineSuggestionHintsContentWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomizedMenuWorkbenchToolBar = exports.InlineSuggestionHintsContentWidget = exports.InlineCompletionsHintsWidget = void 0;
    let InlineCompletionsHintsWidget = class InlineCompletionsHintsWidget extends lifecycle_1.Disposable {
        constructor(editor, model, instantiationService) {
            super();
            this.editor = editor;
            this.model = model;
            this.instantiationService = instantiationService;
            this.alwaysShowToolbar = (0, observable_1.observableFromEvent)(this.editor.onDidChangeConfiguration, () => this.editor.getOption(62 /* EditorOption.inlineSuggest */).showToolbar === 'always');
            this.sessionPosition = undefined;
            this.position = (0, observable_1.derived)(this, reader => {
                const ghostText = this.model.read(reader)?.ghostText.read(reader);
                if (!this.alwaysShowToolbar.read(reader) || !ghostText || ghostText.parts.length === 0) {
                    this.sessionPosition = undefined;
                    return null;
                }
                const firstColumn = ghostText.parts[0].column;
                if (this.sessionPosition && this.sessionPosition.lineNumber !== ghostText.lineNumber) {
                    this.sessionPosition = undefined;
                }
                const position = new position_1.Position(ghostText.lineNumber, Math.min(firstColumn, this.sessionPosition?.column ?? Number.MAX_SAFE_INTEGER));
                this.sessionPosition = position;
                return position;
            });
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description setup content widget */
                const model = this.model.read(reader);
                if (!model || !this.alwaysShowToolbar.read(reader)) {
                    return;
                }
                const contentWidget = store.add(this.instantiationService.createInstance(InlineSuggestionHintsContentWidget, this.editor, true, this.position, model.selectedInlineCompletionIndex, model.inlineCompletionsCount, model.selectedInlineCompletion.map(v => v?.inlineCompletion.source.inlineCompletions.commands ?? [])));
                editor.addContentWidget(contentWidget);
                store.add((0, lifecycle_1.toDisposable)(() => editor.removeContentWidget(contentWidget)));
                store.add((0, observable_1.autorun)(reader => {
                    /** @description request explicit */
                    const position = this.position.read(reader);
                    if (!position) {
                        return;
                    }
                    if (model.lastTriggerKind.read(reader) !== languages_1.InlineCompletionTriggerKind.Explicit) {
                        model.triggerExplicitly();
                    }
                }));
            }));
        }
    };
    exports.InlineCompletionsHintsWidget = InlineCompletionsHintsWidget;
    exports.InlineCompletionsHintsWidget = InlineCompletionsHintsWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], InlineCompletionsHintsWidget);
    const inlineSuggestionHintsNextIcon = (0, iconRegistry_1.registerIcon)('inline-suggestion-hints-next', codicons_1.Codicon.chevronRight, (0, nls_1.localize)('parameterHintsNextIcon', 'Icon for show next parameter hint.'));
    const inlineSuggestionHintsPreviousIcon = (0, iconRegistry_1.registerIcon)('inline-suggestion-hints-previous', codicons_1.Codicon.chevronLeft, (0, nls_1.localize)('parameterHintsPreviousIcon', 'Icon for show previous parameter hint.'));
    let InlineSuggestionHintsContentWidget = class InlineSuggestionHintsContentWidget extends lifecycle_1.Disposable {
        static { InlineSuggestionHintsContentWidget_1 = this; }
        static { this._dropDownVisible = false; }
        static get dropDownVisible() { return this._dropDownVisible; }
        static { this.id = 0; }
        createCommandAction(commandId, label, iconClassName) {
            const action = new actions_1.Action(commandId, label, iconClassName, true, () => this._commandService.executeCommand(commandId));
            const kb = this.keybindingService.lookupKeybinding(commandId, this._contextKeyService);
            let tooltip = label;
            if (kb) {
                tooltip = (0, nls_1.localize)({ key: 'content', comment: ['A label', 'A keybinding'] }, '{0} ({1})', label, kb.getLabel());
            }
            action.tooltip = tooltip;
            return action;
        }
        constructor(editor, withBorder, _position, _currentSuggestionIdx, _suggestionCount, _extraCommands, _commandService, instantiationService, keybindingService, _contextKeyService, _menuService) {
            super();
            this.editor = editor;
            this.withBorder = withBorder;
            this._position = _position;
            this._currentSuggestionIdx = _currentSuggestionIdx;
            this._suggestionCount = _suggestionCount;
            this._extraCommands = _extraCommands;
            this._commandService = _commandService;
            this.keybindingService = keybindingService;
            this._contextKeyService = _contextKeyService;
            this._menuService = _menuService;
            this.id = `InlineSuggestionHintsContentWidget${InlineSuggestionHintsContentWidget_1.id++}`;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this.nodes = (0, dom_1.h)('div.inlineSuggestionsHints', { className: this.withBorder ? '.withBorder' : '' }, [
                (0, dom_1.h)('div@toolBar'),
            ]);
            this.previousAction = this.createCommandAction(commandIds_1.showPreviousInlineSuggestionActionId, (0, nls_1.localize)('previous', 'Previous'), themables_1.ThemeIcon.asClassName(inlineSuggestionHintsPreviousIcon));
            this.availableSuggestionCountAction = new actions_1.Action('inlineSuggestionHints.availableSuggestionCount', '', undefined, false);
            this.nextAction = this.createCommandAction(commandIds_1.showNextInlineSuggestionActionId, (0, nls_1.localize)('next', 'Next'), themables_1.ThemeIcon.asClassName(inlineSuggestionHintsNextIcon));
            // TODO@hediet: deprecate MenuId.InlineCompletionsActions
            this.inlineCompletionsActionsMenus = this._register(this._menuService.createMenu(actions_2.MenuId.InlineCompletionsActions, this._contextKeyService));
            this.clearAvailableSuggestionCountLabelDebounced = this._register(new async_1.RunOnceScheduler(() => {
                this.availableSuggestionCountAction.label = '';
            }, 100));
            this.disableButtonsDebounced = this._register(new async_1.RunOnceScheduler(() => {
                this.previousAction.enabled = this.nextAction.enabled = false;
            }, 100));
            this.lastCommands = [];
            this.toolBar = this._register(instantiationService.createInstance(CustomizedMenuWorkbenchToolBar, this.nodes.toolBar, actions_2.MenuId.InlineSuggestionToolbar, {
                menuOptions: { renderShortTitle: true },
                toolbarOptions: { primaryGroup: g => g.startsWith('primary') },
                actionViewItemProvider: (action, options) => {
                    if (action instanceof actions_2.MenuItemAction) {
                        return instantiationService.createInstance(StatusBarViewItem, action, undefined);
                    }
                    if (action === this.availableSuggestionCountAction) {
                        const a = new ActionViewItemWithClassName(undefined, action, { label: true, icon: false });
                        a.setClass('availableSuggestionCount');
                        return a;
                    }
                    return undefined;
                },
                telemetrySource: 'InlineSuggestionToolbar',
            }));
            this.toolBar.setPrependedPrimaryActions([
                this.previousAction,
                this.availableSuggestionCountAction,
                this.nextAction,
            ]);
            this._register(this.toolBar.onDidChangeDropdownVisibility(e => {
                InlineSuggestionHintsContentWidget_1._dropDownVisible = e;
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update position */
                this._position.read(reader);
                this.editor.layoutContentWidget(this);
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description counts */
                const suggestionCount = this._suggestionCount.read(reader);
                const currentSuggestionIdx = this._currentSuggestionIdx.read(reader);
                if (suggestionCount !== undefined) {
                    this.clearAvailableSuggestionCountLabelDebounced.cancel();
                    this.availableSuggestionCountAction.label = `${currentSuggestionIdx + 1}/${suggestionCount}`;
                }
                else {
                    this.clearAvailableSuggestionCountLabelDebounced.schedule();
                }
                if (suggestionCount !== undefined && suggestionCount > 1) {
                    this.disableButtonsDebounced.cancel();
                    this.previousAction.enabled = this.nextAction.enabled = true;
                }
                else {
                    this.disableButtonsDebounced.schedule();
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description extra commands */
                const extraCommands = this._extraCommands.read(reader);
                if ((0, arrays_1.equals)(this.lastCommands, extraCommands)) {
                    // nothing to update
                    return;
                }
                this.lastCommands = extraCommands;
                const extraActions = extraCommands.map(c => ({
                    class: undefined,
                    id: c.id,
                    enabled: true,
                    tooltip: c.tooltip || '',
                    label: c.title,
                    run: (event) => {
                        return this._commandService.executeCommand(c.id);
                    },
                }));
                for (const [_, group] of this.inlineCompletionsActionsMenus.getActions()) {
                    for (const action of group) {
                        if (action instanceof actions_2.MenuItemAction) {
                            extraActions.push(action);
                        }
                    }
                }
                if (extraActions.length > 0) {
                    extraActions.unshift(new actions_1.Separator());
                }
                this.toolBar.setAdditionalSecondaryActions(extraActions);
            }));
        }
        getId() { return this.id; }
        getDomNode() {
            return this.nodes.root;
        }
        getPosition() {
            return {
                position: this._position.get(),
                preference: [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */],
                positionAffinity: 3 /* PositionAffinity.LeftOfInjectedText */,
            };
        }
    };
    exports.InlineSuggestionHintsContentWidget = InlineSuggestionHintsContentWidget;
    exports.InlineSuggestionHintsContentWidget = InlineSuggestionHintsContentWidget = InlineSuggestionHintsContentWidget_1 = __decorate([
        __param(6, commands_1.ICommandService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, actions_2.IMenuService)
    ], InlineSuggestionHintsContentWidget);
    class ActionViewItemWithClassName extends actionViewItems_1.ActionViewItem {
        constructor() {
            super(...arguments);
            this._className = undefined;
        }
        setClass(className) {
            this._className = className;
        }
        render(container) {
            super.render(container);
            if (this._className) {
                container.classList.add(this._className);
            }
        }
    }
    class StatusBarViewItem extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        updateLabel() {
            const kb = this._keybindingService.lookupKeybinding(this._action.id, this._contextKeyService);
            if (!kb) {
                return super.updateLabel();
            }
            if (this.label) {
                const div = (0, dom_1.h)('div.keybinding').root;
                const k = new keybindingLabel_1.KeybindingLabel(div, platform_1.OS, { disableTitle: true, ...keybindingLabel_1.unthemedKeybindingLabelOptions });
                k.set(kb);
                this.label.textContent = this._action.label;
                this.label.appendChild(div);
                this.label.classList.add('inlineSuggestionStatusBarItemLabel');
            }
        }
    }
    let CustomizedMenuWorkbenchToolBar = class CustomizedMenuWorkbenchToolBar extends toolbar_1.WorkbenchToolBar {
        constructor(container, menuId, options2, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
            super(container, { resetMenu: menuId, ...options2 }, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService);
            this.menuId = menuId;
            this.options2 = options2;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.menu = this._store.add(this.menuService.createMenu(this.menuId, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
            this.additionalActions = [];
            this.prependedPrimaryActions = [];
            this._store.add(this.menu.onDidChange(() => this.updateToolbar()));
            this.updateToolbar();
        }
        updateToolbar() {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, this.options2?.menuOptions, { primary, secondary }, this.options2?.toolbarOptions?.primaryGroup, this.options2?.toolbarOptions?.shouldInlineSubmenu, this.options2?.toolbarOptions?.useSeparatorsInPrimaryActions);
            secondary.push(...this.additionalActions);
            primary.unshift(...this.prependedPrimaryActions);
            this.setActions(primary, secondary);
        }
        setPrependedPrimaryActions(actions) {
            if ((0, arrays_1.equals)(this.prependedPrimaryActions, actions, (a, b) => a === b)) {
                return;
            }
            this.prependedPrimaryActions = actions;
            this.updateToolbar();
        }
        setAdditionalSecondaryActions(actions) {
            if ((0, arrays_1.equals)(this.additionalActions, actions, (a, b) => a === b)) {
                return;
            }
            this.additionalActions = actions;
            this.updateToolbar();
        }
    };
    exports.CustomizedMenuWorkbenchToolBar = CustomizedMenuWorkbenchToolBar;
    exports.CustomizedMenuWorkbenchToolBar = CustomizedMenuWorkbenchToolBar = __decorate([
        __param(3, actions_2.IMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, telemetry_1.ITelemetryService)
    ], CustomizedMenuWorkbenchToolBar);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNIaW50c1dpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL2Jyb3dzZXIvaW5saW5lQ29tcGxldGlvbnNIaW50c1dpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBaUN6RixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLHNCQUFVO1FBdUIzRCxZQUNrQixNQUFtQixFQUNuQixLQUFzRCxFQUNoRCxvQkFBNEQ7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFKUyxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBQ25CLFVBQUssR0FBTCxLQUFLLENBQWlEO1lBQy9CLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUF6Qm5FLHNCQUFpQixHQUFHLElBQUEsZ0NBQW1CLEVBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMscUNBQTRCLENBQUMsV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBRXpLLG9CQUFlLEdBQXlCLFNBQVMsQ0FBQztZQUV6QyxhQUFRLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN2RixJQUFJ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