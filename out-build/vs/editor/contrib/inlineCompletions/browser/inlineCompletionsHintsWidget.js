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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/platform", "vs/base/common/themables", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/contrib/inlineCompletions/browser/commandIds", "vs/nls!vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/iconRegistry", "vs/css!./inlineCompletionsHintsWidget"], function (require, exports, dom_1, actionViewItems_1, keybindingLabel_1, actions_1, arrays_1, async_1, codicons_1, lifecycle_1, observable_1, platform_1, themables_1, position_1, languages_1, commandIds_1, nls_1, menuEntryActionViewItem_1, toolbar_1, actions_2, commands_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, telemetry_1, iconRegistry_1) {
    "use strict";
    var $O6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P6 = exports.$O6 = exports.$N6 = void 0;
    let $N6 = class $N6 extends lifecycle_1.$kc {
        constructor(n, r, s) {
            super();
            this.n = n;
            this.r = r;
            this.s = s;
            this.f = (0, observable_1.observableFromEvent)(this.n.onDidChangeConfiguration, () => this.n.getOption(62 /* EditorOption.inlineSuggest */).showToolbar === 'always');
            this.j = undefined;
            this.m = (0, observable_1.derived)(this, reader => {
                const ghostText = this.r.read(reader)?.ghostText.read(reader);
                if (!this.f.read(reader) || !ghostText || ghostText.parts.length === 0) {
                    this.j = undefined;
                    return null;
                }
                const firstColumn = ghostText.parts[0].column;
                if (this.j && this.j.lineNumber !== ghostText.lineNumber) {
                    this.j = undefined;
                }
                const position = new position_1.$js(ghostText.lineNumber, Math.min(firstColumn, this.j?.column ?? Number.MAX_SAFE_INTEGER));
                this.j = position;
                return position;
            });
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description setup content widget */
                const model = this.r.read(reader);
                if (!model || !this.f.read(reader)) {
                    return;
                }
                const contentWidget = store.add(this.s.createInstance($O6, this.n, true, this.m, model.selectedInlineCompletionIndex, model.inlineCompletionsCount, model.selectedInlineCompletion.map(v => v?.inlineCompletion.source.inlineCompletions.commands ?? [])));
                n.addContentWidget(contentWidget);
                store.add((0, lifecycle_1.$ic)(() => n.removeContentWidget(contentWidget)));
                store.add((0, observable_1.autorun)(reader => {
                    /** @description request explicit */
                    const position = this.m.read(reader);
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
    exports.$N6 = $N6;
    exports.$N6 = $N6 = __decorate([
        __param(2, instantiation_1.$Ah)
    ], $N6);
    const inlineSuggestionHintsNextIcon = (0, iconRegistry_1.$9u)('inline-suggestion-hints-next', codicons_1.$Pj.chevronRight, (0, nls_1.localize)(0, null));
    const inlineSuggestionHintsPreviousIcon = (0, iconRegistry_1.$9u)('inline-suggestion-hints-previous', codicons_1.$Pj.chevronLeft, (0, nls_1.localize)(1, null));
    let $O6 = class $O6 extends lifecycle_1.$kc {
        static { $O6_1 = this; }
        static { this.f = false; }
        static get dropDownVisible() { return this.f; }
        static { this.id = 0; }
        n(commandId, label, iconClassName) {
            const action = new actions_1.$gi(commandId, label, iconClassName, true, () => this.L.executeCommand(commandId));
            const kb = this.M.lookupKeybinding(commandId, this.N);
            let tooltip = label;
            if (kb) {
                tooltip = (0, nls_1.localize)(2, null, label, kb.getLabel());
            }
            action.tooltip = tooltip;
            return action;
        }
        constructor(D, F, G, H, I, J, L, instantiationService, M, N, O) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.j = `InlineSuggestionHintsContentWidget${$O6_1.id++}`;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this.m = (0, dom_1.h)('div.inlineSuggestionsHints', { className: this.F ? '.withBorder' : '' }, [
                (0, dom_1.h)('div@toolBar'),
            ]);
            this.r = this.n(commandIds_1.$i5, (0, nls_1.localize)(3, null), themables_1.ThemeIcon.asClassName(inlineSuggestionHintsPreviousIcon));
            this.s = new actions_1.$gi('inlineSuggestionHints.availableSuggestionCount', '', undefined, false);
            this.t = this.n(commandIds_1.$j5, (0, nls_1.localize)(4, null), themables_1.ThemeIcon.asClassName(inlineSuggestionHintsNextIcon));
            // TODO@hediet: deprecate MenuId.InlineCompletionsActions
            this.w = this.B(this.O.createMenu(actions_2.$Ru.InlineCompletionsActions, this.N));
            this.y = this.B(new async_1.$Sg(() => {
                this.s.label = '';
            }, 100));
            this.z = this.B(new async_1.$Sg(() => {
                this.r.enabled = this.t.enabled = false;
            }, 100));
            this.C = [];
            this.u = this.B(instantiationService.createInstance($P6, this.m.toolBar, actions_2.$Ru.InlineSuggestionToolbar, {
                menuOptions: { renderShortTitle: true },
                toolbarOptions: { primaryGroup: g => g.startsWith('primary') },
                actionViewItemProvider: (action, options) => {
                    if (action instanceof actions_2.$Vu) {
                        return instantiationService.createInstance(StatusBarViewItem, action, undefined);
                    }
                    if (action === this.s) {
                        const a = new ActionViewItemWithClassName(undefined, action, { label: true, icon: false });
                        a.setClass('availableSuggestionCount');
                        return a;
                    }
                    return undefined;
                },
                telemetrySource: 'InlineSuggestionToolbar',
            }));
            this.u.setPrependedPrimaryActions([
                this.r,
                this.s,
                this.t,
            ]);
            this.B(this.u.onDidChangeDropdownVisibility(e => {
                $O6_1.f = e;
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update position */
                this.G.read(reader);
                this.D.layoutContentWidget(this);
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description counts */
                const suggestionCount = this.I.read(reader);
                const currentSuggestionIdx = this.H.read(reader);
                if (suggestionCount !== undefined) {
                    this.y.cancel();
                    this.s.label = `${currentSuggestionIdx + 1}/${suggestionCount}`;
                }
                else {
                    this.y.schedule();
                }
                if (suggestionCount !== undefined && suggestionCount > 1) {
                    this.z.cancel();
                    this.r.enabled = this.t.enabled = true;
                }
                else {
                    this.z.schedule();
                }
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description extra commands */
                const extraCommands = this.J.read(reader);
                if ((0, arrays_1.$sb)(this.C, extraCommands)) {
                    // nothing to update
                    return;
                }
                this.C = extraCommands;
                const extraActions = extraCommands.map(c => ({
                    class: undefined,
                    id: c.id,
                    enabled: true,
                    tooltip: c.tooltip || '',
                    label: c.title,
                    run: (event) => {
                        return this.L.executeCommand(c.id);
                    },
                }));
                for (const [_, group] of this.w.getActions()) {
                    for (const action of group) {
                        if (action instanceof actions_2.$Vu) {
                            extraActions.push(action);
                        }
                    }
                }
                if (extraActions.length > 0) {
                    extraActions.unshift(new actions_1.$ii());
                }
                this.u.setAdditionalSecondaryActions(extraActions);
            }));
        }
        getId() { return this.j; }
        getDomNode() {
            return this.m.root;
        }
        getPosition() {
            return {
                position: this.G.get(),
                preference: [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */],
                positionAffinity: 3 /* PositionAffinity.LeftOfInjectedText */,
            };
        }
    };
    exports.$O6 = $O6;
    exports.$O6 = $O6 = $O6_1 = __decorate([
        __param(6, commands_1.$Fr),
        __param(7, instantiation_1.$Ah),
        __param(8, keybinding_1.$2D),
        __param(9, contextkey_1.$3i),
        __param(10, actions_2.$Su)
    ], $O6);
    class ActionViewItemWithClassName extends actionViewItems_1.$NQ {
        constructor() {
            super(...arguments);
            this.n = undefined;
        }
        setClass(className) {
            this.n = className;
        }
        render(container) {
            super.render(container);
            if (this.n) {
                container.classList.add(this.n);
            }
        }
    }
    class StatusBarViewItem extends menuEntryActionViewItem_1.$C3 {
        w() {
            const kb = this.S.lookupKeybinding(this._action.id, this.W);
            if (!kb) {
                return super.w();
            }
            if (this.H) {
                const div = (0, dom_1.h)('div.keybinding').root;
                const k = new keybindingLabel_1.$TR(div, platform_1.OS, { disableTitle: true, ...keybindingLabel_1.$SR });
                k.set(kb);
                this.H.textContent = this._action.label;
                this.H.appendChild(div);
                this.H.classList.add('inlineSuggestionStatusBarItemLabel');
            }
        }
    }
    let $P6 = class $P6 extends toolbar_1.$L6 {
        constructor(container, N, O, P, Q, contextMenuService, keybindingService, telemetryService) {
            super(container, { resetMenu: N, ...O }, P, Q, contextMenuService, keybindingService, telemetryService);
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.J = this.q.add(this.P.createMenu(this.N, this.Q, { emitEventsForSubmenuChanges: true }));
            this.L = [];
            this.M = [];
            this.q.add(this.J.onDidChange(() => this.R()));
            this.R();
        }
        R() {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.$B3)(this.J, this.O?.menuOptions, { primary, secondary }, this.O?.toolbarOptions?.primaryGroup, this.O?.toolbarOptions?.shouldInlineSubmenu, this.O?.toolbarOptions?.useSeparatorsInPrimaryActions);
            secondary.push(...this.L);
            primary.unshift(...this.M);
            this.setActions(primary, secondary);
        }
        setPrependedPrimaryActions(actions) {
            if ((0, arrays_1.$sb)(this.M, actions, (a, b) => a === b)) {
                return;
            }
            this.M = actions;
            this.R();
        }
        setAdditionalSecondaryActions(actions) {
            if ((0, arrays_1.$sb)(this.L, actions, (a, b) => a === b)) {
                return;
            }
            this.L = actions;
            this.R();
        }
    };
    exports.$P6 = $P6;
    exports.$P6 = $P6 = __decorate([
        __param(3, actions_2.$Su),
        __param(4, contextkey_1.$3i),
        __param(5, contextView_1.$WZ),
        __param(6, keybinding_1.$2D),
        __param(7, telemetry_1.$9k)
    ], $P6);
});
//# sourceMappingURL=inlineCompletionsHintsWidget.js.map