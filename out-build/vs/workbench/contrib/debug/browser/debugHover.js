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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/platform", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatures", "vs/nls!vs/workbench/contrib/debug/browser/debugHover", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/debug/browser/variablesView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, dom, scrollableElement_1, arrays_1, cancellation_1, lifecycle, numbers_1, platform_1, range_1, textModel_1, languageFeatures_1, nls, instantiation_1, listService_1, log_1, colorRegistry_1, baseDebugView_1, linkDetector_1, variablesView_1, debug_1, debugModel_1, debugUtils_1) {
    "use strict";
    var $zRb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zRb = exports.$yRb = exports.ShowDebugHoverResult = void 0;
    const $ = dom.$;
    var ShowDebugHoverResult;
    (function (ShowDebugHoverResult) {
        ShowDebugHoverResult[ShowDebugHoverResult["NOT_CHANGED"] = 0] = "NOT_CHANGED";
        ShowDebugHoverResult[ShowDebugHoverResult["NOT_AVAILABLE"] = 1] = "NOT_AVAILABLE";
        ShowDebugHoverResult[ShowDebugHoverResult["CANCELLED"] = 2] = "CANCELLED";
    })(ShowDebugHoverResult || (exports.ShowDebugHoverResult = ShowDebugHoverResult = {}));
    async function doFindExpression(container, namesToFind) {
        if (!container) {
            return null;
        }
        const children = await container.getChildren();
        // look for our variable in the list. First find the parents of the hovered variable if there are any.
        const filtered = children.filter(v => namesToFind[0] === v.name);
        if (filtered.length !== 1) {
            return null;
        }
        if (namesToFind.length === 1) {
            return filtered[0];
        }
        else {
            return doFindExpression(filtered[0], namesToFind.slice(1));
        }
    }
    async function $yRb(stackFrame, namesToFind) {
        const scopes = await stackFrame.getScopes();
        const nonExpensive = scopes.filter(s => !s.expensive);
        const expressions = (0, arrays_1.$Fb)(await Promise.all(nonExpensive.map(scope => doFindExpression(scope, namesToFind))));
        // only show if all expressions found have the same value
        return expressions.length > 0 && expressions.every(e => e.value === expressions[0].value) ? expressions[0] : undefined;
    }
    exports.$yRb = $yRb;
    let $zRb = class $zRb {
        static { $zRb_1 = this; }
        static { this.ID = 'debug.hoverWidget'; }
        constructor(r, t, u) {
            this.r = r;
            this.t = t;
            this.u = u;
            // editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.h = this.r.createDecorationsCollection();
            this.q = false;
            this.m = [];
            this.a = false;
            this.f = null;
            this.g = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
            this.o = this.u.createInstance(DebugHoverComputer, this.r);
        }
        w() {
            this.c = $('.debug-hover-widget');
            this.i = dom.$0O(this.c, $('.complex-value'));
            this.j = dom.$0O(this.i, $('.title'));
            this.l = dom.$0O(this.i, $('.debug-hover-tree'));
            this.l.setAttribute('role', 'tree');
            const tip = dom.$0O(this.i, $('.tip'));
            tip.textContent = nls.localize(0, null, platform_1.$j ? 'Option' : 'Alt');
            const dataSource = new DebugHoverDataSource();
            const linkeDetector = this.u.createInstance(linkDetector_1.$2Pb);
            this.d = this.u.createInstance(listService_1.$w4, 'DebugHover', this.l, new DebugHoverDelegate(), [this.u.createInstance(variablesView_1.$pRb, linkeDetector)], dataSource, {
                accessibilityProvider: new DebugHoverAccessibilityProvider(),
                mouseSupport: false,
                horizontalScrolling: true,
                useShadows: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.name },
                overrideStyles: {
                    listBackground: colorRegistry_1.$3w
                }
            });
            this.k = $('.value');
            this.k.tabIndex = 0;
            this.k.setAttribute('role', 'tooltip');
            this.n = new scrollableElement_1.$UP(this.k, { horizontal: 2 /* ScrollbarVisibility.Hidden */ });
            this.c.appendChild(this.n.getDomNode());
            this.m.push(this.n);
            this.r.applyFontInfo(this.c);
            this.c.style.backgroundColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$3w);
            this.c.style.border = `1px solid ${(0, colorRegistry_1.$pv)(colorRegistry_1.$5w)}`;
            this.c.style.color = (0, colorRegistry_1.$pv)(colorRegistry_1.$4w);
            this.m.push(this.d.onDidChangeContentHeight(() => {
                if (!this.q) {
                    // Don't do a layout in the middle of the async setInput
                    this.A();
                }
            }));
            this.m.push(this.d.onDidChangeContentWidth(() => {
                if (!this.q) {
                    // Don't do a layout in the middle of the async setInput
                    this.A();
                }
            }));
            this.x();
            this.r.addContentWidget(this);
        }
        x() {
            this.m.push(dom.$oO(this.c, 'keydown', (e) => {
                if (e.equals(9 /* KeyCode.Escape */)) {
                    this.hide();
                }
            }));
            this.m.push(this.r.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.r.applyFontInfo(this.c);
                }
            }));
            this.m.push(this.t.getViewModel().onDidEvaluateLazyExpression(async (e) => {
                if (e instanceof debugModel_1.$JFb && this.d.hasNode(e)) {
                    await this.d.updateChildren(e, false, true);
                    await this.d.expand(e);
                }
            }));
        }
        isHovered() {
            return !!this.c?.matches(':hover');
        }
        isVisible() {
            return this.a;
        }
        willBeVisible() {
            return !!this.b;
        }
        getId() {
            return $zRb_1.ID;
        }
        getDomNode() {
            return this.c;
        }
        async showAt(position, focus) {
            this.b?.cancel();
            const cancellationSource = this.b = new cancellation_1.$pd();
            const session = this.t.getViewModel().focusedSession;
            if (!session || !this.r.hasModel()) {
                this.hide();
                return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
            }
            const result = await this.o.compute(position, cancellationSource.token);
            if (cancellationSource.token.isCancellationRequested) {
                this.hide();
                return 2 /* ShowDebugHoverResult.CANCELLED */;
            }
            if (!result.range) {
                this.hide();
                return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
            }
            if (this.isVisible() && !result.rangeChanged) {
                return 0 /* ShowDebugHoverResult.NOT_CHANGED */;
            }
            const expression = await this.o.evaluate(session);
            if (cancellationSource.token.isCancellationRequested) {
                this.hide();
                return 2 /* ShowDebugHoverResult.CANCELLED */;
            }
            if (!expression || (expression instanceof debugModel_1.$IFb && !expression.available)) {
                this.hide();
                return 1 /* ShowDebugHoverResult.NOT_AVAILABLE */;
            }
            this.h.set([{
                    range: result.range,
                    options: $zRb_1.y
                }]);
            return this.z(result.range.getStartPosition(), expression, focus);
        }
        static { this.y = textModel_1.$RC.register({
            description: 'bdebug-hover-highlight',
            className: 'hoverHighlight'
        }); }
        async z(position, expression, focus, forceValueHover = false) {
            if (!this.c) {
                this.w();
            }
            this.f = position;
            this.a = true;
            if (!expression.hasChildren || forceValueHover) {
                this.i.hidden = true;
                this.k.hidden = false;
                (0, baseDebugView_1.$$Pb)(expression, this.k, {
                    showChanged: false,
                    colorize: true
                });
                this.k.title = '';
                this.r.layoutContentWidget(this);
                this.n.scanDomNode();
                if (focus) {
                    this.r.render();
                    this.k.focus();
                }
                return undefined;
            }
            this.k.hidden = true;
            this.p = expression;
            this.j.textContent = expression.value;
            this.j.title = expression.value;
            this.r.layoutContentWidget(this);
            this.d.scrollTop = 0;
            this.d.scrollLeft = 0;
            this.i.hidden = false;
            if (focus) {
                this.r.render();
                this.d.domFocus();
            }
        }
        A() {
            this.B();
            this.r.layoutContentWidget(this);
        }
        B() {
            const scrollBarHeight = 10;
            const treeHeight = Math.min(Math.max(266, this.r.getLayoutInfo().height * 0.55), this.d.contentHeight + scrollBarHeight);
            const realTreeWidth = this.d.contentWidth;
            const treeWidth = (0, numbers_1.$Hl)(realTreeWidth, 400, 550);
            this.d.layout(treeHeight, treeWidth);
            this.l.style.height = `${treeHeight}px`;
            this.n.scanDomNode();
        }
        beforeRender() {
            // beforeRender will be called each time the hover size changes, and the content widget is layed out again.
            if (this.p) {
                const expression = this.p;
                this.p = undefined;
                // Do this in beforeRender once the content widget is no longer display=none so that its elements' sizes will be measured correctly.
                this.q = true;
                this.d.setInput(expression).finally(() => {
                    this.q = false;
                });
            }
            return null;
        }
        afterRender(positionPreference) {
            if (positionPreference) {
                // Remember where the editor placed you to keep position stable #109226
                this.g = [positionPreference];
            }
        }
        hide() {
            if (this.b) {
                this.b.cancel();
                this.b = undefined;
            }
            if (!this.a) {
                return;
            }
            if (dom.$NO(document.activeElement, this.c)) {
                this.r.focus();
            }
            this.a = false;
            this.h.clear();
            this.r.layoutContentWidget(this);
            this.g = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
        }
        getPosition() {
            return this.a ? {
                position: this.f,
                preference: this.g
            } : null;
        }
        dispose() {
            this.m = lifecycle.$fc(this.m);
        }
    };
    exports.$zRb = $zRb;
    exports.$zRb = $zRb = $zRb_1 = __decorate([
        __param(1, debug_1.$nH),
        __param(2, instantiation_1.$Ah)
    ], $zRb);
    class DebugHoverAccessibilityProvider {
        getWidgetAriaLabel() {
            return nls.localize(1, null);
        }
        getAriaLabel(element) {
            return nls.localize(2, null, element.name, element.value);
        }
    }
    class DebugHoverDataSource {
        hasChildren(element) {
            return element.hasChildren;
        }
        getChildren(element) {
            return element.getChildren();
        }
    }
    class DebugHoverDelegate {
        getHeight(element) {
            return 18;
        }
        getTemplateId(element) {
            return variablesView_1.$pRb.ID;
        }
    }
    let DebugHoverComputer = class DebugHoverComputer {
        constructor(c, d, f, g) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
        }
        async compute(position, token) {
            const session = this.d.getViewModel().focusedSession;
            if (!session || !this.c.hasModel()) {
                return { rangeChanged: false };
            }
            const model = this.c.getModel();
            const result = await (0, debugUtils_1.$oF)(this.f, model, position, token);
            if (!result) {
                return { rangeChanged: false };
            }
            const { range, matchingExpression } = result;
            const rangeChanged = this.a ?
                !this.a.equalsRange(range) :
                true;
            this.b = matchingExpression;
            this.a = range_1.$ks.lift(range);
            return { rangeChanged, range: this.a };
        }
        async evaluate(session) {
            if (!this.b) {
                this.g.error('No expression to evaluate');
                return;
            }
            if (session.capabilities.supportsEvaluateForHovers) {
                const expression = new debugModel_1.$IFb(this.b);
                await expression.evaluate(session, this.d.getViewModel().focusedStackFrame, 'hover');
                return expression;
            }
            else {
                const focusedStackFrame = this.d.getViewModel().focusedStackFrame;
                if (focusedStackFrame) {
                    return await $yRb(focusedStackFrame, (0, arrays_1.$Fb)(this.b.split('.').map(word => word.trim())));
                }
            }
            return undefined;
        }
    };
    DebugHoverComputer = __decorate([
        __param(1, debug_1.$nH),
        __param(2, languageFeatures_1.$hF),
        __param(3, log_1.$5i)
    ], DebugHoverComputer);
});
//# sourceMappingURL=debugHover.js.map