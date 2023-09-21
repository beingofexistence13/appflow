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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/languages/language", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/parameterHints/browser/provideSignatureHelp", "vs/nls!vs/editor/contrib/parameterHints/browser/parameterHintsWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/css!./parameterHints"], function (require, exports, dom, aria, scrollableElement_1, codicons_1, event_1, lifecycle_1, strings_1, types_1, language_1, markdownRenderer_1, provideSignatureHelp_1, nls, contextkey_1, opener_1, colorRegistry_1, iconRegistry_1, themables_1) {
    "use strict";
    var $m0_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m0 = void 0;
    const $ = dom.$;
    const parameterHintsNextIcon = (0, iconRegistry_1.$9u)('parameter-hints-next', codicons_1.$Pj.chevronDown, nls.localize(0, null));
    const parameterHintsPreviousIcon = (0, iconRegistry_1.$9u)('parameter-hints-previous', codicons_1.$Pj.chevronUp, nls.localize(1, null));
    let $m0 = class $m0 extends lifecycle_1.$kc {
        static { $m0_1 = this; }
        static { this.a = 'editor.widget.parameterHintsWidget'; }
        constructor(n, r, contextKeyService, openerService, languageService) {
            super();
            this.n = n;
            this.r = r;
            this.c = this.B(new lifecycle_1.$jc());
            this.j = false;
            this.m = null;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.b = this.B(new markdownRenderer_1.$K2({ editor: n }, languageService, openerService));
            this.f = provideSignatureHelp_1.$j0.Visible.bindTo(contextKeyService);
            this.g = provideSignatureHelp_1.$j0.MultipleSignatures.bindTo(contextKeyService);
        }
        s() {
            const element = $('.editor-widget.parameter-hints-widget');
            const wrapper = dom.$0O(element, $('.phwrapper'));
            wrapper.tabIndex = -1;
            const controls = dom.$0O(wrapper, $('.controls'));
            const previous = dom.$0O(controls, $('.button' + themables_1.ThemeIcon.asCSSSelector(parameterHintsPreviousIcon)));
            const overloads = dom.$0O(controls, $('.overloads'));
            const next = dom.$0O(controls, $('.button' + themables_1.ThemeIcon.asCSSSelector(parameterHintsNextIcon)));
            this.B(dom.$nO(previous, 'click', e => {
                dom.$5O.stop(e);
                this.previous();
            }));
            this.B(dom.$nO(next, 'click', e => {
                dom.$5O.stop(e);
                this.next();
            }));
            const body = $('.body');
            const scrollbar = new scrollableElement_1.$UP(body, {
                alwaysConsumeMouseWheel: true,
            });
            this.B(scrollbar);
            wrapper.appendChild(scrollbar.getDomNode());
            const signature = dom.$0O(body, $('.signature'));
            const docs = dom.$0O(body, $('.docs'));
            element.style.userSelect = 'text';
            this.h = {
                element,
                signature,
                overloads,
                docs,
                scrollbar,
            };
            this.n.addContentWidget(this);
            this.hide();
            this.B(this.n.onDidChangeCursorSelection(e => {
                if (this.j) {
                    this.n.layoutContentWidget(this);
                }
            }));
            const updateFont = () => {
                if (!this.h) {
                    return;
                }
                const fontInfo = this.n.getOption(50 /* EditorOption.fontInfo */);
                this.h.element.style.fontSize = `${fontInfo.fontSize}px`;
                this.h.element.style.lineHeight = `${fontInfo.lineHeight / fontInfo.fontSize}`;
            };
            updateFont();
            this.B(event_1.Event.chain(this.n.onDidChangeConfiguration.bind(this.n), $ => $.filter(e => e.hasChanged(50 /* EditorOption.fontInfo */)))(updateFont));
            this.B(this.n.onDidLayoutChange(e => this.z()));
            this.z();
        }
        show() {
            if (this.j) {
                return;
            }
            if (!this.h) {
                this.s();
            }
            this.f.set(true);
            this.j = true;
            setTimeout(() => {
                this.h?.element.classList.add('visible');
            }, 100);
            this.n.layoutContentWidget(this);
        }
        hide() {
            this.c.clear();
            if (!this.j) {
                return;
            }
            this.f.reset();
            this.j = false;
            this.m = null;
            this.h?.element.classList.remove('visible');
            this.n.layoutContentWidget(this);
        }
        getPosition() {
            if (this.j) {
                return {
                    position: this.n.getPosition(),
                    preference: [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */]
                };
            }
            return null;
        }
        render(hints) {
            this.c.clear();
            if (!this.h) {
                return;
            }
            const multiple = hints.signatures.length > 1;
            this.h.element.classList.toggle('multiple', multiple);
            this.g.set(multiple);
            this.h.signature.innerText = '';
            this.h.docs.innerText = '';
            const signature = hints.signatures[hints.activeSignature];
            if (!signature) {
                return;
            }
            const code = dom.$0O(this.h.signature, $('.code'));
            const fontInfo = this.n.getOption(50 /* EditorOption.fontInfo */);
            code.style.fontSize = `${fontInfo.fontSize}px`;
            code.style.fontFamily = fontInfo.fontFamily;
            const hasParameters = signature.parameters.length > 0;
            const activeParameterIndex = signature.activeParameter ?? hints.activeParameter;
            if (!hasParameters) {
                const label = dom.$0O(code, $('span'));
                label.textContent = signature.label;
            }
            else {
                this.w(code, signature, activeParameterIndex);
            }
            const activeParameter = signature.parameters[activeParameterIndex];
            if (activeParameter?.documentation) {
                const documentation = $('span.documentation');
                if (typeof activeParameter.documentation === 'string') {
                    documentation.textContent = activeParameter.documentation;
                }
                else {
                    const renderedContents = this.t(activeParameter.documentation);
                    documentation.appendChild(renderedContents.element);
                }
                dom.$0O(this.h.docs, $('p', {}, documentation));
            }
            if (signature.documentation === undefined) {
                /** no op */
            }
            else if (typeof signature.documentation === 'string') {
                dom.$0O(this.h.docs, $('p', {}, signature.documentation));
            }
            else {
                const renderedContents = this.t(signature.documentation);
                dom.$0O(this.h.docs, renderedContents.element);
            }
            const hasDocs = this.u(signature, activeParameter);
            this.h.signature.classList.toggle('has-docs', hasDocs);
            this.h.docs.classList.toggle('empty', !hasDocs);
            this.h.overloads.textContent =
                String(hints.activeSignature + 1).padStart(hints.signatures.length.toString().length, '0') + '/' + hints.signatures.length;
            if (activeParameter) {
                let labelToAnnounce = '';
                const param = signature.parameters[activeParameterIndex];
                if (Array.isArray(param.label)) {
                    labelToAnnounce = signature.label.substring(param.label[0], param.label[1]);
                }
                else {
                    labelToAnnounce = param.label;
                }
                if (param.documentation) {
                    labelToAnnounce += typeof param.documentation === 'string' ? `, ${param.documentation}` : `, ${param.documentation.value}`;
                }
                if (signature.documentation) {
                    labelToAnnounce += typeof signature.documentation === 'string' ? `, ${signature.documentation}` : `, ${signature.documentation.value}`;
                }
                // Select method gets called on every user type while parameter hints are visible.
                // We do not want to spam the user with same announcements, so we only announce if the current parameter changed.
                if (this.m !== labelToAnnounce) {
                    aria.$$P(nls.localize(2, null, labelToAnnounce));
                    this.m = labelToAnnounce;
                }
            }
            this.n.layoutContentWidget(this);
            this.h.scrollbar.scanDomNode();
        }
        t(markdown) {
            const renderedContents = this.c.add(this.b.render(markdown, {
                asyncRenderCallback: () => {
                    this.h?.scrollbar.scanDomNode();
                }
            }));
            renderedContents.element.classList.add('markdown-docs');
            return renderedContents;
        }
        u(signature, activeParameter) {
            if (activeParameter && typeof activeParameter.documentation === 'string' && (0, types_1.$uf)(activeParameter.documentation).length > 0) {
                return true;
            }
            if (activeParameter && typeof activeParameter.documentation === 'object' && (0, types_1.$uf)(activeParameter.documentation).value.length > 0) {
                return true;
            }
            if (signature.documentation && typeof signature.documentation === 'string' && (0, types_1.$uf)(signature.documentation).length > 0) {
                return true;
            }
            if (signature.documentation && typeof signature.documentation === 'object' && (0, types_1.$uf)(signature.documentation.value).length > 0) {
                return true;
            }
            return false;
        }
        w(parent, signature, activeParameterIndex) {
            const [start, end] = this.y(signature, activeParameterIndex);
            const beforeSpan = document.createElement('span');
            beforeSpan.textContent = signature.label.substring(0, start);
            const paramSpan = document.createElement('span');
            paramSpan.textContent = signature.label.substring(start, end);
            paramSpan.className = 'parameter active';
            const afterSpan = document.createElement('span');
            afterSpan.textContent = signature.label.substring(end);
            dom.$0O(parent, beforeSpan, paramSpan, afterSpan);
        }
        y(signature, paramIdx) {
            const param = signature.parameters[paramIdx];
            if (!param) {
                return [0, 0];
            }
            else if (Array.isArray(param.label)) {
                return param.label;
            }
            else if (!param.label.length) {
                return [0, 0];
            }
            else {
                const regex = new RegExp(`(\\W|^)${(0, strings_1.$qe)(param.label)}(?=\\W|$)`, 'g');
                regex.test(signature.label);
                const idx = regex.lastIndex - param.label.length;
                return idx >= 0
                    ? [idx, regex.lastIndex]
                    : [0, 0];
            }
        }
        next() {
            this.n.focus();
            this.r.next();
        }
        previous() {
            this.n.focus();
            this.r.previous();
        }
        getDomNode() {
            if (!this.h) {
                this.s();
            }
            return this.h.element;
        }
        getId() {
            return $m0_1.a;
        }
        z() {
            if (!this.h) {
                return;
            }
            const height = Math.max(this.n.getLayoutInfo().height / 4, 250);
            const maxHeight = `${height}px`;
            this.h.element.style.maxHeight = maxHeight;
            const wrapper = this.h.element.getElementsByClassName('phwrapper');
            if (wrapper.length) {
                wrapper[0].style.maxHeight = maxHeight;
            }
        }
    };
    exports.$m0 = $m0;
    exports.$m0 = $m0 = $m0_1 = __decorate([
        __param(2, contextkey_1.$3i),
        __param(3, opener_1.$NT),
        __param(4, language_1.$ct)
    ], $m0);
    (0, colorRegistry_1.$sv)('editorHoverWidget.highlightForeground', { dark: colorRegistry_1.$Jx, light: colorRegistry_1.$Jx, hcDark: colorRegistry_1.$Jx, hcLight: colorRegistry_1.$Jx }, nls.localize(3, null));
});
//# sourceMappingURL=parameterHintsWidget.js.map