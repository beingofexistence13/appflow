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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/types", "vs/editor/common/languages/language", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/contrib/parameterHints/browser/provideSignatureHelp", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/css!./parameterHints"], function (require, exports, dom, aria, scrollableElement_1, codicons_1, event_1, lifecycle_1, strings_1, types_1, language_1, markdownRenderer_1, provideSignatureHelp_1, nls, contextkey_1, opener_1, colorRegistry_1, iconRegistry_1, themables_1) {
    "use strict";
    var ParameterHintsWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ParameterHintsWidget = void 0;
    const $ = dom.$;
    const parameterHintsNextIcon = (0, iconRegistry_1.registerIcon)('parameter-hints-next', codicons_1.Codicon.chevronDown, nls.localize('parameterHintsNextIcon', 'Icon for show next parameter hint.'));
    const parameterHintsPreviousIcon = (0, iconRegistry_1.registerIcon)('parameter-hints-previous', codicons_1.Codicon.chevronUp, nls.localize('parameterHintsPreviousIcon', 'Icon for show previous parameter hint.'));
    let ParameterHintsWidget = class ParameterHintsWidget extends lifecycle_1.Disposable {
        static { ParameterHintsWidget_1 = this; }
        static { this.ID = 'editor.widget.parameterHintsWidget'; }
        constructor(editor, model, contextKeyService, openerService, languageService) {
            super();
            this.editor = editor;
            this.model = model;
            this.renderDisposeables = this._register(new lifecycle_1.DisposableStore());
            this.visible = false;
            this.announcedLabel = null;
            // Editor.IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this.markdownRenderer = this._register(new markdownRenderer_1.MarkdownRenderer({ editor }, languageService, openerService));
            this.keyVisible = provideSignatureHelp_1.Context.Visible.bindTo(contextKeyService);
            this.keyMultipleSignatures = provideSignatureHelp_1.Context.MultipleSignatures.bindTo(contextKeyService);
        }
        createParameterHintDOMNodes() {
            const element = $('.editor-widget.parameter-hints-widget');
            const wrapper = dom.append(element, $('.phwrapper'));
            wrapper.tabIndex = -1;
            const controls = dom.append(wrapper, $('.controls'));
            const previous = dom.append(controls, $('.button' + themables_1.ThemeIcon.asCSSSelector(parameterHintsPreviousIcon)));
            const overloads = dom.append(controls, $('.overloads'));
            const next = dom.append(controls, $('.button' + themables_1.ThemeIcon.asCSSSelector(parameterHintsNextIcon)));
            this._register(dom.addDisposableListener(previous, 'click', e => {
                dom.EventHelper.stop(e);
                this.previous();
            }));
            this._register(dom.addDisposableListener(next, 'click', e => {
                dom.EventHelper.stop(e);
                this.next();
            }));
            const body = $('.body');
            const scrollbar = new scrollableElement_1.DomScrollableElement(body, {
                alwaysConsumeMouseWheel: true,
            });
            this._register(scrollbar);
            wrapper.appendChild(scrollbar.getDomNode());
            const signature = dom.append(body, $('.signature'));
            const docs = dom.append(body, $('.docs'));
            element.style.userSelect = 'text';
            this.domNodes = {
                element,
                signature,
                overloads,
                docs,
                scrollbar,
            };
            this.editor.addContentWidget(this);
            this.hide();
            this._register(this.editor.onDidChangeCursorSelection(e => {
                if (this.visible) {
                    this.editor.layoutContentWidget(this);
                }
            }));
            const updateFont = () => {
                if (!this.domNodes) {
                    return;
                }
                const fontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
                this.domNodes.element.style.fontSize = `${fontInfo.fontSize}px`;
                this.domNodes.element.style.lineHeight = `${fontInfo.lineHeight / fontInfo.fontSize}`;
            };
            updateFont();
            this._register(event_1.Event.chain(this.editor.onDidChangeConfiguration.bind(this.editor), $ => $.filter(e => e.hasChanged(50 /* EditorOption.fontInfo */)))(updateFont));
            this._register(this.editor.onDidLayoutChange(e => this.updateMaxHeight()));
            this.updateMaxHeight();
        }
        show() {
            if (this.visible) {
                return;
            }
            if (!this.domNodes) {
                this.createParameterHintDOMNodes();
            }
            this.keyVisible.set(true);
            this.visible = true;
            setTimeout(() => {
                this.domNodes?.element.classList.add('visible');
            }, 100);
            this.editor.layoutContentWidget(this);
        }
        hide() {
            this.renderDisposeables.clear();
            if (!this.visible) {
                return;
            }
            this.keyVisible.reset();
            this.visible = false;
            this.announcedLabel = null;
            this.domNodes?.element.classList.remove('visible');
            this.editor.layoutContentWidget(this);
        }
        getPosition() {
            if (this.visible) {
                return {
                    position: this.editor.getPosition(),
                    preference: [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */]
                };
            }
            return null;
        }
        render(hints) {
            this.renderDisposeables.clear();
            if (!this.domNodes) {
                return;
            }
            const multiple = hints.signatures.length > 1;
            this.domNodes.element.classList.toggle('multiple', multiple);
            this.keyMultipleSignatures.set(multiple);
            this.domNodes.signature.innerText = '';
            this.domNodes.docs.innerText = '';
            const signature = hints.signatures[hints.activeSignature];
            if (!signature) {
                return;
            }
            const code = dom.append(this.domNodes.signature, $('.code'));
            const fontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
            code.style.fontSize = `${fontInfo.fontSize}px`;
            code.style.fontFamily = fontInfo.fontFamily;
            const hasParameters = signature.parameters.length > 0;
            const activeParameterIndex = signature.activeParameter ?? hints.activeParameter;
            if (!hasParameters) {
                const label = dom.append(code, $('span'));
                label.textContent = signature.label;
            }
            else {
                this.renderParameters(code, signature, activeParameterIndex);
            }
            const activeParameter = signature.parameters[activeParameterIndex];
            if (activeParameter?.documentation) {
                const documentation = $('span.documentation');
                if (typeof activeParameter.documentation === 'string') {
                    documentation.textContent = activeParameter.documentation;
                }
                else {
                    const renderedContents = this.renderMarkdownDocs(activeParameter.documentation);
                    documentation.appendChild(renderedContents.element);
                }
                dom.append(this.domNodes.docs, $('p', {}, documentation));
            }
            if (signature.documentation === undefined) {
                /** no op */
            }
            else if (typeof signature.documentation === 'string') {
                dom.append(this.domNodes.docs, $('p', {}, signature.documentation));
            }
            else {
                const renderedContents = this.renderMarkdownDocs(signature.documentation);
                dom.append(this.domNodes.docs, renderedContents.element);
            }
            const hasDocs = this.hasDocs(signature, activeParameter);
            this.domNodes.signature.classList.toggle('has-docs', hasDocs);
            this.domNodes.docs.classList.toggle('empty', !hasDocs);
            this.domNodes.overloads.textContent =
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
                if (this.announcedLabel !== labelToAnnounce) {
                    aria.alert(nls.localize('hint', "{0}, hint", labelToAnnounce));
                    this.announcedLabel = labelToAnnounce;
                }
            }
            this.editor.layoutContentWidget(this);
            this.domNodes.scrollbar.scanDomNode();
        }
        renderMarkdownDocs(markdown) {
            const renderedContents = this.renderDisposeables.add(this.markdownRenderer.render(markdown, {
                asyncRenderCallback: () => {
                    this.domNodes?.scrollbar.scanDomNode();
                }
            }));
            renderedContents.element.classList.add('markdown-docs');
            return renderedContents;
        }
        hasDocs(signature, activeParameter) {
            if (activeParameter && typeof activeParameter.documentation === 'string' && (0, types_1.assertIsDefined)(activeParameter.documentation).length > 0) {
                return true;
            }
            if (activeParameter && typeof activeParameter.documentation === 'object' && (0, types_1.assertIsDefined)(activeParameter.documentation).value.length > 0) {
                return true;
            }
            if (signature.documentation && typeof signature.documentation === 'string' && (0, types_1.assertIsDefined)(signature.documentation).length > 0) {
                return true;
            }
            if (signature.documentation && typeof signature.documentation === 'object' && (0, types_1.assertIsDefined)(signature.documentation.value).length > 0) {
                return true;
            }
            return false;
        }
        renderParameters(parent, signature, activeParameterIndex) {
            const [start, end] = this.getParameterLabelOffsets(signature, activeParameterIndex);
            const beforeSpan = document.createElement('span');
            beforeSpan.textContent = signature.label.substring(0, start);
            const paramSpan = document.createElement('span');
            paramSpan.textContent = signature.label.substring(start, end);
            paramSpan.className = 'parameter active';
            const afterSpan = document.createElement('span');
            afterSpan.textContent = signature.label.substring(end);
            dom.append(parent, beforeSpan, paramSpan, afterSpan);
        }
        getParameterLabelOffsets(signature, paramIdx) {
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
                const regex = new RegExp(`(\\W|^)${(0, strings_1.escapeRegExpCharacters)(param.label)}(?=\\W|$)`, 'g');
                regex.test(signature.label);
                const idx = regex.lastIndex - param.label.length;
                return idx >= 0
                    ? [idx, regex.lastIndex]
                    : [0, 0];
            }
        }
        next() {
            this.editor.focus();
            this.model.next();
        }
        previous() {
            this.editor.focus();
            this.model.previous();
        }
        getDomNode() {
            if (!this.domNodes) {
                this.createParameterHintDOMNodes();
            }
            return this.domNodes.element;
        }
        getId() {
            return ParameterHintsWidget_1.ID;
        }
        updateMaxHeight() {
            if (!this.domNodes) {
                return;
            }
            const height = Math.max(this.editor.getLayoutInfo().height / 4, 250);
            const maxHeight = `${height}px`;
            this.domNodes.element.style.maxHeight = maxHeight;
            const wrapper = this.domNodes.element.getElementsByClassName('phwrapper');
            if (wrapper.length) {
                wrapper[0].style.maxHeight = maxHeight;
            }
        }
    };
    exports.ParameterHintsWidget = ParameterHintsWidget;
    exports.ParameterHintsWidget = ParameterHintsWidget = ParameterHintsWidget_1 = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, opener_1.IOpenerService),
        __param(4, language_1.ILanguageService)
    ], ParameterHintsWidget);
    (0, colorRegistry_1.registerColor)('editorHoverWidget.highlightForeground', { dark: colorRegistry_1.listHighlightForeground, light: colorRegistry_1.listHighlightForeground, hcDark: colorRegistry_1.listHighlightForeground, hcLight: colorRegistry_1.listHighlightForeground }, nls.localize('editorHoverWidgetHighlightForeground', 'Foreground color of the active item in the parameter hint.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVySGludHNXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9wYXJhbWV0ZXJIaW50cy9icm93c2VyL3BhcmFtZXRlckhpbnRzV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBTSxzQkFBc0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsc0JBQXNCLEVBQUUsa0JBQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUM7SUFDdkssTUFBTSwwQkFBMEIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsMEJBQTBCLEVBQUUsa0JBQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDLENBQUM7SUFFOUssSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTs7aUJBRTNCLE9BQUUsR0FBRyxvQ0FBb0MsQUFBdkMsQ0FBd0M7UUFxQmxFLFlBQ2tCLE1BQW1CLEVBQ25CLEtBQTBCLEVBQ3ZCLGlCQUFxQyxFQUN6QyxhQUE2QixFQUMzQixlQUFpQztZQUVuRCxLQUFLLEVBQUUsQ0FBQztZQU5TLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDbkIsVUFBSyxHQUFMLEtBQUssQ0FBcUI7WUFwQjNCLHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQVlwRSxZQUFPLEdBQVksS0FBSyxDQUFDO1lBQ3pCLG1CQUFjLEdBQWtCLElBQUksQ0FBQztZQUU3Qyw0Q0FBNEM7WUFDNUMsd0JBQW1CLEdBQUcsSUFBSSxDQUFD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