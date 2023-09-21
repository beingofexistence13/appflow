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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/progressbar/progressbar", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/editor/contrib/find/browser/replacePattern", "vs/base/common/codicons", "vs/platform/configuration/common/configuration", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/workbench/contrib/notebook/browser/contrib/find/findFilters", "vs/base/common/platform", "vs/base/browser/ui/sash/sash", "vs/platform/theme/browser/defaultStyles", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/css!./notebookFindReplaceWidget"], function (require, exports, dom, findInput_1, progressbar_1, widget_1, async_1, findState_1, findWidget_1, nls, contextScopedHistoryWidget_1, contextkey_1, contextView_1, iconRegistry_1, themeService_1, themables_1, replacePattern_1, codicons_1, configuration_1, actions_1, instantiation_1, menuEntryActionViewItem_1, dropdownActionViewItem_1, actionbar_1, extensionsIcons_1, findFilters_1, platform_1, sash_1, defaultStyles_1, lifecycle_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mFb = exports.$lFb = exports.$kFb = exports.$jFb = void 0;
    const NLS_FIND_INPUT_LABEL = nls.localize(0, null);
    const NLS_FIND_INPUT_PLACEHOLDER = nls.localize(1, null);
    const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize(2, null);
    // const NLS_FILTER_BTN_LABEL = nls.localize('label.findFilterButton', "Search in View");
    const NLS_NEXT_MATCH_BTN_LABEL = nls.localize(3, null);
    const NLS_CLOSE_BTN_LABEL = nls.localize(4, null);
    const NLS_TOGGLE_REPLACE_MODE_BTN_LABEL = nls.localize(5, null);
    const NLS_REPLACE_INPUT_LABEL = nls.localize(6, null);
    const NLS_REPLACE_INPUT_PLACEHOLDER = nls.localize(7, null);
    const NLS_REPLACE_BTN_LABEL = nls.localize(8, null);
    const NLS_REPLACE_ALL_BTN_LABEL = nls.localize(9, null);
    exports.$jFb = (0, iconRegistry_1.$9u)('find-filter', codicons_1.$Pj.filter, nls.localize(10, null));
    const NOTEBOOK_FIND_FILTERS = nls.localize(11, null);
    const NOTEBOOK_FIND_IN_MARKUP_INPUT = nls.localize(12, null);
    const NOTEBOOK_FIND_IN_MARKUP_PREVIEW = nls.localize(13, null);
    const NOTEBOOK_FIND_IN_CODE_INPUT = nls.localize(14, null);
    const NOTEBOOK_FIND_IN_CODE_OUTPUT = nls.localize(15, null);
    const NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH = 318;
    const NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING = 4;
    let NotebookFindFilterActionViewItem = class NotebookFindFilterActionViewItem extends dropdownActionViewItem_1.$CR {
        constructor(filters, action, actionRunner, contextMenuService) {
            super(action, { getActions: () => this.a() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
            });
            this.filters = filters;
        }
        render(container) {
            super.render(container);
            this.G();
        }
        a() {
            const markdownInput = {
                checked: this.filters.markupInput,
                class: undefined,
                enabled: true,
                id: 'findInMarkdownInput',
                label: NOTEBOOK_FIND_IN_MARKUP_INPUT,
                run: async () => {
                    this.filters.markupInput = !this.filters.markupInput;
                },
                tooltip: ''
            };
            const markdownPreview = {
                checked: this.filters.markupPreview,
                class: undefined,
                enabled: true,
                id: 'findInMarkdownInput',
                label: NOTEBOOK_FIND_IN_MARKUP_PREVIEW,
                run: async () => {
                    this.filters.markupPreview = !this.filters.markupPreview;
                },
                tooltip: ''
            };
            const codeInput = {
                checked: this.filters.codeInput,
                class: undefined,
                enabled: true,
                id: 'findInCodeInput',
                label: NOTEBOOK_FIND_IN_CODE_INPUT,
                run: async () => {
                    this.filters.codeInput = !this.filters.codeInput;
                },
                tooltip: ''
            };
            const codeOutput = {
                checked: this.filters.codeOutput,
                class: undefined,
                enabled: true,
                id: 'findInCodeOutput',
                label: NOTEBOOK_FIND_IN_CODE_OUTPUT,
                run: async () => {
                    this.filters.codeOutput = !this.filters.codeOutput;
                },
                tooltip: '',
                dispose: () => null
            };
            if (platform_1.$F) {
                return [
                    markdownInput,
                    codeInput
                ];
            }
            else {
                return [
                    markdownInput,
                    markdownPreview,
                    new actions_1.$ii(),
                    codeInput,
                    codeOutput,
                ];
            }
        }
        G() {
            this.element.classList.toggle('checked', this._action.checked);
        }
    };
    NotebookFindFilterActionViewItem = __decorate([
        __param(3, contextView_1.$WZ)
    ], NotebookFindFilterActionViewItem);
    class $kFb extends lifecycle_1.$kc {
        constructor(filters, contextMenuService, instantiationService, options, tooltip = NOTEBOOK_FIND_FILTERS) {
            super();
            this.filters = filters;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.b = null;
            this.f = options.toggleStyles;
            this.c = new actions_1.$gi('notebookFindFilterAction', tooltip, 'notebook-filters ' + themables_1.ThemeIcon.asClassName(extensionsIcons_1.$3gb));
            this.c.checked = false;
            this.a = dom.$('.find-filter-button');
            this.a.classList.add('monaco-custom-toggle');
            this.h(this.a);
        }
        get container() {
            return this.a;
        }
        get width() {
            return 2 /*margin left*/ + 2 /*border*/ + 2 /*padding*/ + 16 /* icon width */;
        }
        applyStyles(filterChecked) {
            const toggleStyles = this.f;
            this.a.style.border = '1px solid transparent';
            this.a.style.borderRadius = '3px';
            this.a.style.borderColor = (filterChecked && toggleStyles.inputActiveOptionBorder) || '';
            this.a.style.color = (filterChecked && toggleStyles.inputActiveOptionForeground) || 'inherit';
            this.a.style.backgroundColor = (filterChecked && toggleStyles.inputActiveOptionBackground) || '';
        }
        h(container) {
            this.b = this.B(new actionbar_1.$1P(container, {
                actionViewItemProvider: action => {
                    if (action.id === this.c.id) {
                        return this.instantiationService.createInstance(NotebookFindFilterActionViewItem, this.filters, action, new actions_1.$hi());
                    }
                    return undefined;
                }
            }));
            this.b.push(this.c, { icon: true, label: false });
        }
    }
    exports.$kFb = $kFb;
    class $lFb extends findInput_1.$HR {
        constructor(filters, contextKeyService, contextMenuService, instantiationService, parent, contextViewProvider, options) {
            super(parent, contextViewProvider, options);
            this.filters = filters;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.bb = false;
            this.B((0, contextScopedHistoryWidget_1.$R5)(contextKeyService, this.inputBox));
            this.ab = this.B(new $kFb(filters, contextMenuService, instantiationService, options));
            this.inputBox.paddingRight = (this.M?.width() ?? 0) + (this.L?.width() ?? 0) + (this.J?.width() ?? 0) + this.ab.width;
            this.y.appendChild(this.ab.container);
        }
        setEnabled(enabled) {
            super.setEnabled(enabled);
            if (enabled && !this.bb) {
                this.J?.enable();
            }
            else {
                this.J?.disable();
            }
        }
        updateFilterState(changed) {
            this.bb = changed;
            if (this.J) {
                if (this.bb) {
                    this.J.disable();
                    this.J.domNode.tabIndex = -1;
                    this.J.domNode.classList.toggle('disabled', true);
                }
                else {
                    this.J.enable();
                    this.J.domNode.tabIndex = 0;
                    this.J.domNode.classList.toggle('disabled', false);
                }
            }
            this.ab.applyStyles(this.bb);
        }
        getCellToolbarActions(menu) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
            return result;
        }
    }
    exports.$lFb = $lFb;
    let $mFb = class $mFb extends widget_1.$IP {
        constructor(Z, contextKeyService, ab, bb, cb, db = new findState_1.$t7(), eb) {
            super();
            this.Z = Z;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.Q = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
            this.R = false;
            this.S = false;
            this.U = false;
            const findScope = this.ab.getValue(notebookCommon_1.$7H.findScope) ?? { markupSource: true, markupPreview: true, codeSource: true, codeOutput: true };
            this.Y = new findFilters_1.$vob(findScope.markupSource, findScope.markupPreview, findScope.codeSource, findScope.codeOutput);
            this.db.change({ filters: this.Y }, false);
            this.Y.onDidChange(() => {
                this.db.change({ filters: this.Y }, false);
            });
            this.b = document.createElement('div');
            this.b.classList.add('simple-fr-find-part-wrapper');
            this.B(this.db.onFindReplaceStateChange((e) => this.vb(e)));
            this.X = contextKeyService.createScoped(this.b);
            const progressContainer = dom.$('.find-replace-progress');
            this.W = new progressbar_1.$YR(progressContainer, defaultStyles_1.$k2);
            this.b.appendChild(progressContainer);
            const isInteractiveWindow = contextKeyService.getContextKeyValue('notebookType') === 'interactive';
            // Toggle replace button
            this.L = this.B(new findWidget_1.$U7({
                label: NLS_TOGGLE_REPLACE_MODE_BTN_LABEL,
                className: 'codicon toggle left',
                onTrigger: isInteractiveWindow ? () => { } :
                    () => {
                        this.S = !this.S;
                        this.db.change({ isReplaceRevealed: this.S }, false);
                        this.yb();
                    }
            }));
            this.L.setEnabled(!isInteractiveWindow);
            this.L.setExpanded(this.S);
            this.b.appendChild(this.L.domNode);
            this.c = document.createElement('div');
            this.c.classList.add('simple-fr-find-part');
            this.a = this.B(new $lFb(this.Y, this.X, this.bb, this.cb, null, this.Z, {
                label: NLS_FIND_INPUT_LABEL,
                placeholder: NLS_FIND_INPUT_PLACEHOLDER,
                validation: (value) => {
                    if (value.length === 0 || !this.a.getRegex()) {
                        return null;
                    }
                    try {
                        new RegExp(value);
                        return null;
                    }
                    catch (e) {
                        this.U = false;
                        this.Eb(this.U);
                        return { content: e.message };
                    }
                },
                flexibleWidth: true,
                showCommonFindToggles: true,
                inputBoxStyles: defaultStyles_1.$s2,
                toggleStyles: defaultStyles_1.$m2
            }));
            // Find History with update delayer
            this.r = new async_1.$Dg(500);
            this.D(this.a.domNode, (e) => {
                this.U = this.hb();
                this.Eb(this.U);
                this.zb();
            });
            this.B(this.a.inputBox.onDidChange(() => {
                this.db.change({ searchString: this.a.getValue() }, true);
            }));
            this.a.setRegex(!!this.db.isRegex);
            this.a.setCaseSensitive(!!this.db.matchCase);
            this.a.setWholeWords(!!this.db.wholeWord);
            this.B(this.a.onDidOptionChange(() => {
                this.db.change({
                    isRegex: this.a.getRegex(),
                    wholeWord: this.a.getWholeWords(),
                    matchCase: this.a.getCaseSensitive()
                }, true);
            }));
            this.B(this.db.onFindReplaceStateChange(() => {
                this.a.setRegex(this.db.isRegex);
                this.a.setWholeWords(this.db.wholeWord);
                this.a.setCaseSensitive(this.db.matchCase);
                this.y.setPreserveCase(this.db.preserveCase);
                this.jb();
            }));
            this.s = document.createElement('div');
            this.s.className = 'matchesCount';
            this.xb();
            this.t = this.B(new findWidget_1.$U7({
                label: NLS_PREVIOUS_MATCH_BTN_LABEL,
                icon: findWidget_1.$O7,
                onTrigger: () => {
                    this.ib(true);
                }
            }));
            this.w = this.B(new findWidget_1.$U7({
                label: NLS_NEXT_MATCH_BTN_LABEL,
                icon: findWidget_1.$P7,
                onTrigger: () => {
                    this.ib(false);
                }
            }));
            const closeBtn = this.B(new findWidget_1.$U7({
                label: NLS_CLOSE_BTN_LABEL,
                icon: iconRegistry_1.$_u,
                onTrigger: () => {
                    this.hide();
                }
            }));
            this.c.appendChild(this.a.domNode);
            this.c.appendChild(this.s);
            this.c.appendChild(this.t.domNode);
            this.c.appendChild(this.w.domNode);
            this.c.appendChild(closeBtn.domNode);
            // _domNode wraps _innerDomNode, ensuring that
            this.b.appendChild(this.c);
            this.C(this.c, e => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.hide();
                    e.preventDefault();
                    return;
                }
            });
            this.h = this.B(dom.$8O(this.b));
            this.B(this.h.onDidFocus(this.mb.bind(this)));
            this.B(this.h.onDidBlur(this.nb.bind(this)));
            this.n = this.B(dom.$8O(this.a.domNode));
            this.B(this.n.onDidFocus(this.ob.bind(this)));
            this.B(this.n.onDidBlur(this.pb.bind(this)));
            this.B(dom.$nO(this.c, 'click', (event) => {
                event.stopPropagation();
            }));
            // Replace
            this.J = document.createElement('div');
            this.J.classList.add('simple-fr-replace-part');
            this.y = this.B(new contextScopedHistoryWidget_1.$U5(null, undefined, {
                label: NLS_REPLACE_INPUT_LABEL,
                placeholder: NLS_REPLACE_INPUT_PLACEHOLDER,
                history: [],
                inputBoxStyles: defaultStyles_1.$s2,
                toggleStyles: defaultStyles_1.$m2
            }, contextKeyService, false));
            this.J.appendChild(this.y.domNode);
            this.M = this.B(dom.$8O(this.y.domNode));
            this.B(this.M.onDidFocus(this.qb.bind(this)));
            this.B(this.M.onDidBlur(this.rb.bind(this)));
            this.B(this.y.inputBox.onDidChange(() => {
                this.db.change({ replaceString: this.y.getValue() }, true);
            }));
            this.b.appendChild(this.J);
            this.yb();
            this.N = this.B(new findWidget_1.$U7({
                label: NLS_REPLACE_BTN_LABEL,
                icon: findWidget_1.$M7,
                onTrigger: () => {
                    this.kb();
                }
            }));
            // Replace all button
            this.O = this.B(new findWidget_1.$U7({
                label: NLS_REPLACE_ALL_BTN_LABEL,
                icon: findWidget_1.$N7,
                onTrigger: () => {
                    this.lb();
                }
            }));
            this.J.appendChild(this.N.domNode);
            this.J.appendChild(this.O.domNode);
            this.P = this.B(new sash_1.$aR(this.b, { getVerticalSashLeft: () => 0 }, { orientation: 0 /* Orientation.VERTICAL */, size: 2 }));
            this.B(this.P.onDidStart(() => {
                this.Q = this.gb();
            }));
            this.B(this.P.onDidChange((evt) => {
                let width = this.Q + evt.startX - evt.currentX;
                if (width < NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH) {
                    width = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
                }
                const maxWidth = this.fb();
                if (width > maxWidth) {
                    width = maxWidth;
                }
                this.b.style.width = `${width}px`;
                if (this.S) {
                    this.y.width = dom.$HO(this.a.domNode);
                }
                this.a.inputBox.layout();
            }));
            this.B(this.P.onDidReset(() => {
                // users double click on the sash
                // try to emulate what happens with editor findWidget
                const currentWidth = this.gb();
                let width = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
                if (currentWidth <= NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH) {
                    width = this.fb();
                }
                this.b.style.width = `${width}px`;
                if (this.S) {
                    this.y.width = dom.$HO(this.a.domNode);
                }
                this.a.inputBox.layout();
            }));
        }
        fb() {
            return this.eb.getLayoutInfo().width - 64;
        }
        gb() {
            return dom.$HO(this.b) - (NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING * 2);
        }
        getCellToolbarActions(menu) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
            return result;
        }
        get sb() {
            return this.a.getValue();
        }
        get tb() {
            return this.y.getValue();
        }
        get ub() {
            if (this.db.isRegex) {
                return (0, replacePattern_1.$x7)(this.tb);
            }
            return replacePattern_1.$v7.fromStaticValue(this.tb);
        }
        get focusTracker() {
            return this.h;
        }
        vb(e) {
            this.wb();
            this.xb();
        }
        wb() {
            this.a.setEnabled(this.R);
            this.y.setEnabled(this.R && this.S);
            const findInputIsNonEmpty = (this.db.searchString.length > 0);
            this.N.setEnabled(this.R && this.S && findInputIsNonEmpty);
            this.O.setEnabled(this.R && this.S && findInputIsNonEmpty);
            this.b.classList.toggle('replaceToggled', this.S);
            this.L.setExpanded(this.S);
            this.U = this.db.matchesCount > 0;
            this.Eb(this.U);
        }
        xb() {
        }
        dispose() {
            super.dispose();
            if (this.b && this.b.parentElement) {
                this.b.parentElement.removeChild(this.b);
            }
        }
        getDomNode() {
            return this.b;
        }
        reveal(initialInput) {
            if (initialInput) {
                this.a.setValue(initialInput);
            }
            if (this.R) {
                this.a.select();
                return;
            }
            this.R = true;
            this.Eb(this.U);
            setTimeout(() => {
                this.b.classList.add('visible', 'visible-transition');
                this.b.setAttribute('aria-hidden', 'false');
                this.a.select();
            }, 0);
        }
        focus() {
            this.a.focus();
        }
        show(initialInput, options) {
            if (initialInput) {
                this.a.setValue(initialInput);
            }
            this.R = true;
            setTimeout(() => {
                this.b.classList.add('visible', 'visible-transition');
                this.b.setAttribute('aria-hidden', 'false');
                if (options?.focus ?? true) {
                    this.focus();
                }
            }, 0);
        }
        showWithReplace(initialInput, replaceInput) {
            if (initialInput) {
                this.a.setValue(initialInput);
            }
            if (replaceInput) {
                this.y.setValue(replaceInput);
            }
            this.R = true;
            this.S = true;
            this.db.change({ isReplaceRevealed: this.S }, false);
            this.yb();
            setTimeout(() => {
                this.b.classList.add('visible', 'visible-transition');
                this.b.setAttribute('aria-hidden', 'false');
                this.wb();
                this.y.focus();
            }, 0);
        }
        yb() {
            if (this.S) {
                this.J.style.display = 'flex';
            }
            else {
                this.J.style.display = 'none';
            }
            this.y.width = dom.$HO(this.a.domNode);
        }
        hide() {
            if (this.R) {
                this.b.classList.remove('visible-transition');
                this.b.setAttribute('aria-hidden', 'true');
                // Need to delay toggling visibility until after Transition, then visibility hidden - removes from tabIndex list
                setTimeout(() => {
                    this.R = false;
                    this.Eb(this.U);
                    this.b.classList.remove('visible');
                }, 200);
            }
        }
        zb() {
            this.r.trigger(this.Ab.bind(this));
        }
        Ab() {
            this.a.inputBox.addToHistory();
        }
        Bb() {
            return this.a.getRegex();
        }
        Cb() {
            return this.a.getWholeWords();
        }
        Db() {
            return this.a.getCaseSensitive();
        }
        Eb(foundMatch) {
            const hasInput = this.sb.length > 0;
            this.t.setEnabled(this.R && hasInput && foundMatch);
            this.w.setEnabled(this.R && hasInput && foundMatch);
        }
    };
    exports.$mFb = $mFb;
    exports.$mFb = $mFb = __decorate([
        __param(0, contextView_1.$VZ),
        __param(1, contextkey_1.$3i),
        __param(2, configuration_1.$8h),
        __param(3, contextView_1.$WZ),
        __param(4, instantiation_1.$Ah)
    ], $mFb);
    // theming
    (0, themeService_1.$mv)((theme, collector) => {
        collector.addRule(`
	.notebook-editor {
		--notebook-find-width: ${NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH}px;
		--notebook-find-horizontal-padding: ${NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING}px;
	}
	`);
    });
});
//# sourceMappingURL=notebookFindReplaceWidget.js.map