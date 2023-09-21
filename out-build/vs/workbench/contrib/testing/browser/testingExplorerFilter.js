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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/base/common/iterator", "vs/nls!vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/base/common/themables", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, dom, actionbar_1, actionViewItems_1, dropdownActionViewItem_1, actions_1, async_1, event_1, iterator_1, nls_1, contextView_1, instantiation_1, themables_1, suggestEnabledInput_1, icons_1, storedValue_1, testExplorerFilterState_1, testService_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vLb = void 0;
    const testFilterDescriptions = {
        ["@failed" /* TestFilterTerm.Failed */]: (0, nls_1.localize)(0, null),
        ["@executed" /* TestFilterTerm.Executed */]: (0, nls_1.localize)(1, null),
        ["@doc" /* TestFilterTerm.CurrentDoc */]: (0, nls_1.localize)(2, null),
        ["@hidden" /* TestFilterTerm.Hidden */]: (0, nls_1.localize)(3, null),
    };
    let $vLb = class $vLb extends actionViewItems_1.$MQ {
        constructor(action, n, s, y) {
            super(null, action);
            this.n = n;
            this.s = s;
            this.y = y;
            this.c = this.B(new event_1.$fd());
            this.onDidFocus = this.c.event;
            this.g = this.B(this.s.createInstance(storedValue_1.$Gsb, {
                key: 'testing.filterHistory2',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 1 /* StorageTarget.MACHINE */
            }));
            this.h = new actions_1.$gi('markersFiltersAction', (0, nls_1.localize)(4, null), 'testing-filter-button ' + themables_1.ThemeIcon.asClassName(icons_1.$7Jb));
            this.H();
            this.B(y.excluded.onTestExclusionsChanged(this.H, this));
        }
        /**
         * @override
         */
        render(container) {
            container.classList.add('testing-filter-action-item');
            const updateDelayer = this.B(new async_1.$Dg(400));
            const wrapper = this.b = dom.$('.testing-filter-wrapper');
            container.appendChild(wrapper);
            let history = this.g.get({ lastValue: '', values: [] });
            if (history instanceof Array) {
                history = { lastValue: '', values: history };
            }
            if (history.lastValue) {
                this.n.setText(history.lastValue);
            }
            const input = this.a = this.B(this.s.createInstance(suggestEnabledInput_1.$XCb, {
                id: 'testing.explorer.filter',
                ariaLabel: (0, nls_1.localize)(5, null),
                parent: wrapper,
                suggestionProvider: {
                    triggerCharacters: ['@'],
                    provideResults: () => [
                        ...Object.entries(testFilterDescriptions).map(([label, detail]) => ({ label, detail })),
                        ...iterator_1.Iterable.map(this.y.collection.tags.values(), tag => {
                            const { ctrlId, tagId } = (0, testTypes_1.$UI)(tag.id);
                            const insertText = `@${ctrlId}:${tagId}`;
                            return ({
                                label: `@${ctrlId}:${tagId}`,
                                detail: this.y.collection.getNodeById(ctrlId)?.item.label,
                                insertText: tagId.includes(' ') ? `@${ctrlId}:"${tagId.replace(/(["\\])/g, '\\$1')}"` : insertText,
                            });
                        }),
                    ].filter(r => !this.n.text.value.includes(r.label)),
                },
                resourceHandle: 'testing:filter',
                suggestOptions: {
                    value: this.n.text.value,
                    placeholderText: (0, nls_1.localize)(6, null),
                },
                history: history.values
            }));
            this.B(this.n.text.onDidChange(newValue => {
                if (input.getValue() !== newValue) {
                    input.setValue(newValue);
                }
            }));
            this.B(this.n.onDidRequestInputFocus(() => {
                input.focus();
            }));
            this.B(input.onDidFocus(() => {
                this.c.fire();
            }));
            this.B(input.onInputDidChange(() => updateDelayer.trigger(() => {
                input.addToHistory();
                this.n.setText(input.getValue());
            })));
            const actionbar = this.B(new actionbar_1.$1P(container, {
                actionViewItemProvider: action => {
                    if (action.id === this.h.id) {
                        return this.s.createInstance(FiltersDropdownMenuActionViewItem, action, this.n, this.actionRunner);
                    }
                    return undefined;
                },
            }));
            actionbar.push(this.h, { icon: true, label: false });
            this.layout(this.b.clientWidth);
        }
        layout(width) {
            this.a.layout(new dom.$BO(width - /* horizontal padding */ 24 - /* editor padding */ 8 - /* filter button padding */ 22, 20));
        }
        /**
         * Focuses the filter input.
         */
        focus() {
            this.a.focus();
        }
        /**
         * Persists changes to the input history.
         */
        saveState() {
            this.g.store({ lastValue: this.a.getValue(), values: this.a.getHistory() });
        }
        /**
         * @override
         */
        dispose() {
            this.saveState();
            super.dispose();
        }
        /**
         * Updates the 'checked' state of the filter submenu.
         */
        H() {
            this.h.checked = this.y.excluded.hasAny;
        }
    };
    exports.$vLb = $vLb;
    exports.$vLb = $vLb = __decorate([
        __param(1, testExplorerFilterState_1.$EKb),
        __param(2, instantiation_1.$Ah),
        __param(3, testService_1.$4sb)
    ], $vLb);
    let FiltersDropdownMenuActionViewItem = class FiltersDropdownMenuActionViewItem extends dropdownActionViewItem_1.$CR {
        constructor(action, a, actionRunner, contextMenuService, g) {
            super(action, { getActions: () => this.N() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
                menuAsChild: true
            });
            this.a = a;
            this.g = g;
        }
        render(container) {
            super.render(container);
            this.G();
        }
        N() {
            return [
                ...["@failed" /* TestFilterTerm.Failed */, "@executed" /* TestFilterTerm.Executed */, "@doc" /* TestFilterTerm.CurrentDoc */].map(term => ({
                    checked: this.a.isFilteringFor(term),
                    class: undefined,
                    enabled: true,
                    id: term,
                    label: testFilterDescriptions[term],
                    run: () => this.a.toggleFilteringFor(term),
                    tooltip: '',
                    dispose: () => null
                })),
                new actions_1.$ii(),
                {
                    checked: this.a.fuzzy.value,
                    class: undefined,
                    enabled: true,
                    id: 'fuzzy',
                    label: (0, nls_1.localize)(7, null),
                    run: () => this.a.fuzzy.value = !this.a.fuzzy.value,
                    tooltip: ''
                },
                new actions_1.$ii(),
                {
                    checked: this.a.isFilteringFor("@hidden" /* TestFilterTerm.Hidden */),
                    class: undefined,
                    enabled: this.g.excluded.hasAny,
                    id: 'showExcluded',
                    label: (0, nls_1.localize)(8, null),
                    run: () => this.a.toggleFilteringFor("@hidden" /* TestFilterTerm.Hidden */),
                    tooltip: ''
                },
                {
                    checked: false,
                    class: undefined,
                    enabled: this.g.excluded.hasAny,
                    id: 'removeExcluded',
                    label: (0, nls_1.localize)(9, null),
                    run: async () => this.g.excluded.clear(),
                    tooltip: ''
                }
            ];
        }
        G() {
            this.element.classList.toggle('checked', this._action.checked);
        }
    };
    FiltersDropdownMenuActionViewItem = __decorate([
        __param(3, contextView_1.$WZ),
        __param(4, testService_1.$4sb)
    ], FiltersDropdownMenuActionViewItem);
});
//# sourceMappingURL=testingExplorerFilter.js.map