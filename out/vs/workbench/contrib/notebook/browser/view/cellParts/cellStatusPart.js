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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/editor/common/editorCommon", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/workbench/services/hover/browser/hover", "vs/platform/configuration/common/configuration"], function (require, exports, DOM, keyboardEvent_1, simpleIconLabel_1, errorMessage_1, event_1, iconLabels_1, lifecycle_1, editorCommon_1, commands_1, instantiation_1, notification_1, telemetry_1, themeService_1, notebookBrowser_1, cellPart_1, codeCellViewModel_1, iconLabelHover_1, hover_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellEditorStatusBar = void 0;
    const $ = DOM.$;
    let CellEditorStatusBar = class CellEditorStatusBar extends cellPart_1.CellContentPart {
        constructor(_notebookEditor, _cellContainer, editorPart, _editor, _instantiationService, hoverService, configurationService, _themeService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._cellContainer = _cellContainer;
            this._editor = _editor;
            this._instantiationService = _instantiationService;
            this._themeService = _themeService;
            this.leftItems = [];
            this.rightItems = [];
            this.width = 0;
            this._onDidClick = this._register(new event_1.Emitter());
            this.onDidClick = this._onDidClick.event;
            this.statusBarContainer = DOM.append(editorPart, $('.cell-statusbar-container'));
            this.statusBarContainer.tabIndex = -1;
            const leftItemsContainer = DOM.append(this.statusBarContainer, $('.cell-status-left'));
            const rightItemsContainer = DOM.append(this.statusBarContainer, $('.cell-status-right'));
            this.leftItemsContainer = DOM.append(leftItemsContainer, $('.cell-contributed-items.cell-contributed-items-left'));
            this.rightItemsContainer = DOM.append(rightItemsContainer, $('.cell-contributed-items.cell-contributed-items-right'));
            this.itemsDisposable = this._register(new lifecycle_1.DisposableStore());
            this.hoverDelegate = new class {
                constructor() {
                    this._lastHoverHideTime = 0;
                    this.showHover = (options) => {
                        options.hoverPosition = 3 /* HoverPosition.ABOVE */;
                        return hoverService.showHover(options);
                    };
                    this.placement = 'element';
                }
                get delay() {
                    return Date.now() - this._lastHoverHideTime < 200
                        ? 0 // show instantly when a hover was recently shown
                        : configurationService.getValue('workbench.hover.delay');
                }
                onDidHideHover() {
                    this._lastHoverHideTime = Date.now();
                }
            };
            this._register(this._themeService.onDidColorThemeChange(() => this.currentContext && this.updateContext(this.currentContext)));
            this._register(DOM.addDisposableListener(this.statusBarContainer, DOM.EventType.CLICK, e => {
                if (e.target === leftItemsContainer || e.target === rightItemsContainer || e.target === this.statusBarContainer) {
                    // hit on empty space
                    this._onDidClick.fire({
                        type: 0 /* ClickTargetType.Container */,
                        event: e
                    });
                }
                else {
                    if (e.target.classList.contains('cell-status-item-has-command')) {
                        this._onDidClick.fire({
                            type: 2 /* ClickTargetType.ContributedCommandItem */,
                            event: e
                        });
                    }
                    else {
                        // text
                        this._onDidClick.fire({
                            type: 1 /* ClickTargetType.ContributedTextItem */,
                            event: e
                        });
                    }
                }
            }));
        }
        didRenderCell(element) {
            this.updateContext({
                ui: true,
                cell: element,
                notebookEditor: this._notebookEditor,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            });
            if (this._editor) {
                // Focus Mode
                const updateFocusModeForEditorEvent = () => {
                    if (this._editor && (this._editor.hasWidgetFocus() || (document.activeElement && this.statusBarContainer.contains(document.activeElement)))) {
                        element.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                    }
                    else {
                        const currentMode = element.focusMode;
                        if (currentMode === notebookBrowser_1.CellFocusMode.Output && this._notebookEditor.hasWebviewFocus()) {
                            element.focusMode = notebookBrowser_1.CellFocusMode.Output;
                        }
                        else {
                            element.focusMode = notebookBrowser_1.CellFocusMode.Container;
                        }
                    }
                };
                this.cellDisposables.add(this._editor.onDidFocusEditorWidget(() => {
                    updateFocusModeForEditorEvent();
                }));
                this.cellDisposables.add(this._editor.onDidBlurEditorWidget(() => {
                    // this is for a special case:
                    // users click the status bar empty space, which we will then focus the editor
                    // so we don't want to update the focus state too eagerly, it will be updated with onDidFocusEditorWidget
                    if (this._notebookEditor.hasEditorFocus() &&
                        !(document.activeElement && this.statusBarContainer.contains(document.activeElement))) {
                        updateFocusModeForEditorEvent();
                    }
                }));
                // Mouse click handlers
                this.cellDisposables.add(this.onDidClick(e => {
                    if (this.currentCell instanceof codeCellViewModel_1.CodeCellViewModel && e.type !== 2 /* ClickTargetType.ContributedCommandItem */ && this._editor) {
                        const target = this._editor.getTargetAtClientPoint(e.event.clientX, e.event.clientY - this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(this.currentCell.internalMetadata, this.currentCell.uri));
                        if (target?.position) {
                            this._editor.setPosition(target.position);
                            this._editor.focus();
                        }
                    }
                }));
            }
        }
        updateInternalLayoutNow(element) {
            // todo@rebornix layer breaker
            this._cellContainer.classList.toggle('cell-statusbar-hidden', this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(element.internalMetadata, element.uri) === 0);
            const layoutInfo = element.layoutInfo;
            const width = layoutInfo.editorWidth;
            if (!width) {
                return;
            }
            this.width = width;
            this.statusBarContainer.style.width = `${width}px`;
            const maxItemWidth = this.getMaxItemWidth();
            this.leftItems.forEach(item => item.maxWidth = maxItemWidth);
            this.rightItems.forEach(item => item.maxWidth = maxItemWidth);
        }
        getMaxItemWidth() {
            return this.width / 2;
        }
        updateContext(context) {
            this.currentContext = context;
            this.itemsDisposable.clear();
            if (!this.currentContext) {
                return;
            }
            this.itemsDisposable.add(this.currentContext.cell.onDidChangeLayout(() => {
                if (this.currentContext) {
                    this.updateInternalLayoutNow(this.currentContext.cell);
                }
            }));
            this.itemsDisposable.add(this.currentContext.cell.onDidChangeCellStatusBarItems(() => this.updateRenderedItems()));
            this.itemsDisposable.add(this.currentContext.notebookEditor.onDidChangeActiveCell(() => this.updateActiveCell()));
            this.updateInternalLayoutNow(this.currentContext.cell);
            this.updateActiveCell();
            this.updateRenderedItems();
        }
        updateActiveCell() {
            const isActiveCell = this.currentContext.notebookEditor.getActiveCell() === this.currentContext?.cell;
            this.statusBarContainer.classList.toggle('is-active-cell', isActiveCell);
        }
        updateRenderedItems() {
            const items = this.currentContext.cell.getCellStatusBarItems();
            items.sort((itemA, itemB) => {
                return (itemB.priority ?? 0) - (itemA.priority ?? 0);
            });
            const maxItemWidth = this.getMaxItemWidth();
            const newLeftItems = items.filter(item => item.alignment === 1 /* CellStatusbarAlignment.Left */);
            const newRightItems = items.filter(item => item.alignment === 2 /* CellStatusbarAlignment.Right */).reverse();
            const updateItems = (renderedItems, newItems, container) => {
                if (renderedItems.length > newItems.length) {
                    const deleted = renderedItems.splice(newItems.length, renderedItems.length - newItems.length);
                    for (const deletedItem of deleted) {
                        container.removeChild(deletedItem.container);
                        deletedItem.dispose();
                    }
                }
                newItems.forEach((newLeftItem, i) => {
                    const existingItem = renderedItems[i];
                    if (existingItem) {
                        existingItem.updateItem(newLeftItem, maxItemWidth);
                    }
                    else {
                        const item = this._instantiationService.createInstance(CellStatusBarItem, this.currentContext, this.hoverDelegate, newLeftItem, maxItemWidth);
                        renderedItems.push(item);
                        container.appendChild(item.container);
                    }
                });
            };
            updateItems(this.leftItems, newLeftItems, this.leftItemsContainer);
            updateItems(this.rightItems, newRightItems, this.rightItemsContainer);
        }
        dispose() {
            super.dispose();
            (0, lifecycle_1.dispose)(this.leftItems);
            (0, lifecycle_1.dispose)(this.rightItems);
        }
    };
    exports.CellEditorStatusBar = CellEditorStatusBar;
    exports.CellEditorStatusBar = CellEditorStatusBar = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, hover_1.IHoverService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, themeService_1.IThemeService)
    ], CellEditorStatusBar);
    let CellStatusBarItem = class CellStatusBarItem extends lifecycle_1.Disposable {
        set maxWidth(v) {
            this.container.style.maxWidth = v + 'px';
        }
        constructor(_context, _hoverDelegate, itemModel, maxWidth, _telemetryService, _commandService, _notificationService, _themeService) {
            super();
            this._context = _context;
            this._hoverDelegate = _hoverDelegate;
            this._telemetryService = _telemetryService;
            this._commandService = _commandService;
            this._notificationService = _notificationService;
            this._themeService = _themeService;
            this.container = $('.cell-status-item');
            this._itemDisposables = this._register(new lifecycle_1.DisposableStore());
            this.updateItem(itemModel, maxWidth);
        }
        updateItem(item, maxWidth) {
            this._itemDisposables.clear();
            if (!this._currentItem || this._currentItem.text !== item.text) {
                new simpleIconLabel_1.SimpleIconLabel(this.container).text = item.text.replace(/\n/g, ' ');
            }
            const resolveColor = (color) => {
                return (0, editorCommon_1.isThemeColor)(color) ?
                    (this._themeService.getColorTheme().getColor(color.id)?.toString() || '') :
                    color;
            };
            this.container.style.color = item.color ? resolveColor(item.color) : '';
            this.container.style.backgroundColor = item.backgroundColor ? resolveColor(item.backgroundColor) : '';
            this.container.style.opacity = item.opacity ? item.opacity : '';
            this.container.classList.toggle('cell-status-item-show-when-active', !!item.onlyShowWhenActive);
            if (typeof maxWidth === 'number') {
                this.maxWidth = maxWidth;
            }
            let ariaLabel;
            let role;
            if (item.accessibilityInformation) {
                ariaLabel = item.accessibilityInformation.label;
                role = item.accessibilityInformation.role;
            }
            else {
                ariaLabel = item.text ? (0, iconLabels_1.stripIcons)(item.text).trim() : '';
            }
            this.container.setAttribute('aria-label', ariaLabel);
            this.container.setAttribute('role', role || '');
            if (item.tooltip) {
                const hoverContent = typeof item.tooltip === 'string' ? item.tooltip : { markdown: item.tooltip };
                this._itemDisposables.add((0, iconLabelHover_1.setupCustomHover)(this._hoverDelegate, this.container, hoverContent));
            }
            this.container.classList.toggle('cell-status-item-has-command', !!item.command);
            if (item.command) {
                this.container.tabIndex = 0;
                this._itemDisposables.add(DOM.addDisposableListener(this.container, DOM.EventType.CLICK, _e => {
                    this.executeCommand();
                }));
                this._itemDisposables.add(DOM.addDisposableListener(this.container, DOM.EventType.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                        this.executeCommand();
                    }
                }));
            }
            else {
                this.container.removeAttribute('tabIndex');
            }
            this._currentItem = item;
        }
        async executeCommand() {
            const command = this._currentItem.command;
            if (!command) {
                return;
            }
            const id = typeof command === 'string' ? command : command.id;
            const args = typeof command === 'string' ? [] : command.arguments ?? [];
            if (typeof command === 'string' || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
                args.unshift(this._context);
            }
            this._telemetryService.publicLog2('workbenchActionExecuted', { id, from: 'cell status bar' });
            try {
                await this._commandService.executeCommand(id, ...args);
            }
            catch (error) {
                this._notificationService.error((0, errorMessage_1.toErrorMessage)(error));
            }
        }
    };
    CellStatusBarItem = __decorate([
        __param(4, telemetry_1.ITelemetryService),
        __param(5, commands_1.ICommandService),
        __param(6, notification_1.INotificationService),
        __param(7, themeService_1.IThemeService)
    ], CellStatusBarItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFN0YXR1c1BhcnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NlbGxTdGF0dXNQYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdDaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUdULElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsMEJBQWU7UUFpQnZELFlBQ2tCLGVBQXdDLEVBQ3hDLGNBQTJCLEVBQzVDLFVBQXVCLEVBQ04sT0FBZ0MsRUFDMUIscUJBQTZELEVBQ3JFLFlBQTJCLEVBQ25CLG9CQUEyQyxFQUNuRCxhQUE2QztZQUU1RCxLQUFLLEVBQUUsQ0FBQztZQVRTLG9CQUFlLEdBQWYsZUFBZSxDQUF5QjtZQUN4QyxtQkFBYyxHQUFkLGNBQWMsQ0FBYTtZQUUzQixZQUFPLEdBQVAsT0FBTyxDQUF5QjtZQUNULDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFHcEQsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFsQnJELGNBQVMsR0FBd0IsRUFBRSxDQUFDO1lBQ3BDLGVBQVUsR0FBd0IsRUFBRSxDQUFDO1lBQ3JDLFVBQUssR0FBVyxDQUFDLENBQUM7WUFHUCxnQkFBVyxHQUEwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFnQixDQUFDLENBQUM7WUFDM0YsZUFBVSxHQUF3QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQWVqRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FB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