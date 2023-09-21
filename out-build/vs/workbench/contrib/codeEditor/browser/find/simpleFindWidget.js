/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget", "vs/base/browser/dom", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/strings", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/base/browser/ui/aria/aria", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/ui/sash/sash", "vs/platform/theme/common/colorRegistry", "vs/css!./simpleFindWidget"], function (require, exports, nls, dom, widget_1, async_1, findState_1, findWidget_1, contextScopedHistoryWidget_1, iconRegistry_1, themeService_1, strings, historyWidgetKeybindingHint_1, aria_1, defaultStyles_1, sash_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AWb = exports.$zWb = void 0;
    const NLS_FIND_INPUT_LABEL = nls.localize(0, null);
    const NLS_FIND_INPUT_PLACEHOLDER = nls.localize(1, null);
    const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize(2, null);
    const NLS_NEXT_MATCH_BTN_LABEL = nls.localize(3, null);
    const NLS_CLOSE_BTN_LABEL = nls.localize(4, null);
    const SIMPLE_FIND_WIDGET_INITIAL_WIDTH = 310;
    const MATCHES_COUNT_WIDTH = 73;
    class $zWb extends widget_1.$IP {
        constructor(options, contextViewService, contextKeyService, M) {
            super();
            this.M = M;
            this.y = false;
            this.J = false;
            this.L = 0;
            this.state = new findState_1.$t7();
            this.t = options.matchesLimit ?? Number.MAX_SAFE_INTEGER;
            this.a = this.B(new contextScopedHistoryWidget_1.$T5(null, contextViewService, {
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
                        this.J = false;
                        this.bb(this.J);
                        return { content: e.message };
                    }
                },
                showCommonFindToggles: options.showCommonFindToggles,
                appendCaseSensitiveLabel: options.appendCaseSensitiveActionId ? this.W(options.appendCaseSensitiveActionId) : undefined,
                appendRegexLabel: options.appendRegexActionId ? this.W(options.appendRegexActionId) : undefined,
                appendWholeWordsLabel: options.appendWholeWordsActionId ? this.W(options.appendWholeWordsActionId) : undefined,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.$L7)(M),
                inputBoxStyles: defaultStyles_1.$s2,
                toggleStyles: defaultStyles_1.$m2
            }, contextKeyService));
            // Find History with update delayer
            this.n = new async_1.$Dg(500);
            this.B(this.a.onInput(async (e) => {
                if (!options.checkImeCompletionState || !this.a.isImeSessionInProgress) {
                    this.J = this.N();
                    if (options.showResultCount) {
                        await this.updateResultCount();
                    }
                    this.bb(this.J);
                    this.cb();
                    this.X();
                }
            }));
            this.a.setRegex(!!this.state.isRegex);
            this.a.setCaseSensitive(!!this.state.matchCase);
            this.a.setWholeWords(!!this.state.wholeWord);
            this.B(this.a.onDidOptionChange(() => {
                this.state.change({
                    isRegex: this.a.getRegex(),
                    wholeWord: this.a.getWholeWords(),
                    matchCase: this.a.getCaseSensitive()
                }, true);
            }));
            this.B(this.state.onFindReplaceStateChange(() => {
                this.a.setRegex(this.state.isRegex);
                this.a.setWholeWords(this.state.wholeWord);
                this.a.setCaseSensitive(this.state.matchCase);
                this.findFirst();
            }));
            this.r = this.B(new findWidget_1.$U7({
                label: NLS_PREVIOUS_MATCH_BTN_LABEL + (options.previousMatchActionId ? this.W(options.previousMatchActionId) : ''),
                icon: findWidget_1.$O7,
                onTrigger: () => {
                    this.find(true);
                }
            }));
            this.s = this.B(new findWidget_1.$U7({
                label: NLS_NEXT_MATCH_BTN_LABEL + (options.nextMatchActionId ? this.W(options.nextMatchActionId) : ''),
                icon: findWidget_1.$P7,
                onTrigger: () => {
                    this.find(false);
                }
            }));
            const closeBtn = this.B(new findWidget_1.$U7({
                label: NLS_CLOSE_BTN_LABEL + (options.closeWidgetActionId ? this.W(options.closeWidgetActionId) : ''),
                icon: iconRegistry_1.$_u,
                onTrigger: () => {
                    this.hide();
                }
            }));
            this.c = document.createElement('div');
            this.c.classList.add('simple-find-part');
            this.c.appendChild(this.a.domNode);
            this.c.appendChild(this.r.domNode);
            this.c.appendChild(this.s.domNode);
            this.c.appendChild(closeBtn.domNode);
            // _domNode wraps _innerDomNode, ensuring that
            this.b = document.createElement('div');
            this.b.classList.add('simple-find-part-wrapper');
            this.b.appendChild(this.c);
            this.C(this.c, e => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.hide();
                    e.preventDefault();
                    return;
                }
            });
            this.g = this.B(dom.$8O(this.c));
            this.B(this.g.onDidFocus(this.O.bind(this)));
            this.B(this.g.onDidBlur(this.P.bind(this)));
            this.h = this.B(dom.$8O(this.a.domNode));
            this.B(this.h.onDidFocus(this.Q.bind(this)));
            this.B(this.h.onDidBlur(this.R.bind(this)));
            this.B(dom.$nO(this.c, 'click', (event) => {
                event.stopPropagation();
            }));
            if (options?.showResultCount) {
                this.b.classList.add('result-count');
                this.w = document.createElement('div');
                this.w.className = 'matchesCount';
                this.a.domNode.insertAdjacentElement('afterend', this.w);
                this.B(this.a.onDidChange(async () => {
                    await this.updateResultCount();
                }));
                this.B(this.a.onDidOptionChange(async () => {
                    this.J = this.N();
                    await this.updateResultCount();
                    this.cb();
                    this.X();
                }));
            }
            let initialMinWidth = options?.initialWidth;
            if (initialMinWidth) {
                initialMinWidth = initialMinWidth < SIMPLE_FIND_WIDGET_INITIAL_WIDTH ? SIMPLE_FIND_WIDGET_INITIAL_WIDTH : initialMinWidth;
                this.b.style.width = `${initialMinWidth}px`;
            }
            if (options?.enableSash) {
                const _initialMinWidth = initialMinWidth ?? SIMPLE_FIND_WIDGET_INITIAL_WIDTH;
                let originalWidth = _initialMinWidth;
                // sash
                const resizeSash = new sash_1.$aR(this.c, this, { orientation: 0 /* Orientation.VERTICAL */, size: 1 });
                this.B(resizeSash.onDidStart(() => {
                    originalWidth = parseFloat(dom.$zO(this.b).width);
                }));
                this.B(resizeSash.onDidChange((e) => {
                    const width = originalWidth + e.startX - e.currentX;
                    if (width < _initialMinWidth) {
                        return;
                    }
                    this.b.style.width = `${width}px`;
                }));
                this.B(resizeSash.onDidReset(e => {
                    const currentWidth = parseFloat(dom.$zO(this.b).width);
                    if (currentWidth === _initialMinWidth) {
                        this.b.style.width = '100%';
                    }
                    else {
                        this.b.style.width = `${_initialMinWidth}px`;
                    }
                }));
            }
        }
        getVerticalSashLeft(_sash) {
            return 0;
        }
        get U() {
            return this.a.getValue();
        }
        get focusTracker() {
            return this.g;
        }
        W(actionId) {
            const kb = this.M?.lookupKeybinding(actionId);
            if (!kb) {
                return '';
            }
            return ` (${kb.getLabel()})`;
        }
        dispose() {
            super.dispose();
            if (this.b && this.b.parentElement) {
                this.b.parentElement.removeChild(this.b);
            }
        }
        isVisible() {
            return this.y;
        }
        getDomNode() {
            return this.b;
        }
        reveal(initialInput, animated = true) {
            if (initialInput) {
                this.a.setValue(initialInput);
            }
            if (this.y) {
                this.a.select();
                return;
            }
            this.y = true;
            this.updateResultCount();
            this.layout();
            setTimeout(() => {
                this.c.classList.toggle('suppress-transition', !animated);
                this.c.classList.add('visible', 'visible-transition');
                this.c.setAttribute('aria-hidden', 'false');
                this.a.select();
                if (!animated) {
                    setTimeout(() => {
                        this.c.classList.remove('suppress-transition');
                    }, 0);
                }
            }, 0);
        }
        show(initialInput) {
            if (initialInput && !this.y) {
                this.a.setValue(initialInput);
            }
            this.y = true;
            this.layout();
            setTimeout(() => {
                this.c.classList.add('visible', 'visible-transition');
                this.c.setAttribute('aria-hidden', 'false');
            }, 0);
        }
        hide(animated = true) {
            if (this.y) {
                this.c.classList.toggle('suppress-transition', !animated);
                this.c.classList.remove('visible-transition');
                this.c.setAttribute('aria-hidden', 'true');
                // Need to delay toggling visibility until after Transition, then visibility hidden - removes from tabIndex list
                setTimeout(() => {
                    this.y = false;
                    this.bb(this.J);
                    this.c.classList.remove('visible', 'suppress-transition');
                }, animated ? 200 : 0);
            }
        }
        layout(width = this.L) {
            this.L = width;
            if (!this.y) {
                return;
            }
            if (this.w) {
                let reducedFindWidget = false;
                if (SIMPLE_FIND_WIDGET_INITIAL_WIDTH + MATCHES_COUNT_WIDTH + 28 >= width) {
                    reducedFindWidget = true;
                }
                this.c.classList.toggle('reduced-find-widget', reducedFindWidget);
            }
        }
        X() {
            this.n.trigger(this.Y.bind(this));
        }
        Y() {
            this.a.inputBox.addToHistory();
        }
        Z() {
            return this.a.getRegex();
        }
        $() {
            return this.a.getWholeWords();
        }
        ab() {
            return this.a.getCaseSensitive();
        }
        bb(foundMatch) {
            const hasInput = this.U.length > 0;
            this.r.setEnabled(this.y && hasInput && foundMatch);
            this.s.setEnabled(this.y && hasInput && foundMatch);
        }
        cb() {
            // Focus back onto the find box, which
            // requires focusing onto the next button first
            this.s.focus();
            this.a.inputBox.focus();
        }
        async updateResultCount() {
            if (!this.w) {
                this.bb(this.J);
                return;
            }
            const count = await this.S();
            this.w.innerText = '';
            const showRedOutline = (this.U.length > 0 && count?.resultCount === 0);
            this.w.classList.toggle('no-results', showRedOutline);
            let label = '';
            if (count?.resultCount) {
                let matchesCount = String(count.resultCount);
                if (count.resultCount >= this.t) {
                    matchesCount += '+';
                }
                let matchesPosition = String(count.resultIndex + 1);
                if (matchesPosition === '0') {
                    matchesPosition = '?';
                }
                label = strings.$ne(findWidget_1.$Q7, matchesPosition, matchesCount);
            }
            else {
                label = findWidget_1.$R7;
            }
            (0, aria_1.$_P)(this.db(label, this.U));
            this.w.appendChild(document.createTextNode(label));
            this.J = !!count && count.resultCount > 0;
            this.bb(this.J);
        }
        changeState(state) {
            this.state.change(state, false);
        }
        db(label, searchString) {
            if (!searchString) {
                return nls.localize(5, null);
            }
            if (label === findWidget_1.$R7) {
                return searchString === ''
                    ? nls.localize(6, null, label)
                    : nls.localize(7, null, label, searchString);
            }
            return nls.localize(8, null, label, searchString);
        }
    }
    exports.$zWb = $zWb;
    exports.$AWb = (0, colorRegistry_1.$sv)('simpleFindWidget.sashBorder', { dark: '#454545', light: '#C8C8C8', hcDark: '#6FC3DF', hcLight: '#0F4A85' }, nls.localize(9, null));
    (0, themeService_1.$mv)((theme, collector) => {
        const resizeBorderBackground = theme.getColor(exports.$AWb);
        collector.addRule(`.monaco-workbench .simple-find-part .monaco-sash { background-color: ${resizeBorderBackground}; border-color: ${resizeBorderBackground} }`);
    });
});
//# sourceMappingURL=simpleFindWidget.js.map