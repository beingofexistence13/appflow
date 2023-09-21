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
    exports.$spb = void 0;
    const $ = DOM.$;
    let $spb = class $spb extends cellPart_1.$Hnb {
        constructor(t, u, editorPart, w, y, hoverService, configurationService, z) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.h = [];
            this.j = [];
            this.m = 0;
            this.r = this.B(new event_1.$fd());
            this.onDidClick = this.r.event;
            this.statusBarContainer = DOM.$0O(editorPart, $('.cell-statusbar-container'));
            this.statusBarContainer.tabIndex = -1;
            const leftItemsContainer = DOM.$0O(this.statusBarContainer, $('.cell-status-left'));
            const rightItemsContainer = DOM.$0O(this.statusBarContainer, $('.cell-status-right'));
            this.a = DOM.$0O(leftItemsContainer, $('.cell-contributed-items.cell-contributed-items-left'));
            this.b = DOM.$0O(rightItemsContainer, $('.cell-contributed-items.cell-contributed-items-right'));
            this.g = this.B(new lifecycle_1.$jc());
            this.s = new class {
                constructor() {
                    this.a = 0;
                    this.showHover = (options) => {
                        options.hoverPosition = 3 /* HoverPosition.ABOVE */;
                        return hoverService.showHover(options);
                    };
                    this.placement = 'element';
                }
                get delay() {
                    return Date.now() - this.a < 200
                        ? 0 // show instantly when a hover was recently shown
                        : configurationService.getValue('workbench.hover.delay');
                }
                onDidHideHover() {
                    this.a = Date.now();
                }
            };
            this.B(this.z.onDidColorThemeChange(() => this.n && this.updateContext(this.n)));
            this.B(DOM.$nO(this.statusBarContainer, DOM.$3O.CLICK, e => {
                if (e.target === leftItemsContainer || e.target === rightItemsContainer || e.target === this.statusBarContainer) {
                    // hit on empty space
                    this.r.fire({
                        type: 0 /* ClickTargetType.Container */,
                        event: e
                    });
                }
                else {
                    if (e.target.classList.contains('cell-status-item-has-command')) {
                        this.r.fire({
                            type: 2 /* ClickTargetType.ContributedCommandItem */,
                            event: e
                        });
                    }
                    else {
                        // text
                        this.r.fire({
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
                notebookEditor: this.t,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            });
            if (this.w) {
                // Focus Mode
                const updateFocusModeForEditorEvent = () => {
                    if (this.w && (this.w.hasWidgetFocus() || (document.activeElement && this.statusBarContainer.contains(document.activeElement)))) {
                        element.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                    }
                    else {
                        const currentMode = element.focusMode;
                        if (currentMode === notebookBrowser_1.CellFocusMode.Output && this.t.hasWebviewFocus()) {
                            element.focusMode = notebookBrowser_1.CellFocusMode.Output;
                        }
                        else {
                            element.focusMode = notebookBrowser_1.CellFocusMode.Container;
                        }
                    }
                };
                this.f.add(this.w.onDidFocusEditorWidget(() => {
                    updateFocusModeForEditorEvent();
                }));
                this.f.add(this.w.onDidBlurEditorWidget(() => {
                    // this is for a special case:
                    // users click the status bar empty space, which we will then focus the editor
                    // so we don't want to update the focus state too eagerly, it will be updated with onDidFocusEditorWidget
                    if (this.t.hasEditorFocus() &&
                        !(document.activeElement && this.statusBarContainer.contains(document.activeElement))) {
                        updateFocusModeForEditorEvent();
                    }
                }));
                // Mouse click handlers
                this.f.add(this.onDidClick(e => {
                    if (this.c instanceof codeCellViewModel_1.$Rnb && e.type !== 2 /* ClickTargetType.ContributedCommandItem */ && this.w) {
                        const target = this.w.getTargetAtClientPoint(e.event.clientX, e.event.clientY - this.t.notebookOptions.computeEditorStatusbarHeight(this.c.internalMetadata, this.c.uri));
                        if (target?.position) {
                            this.w.setPosition(target.position);
                            this.w.focus();
                        }
                    }
                }));
            }
        }
        updateInternalLayoutNow(element) {
            // todo@rebornix layer breaker
            this.u.classList.toggle('cell-statusbar-hidden', this.t.notebookOptions.computeEditorStatusbarHeight(element.internalMetadata, element.uri) === 0);
            const layoutInfo = element.layoutInfo;
            const width = layoutInfo.editorWidth;
            if (!width) {
                return;
            }
            this.m = width;
            this.statusBarContainer.style.width = `${width}px`;
            const maxItemWidth = this.C();
            this.h.forEach(item => item.maxWidth = maxItemWidth);
            this.j.forEach(item => item.maxWidth = maxItemWidth);
        }
        C() {
            return this.m / 2;
        }
        updateContext(context) {
            this.n = context;
            this.g.clear();
            if (!this.n) {
                return;
            }
            this.g.add(this.n.cell.onDidChangeLayout(() => {
                if (this.n) {
                    this.updateInternalLayoutNow(this.n.cell);
                }
            }));
            this.g.add(this.n.cell.onDidChangeCellStatusBarItems(() => this.F()));
            this.g.add(this.n.notebookEditor.onDidChangeActiveCell(() => this.D()));
            this.updateInternalLayoutNow(this.n.cell);
            this.D();
            this.F();
        }
        D() {
            const isActiveCell = this.n.notebookEditor.getActiveCell() === this.n?.cell;
            this.statusBarContainer.classList.toggle('is-active-cell', isActiveCell);
        }
        F() {
            const items = this.n.cell.getCellStatusBarItems();
            items.sort((itemA, itemB) => {
                return (itemB.priority ?? 0) - (itemA.priority ?? 0);
            });
            const maxItemWidth = this.C();
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
                        const item = this.y.createInstance(CellStatusBarItem, this.n, this.s, newLeftItem, maxItemWidth);
                        renderedItems.push(item);
                        container.appendChild(item.container);
                    }
                });
            };
            updateItems(this.h, newLeftItems, this.a);
            updateItems(this.j, newRightItems, this.b);
        }
        dispose() {
            super.dispose();
            (0, lifecycle_1.$fc)(this.h);
            (0, lifecycle_1.$fc)(this.j);
        }
    };
    exports.$spb = $spb;
    exports.$spb = $spb = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, hover_1.$zib),
        __param(6, configuration_1.$8h),
        __param(7, themeService_1.$gv)
    ], $spb);
    let CellStatusBarItem = class CellStatusBarItem extends lifecycle_1.$kc {
        set maxWidth(v) {
            this.container.style.maxWidth = v + 'px';
        }
        constructor(c, f, itemModel, maxWidth, g, h, j, m) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.container = $('.cell-status-item');
            this.b = this.B(new lifecycle_1.$jc());
            this.updateItem(itemModel, maxWidth);
        }
        updateItem(item, maxWidth) {
            this.b.clear();
            if (!this.a || this.a.text !== item.text) {
                new simpleIconLabel_1.$LR(this.container).text = item.text.replace(/\n/g, ' ');
            }
            const resolveColor = (color) => {
                return (0, editorCommon_1.isThemeColor)(color) ?
                    (this.m.getColorTheme().getColor(color.id)?.toString() || '') :
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
                ariaLabel = item.text ? (0, iconLabels_1.$Tj)(item.text).trim() : '';
            }
            this.container.setAttribute('aria-label', ariaLabel);
            this.container.setAttribute('role', role || '');
            if (item.tooltip) {
                const hoverContent = typeof item.tooltip === 'string' ? item.tooltip : { markdown: item.tooltip };
                this.b.add((0, iconLabelHover_1.$ZP)(this.f, this.container, hoverContent));
            }
            this.container.classList.toggle('cell-status-item-has-command', !!item.command);
            if (item.command) {
                this.container.tabIndex = 0;
                this.b.add(DOM.$nO(this.container, DOM.$3O.CLICK, _e => {
                    this.n();
                }));
                this.b.add(DOM.$nO(this.container, DOM.$3O.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.$jO(e);
                    if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                        this.n();
                    }
                }));
            }
            else {
                this.container.removeAttribute('tabIndex');
            }
            this.a = item;
        }
        async n() {
            const command = this.a.command;
            if (!command) {
                return;
            }
            const id = typeof command === 'string' ? command : command.id;
            const args = typeof command === 'string' ? [] : command.arguments ?? [];
            if (typeof command === 'string' || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
                args.unshift(this.c);
            }
            this.g.publicLog2('workbenchActionExecuted', { id, from: 'cell status bar' });
            try {
                await this.h.executeCommand(id, ...args);
            }
            catch (error) {
                this.j.error((0, errorMessage_1.$mi)(error));
            }
        }
    };
    CellStatusBarItem = __decorate([
        __param(4, telemetry_1.$9k),
        __param(5, commands_1.$Fr),
        __param(6, notification_1.$Yu),
        __param(7, themeService_1.$gv)
    ], CellStatusBarItem);
});
//# sourceMappingURL=cellStatusPart.js.map