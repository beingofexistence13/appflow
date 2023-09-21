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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls!vs/editor/contrib/inlineCompletions/browser/hoverParticipant", "vs/platform/accessibility/common/accessibility", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry"], function (require, exports, dom, htmlContent_1, lifecycle_1, observable_1, range_1, language_1, hoverTypes_1, inlineCompletionsController_1, inlineCompletionsHintsWidget_1, markdownRenderer_1, nls, accessibility_1, instantiation_1, opener_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$68 = exports.$58 = void 0;
    class $58 {
        constructor(owner, range, controller) {
            this.owner = owner;
            this.range = range;
            this.controller = controller;
        }
        isValidForHoverAnchor(anchor) {
            return (anchor.type === 1 /* HoverAnchorType.Range */
                && this.range.startColumn <= anchor.range.startColumn
                && this.range.endColumn >= anchor.range.endColumn);
        }
    }
    exports.$58 = $58;
    let $68 = class $68 {
        constructor(a, b, c, d, e, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.hoverOrdinal = 4;
        }
        suggestHoverAnchor(mouseEvent) {
            const controller = inlineCompletionsController_1.$V8.get(this.a);
            if (!controller) {
                return null;
            }
            const target = mouseEvent.target;
            if (target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */) {
                // handle the case where the mouse is over the view zone
                const viewZoneData = target.detail;
                if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
                    return new hoverTypes_1.$i3(1000, this, range_1.$ks.fromPositions(this.a.getModel().validatePosition(viewZoneData.positionBefore || viewZoneData.position)), mouseEvent.event.posx, mouseEvent.event.posy, false);
                }
            }
            if (target.type === 7 /* MouseTargetType.CONTENT_EMPTY */) {
                // handle the case where the mouse is over the empty portion of a line following ghost text
                if (controller.shouldShowHoverAt(target.range)) {
                    return new hoverTypes_1.$i3(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
                }
            }
            if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                // handle the case where the mouse is directly over ghost text
                const mightBeForeignElement = target.detail.mightBeForeignElement;
                if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
                    return new hoverTypes_1.$i3(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
                }
            }
            return null;
        }
        computeSync(anchor, lineDecorations) {
            if (this.a.getOption(62 /* EditorOption.inlineSuggest */).showToolbar === 'always') {
                return [];
            }
            const controller = inlineCompletionsController_1.$V8.get(this.a);
            if (controller && controller.shouldShowHoverAt(anchor.range)) {
                return [new $58(this, anchor.range, controller)];
            }
            return [];
        }
        renderHoverParts(context, hoverParts) {
            const disposableStore = new lifecycle_1.$jc();
            const part = hoverParts[0];
            this.f.publicLog2('inlineCompletionHover.shown');
            if (this.d.isScreenReaderOptimized() && !this.a.getOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */)) {
                this.g(context, part, disposableStore);
            }
            const model = part.controller.model.get();
            const w = this.e.createInstance(inlineCompletionsHintsWidget_1.$O6, this.a, false, (0, observable_1.constObservable)(null), model.selectedInlineCompletionIndex, model.inlineCompletionsCount, model.selectedInlineCompletion.map(v => v?.inlineCompletion.source.inlineCompletions.commands ?? []));
            context.fragment.appendChild(w.getDomNode());
            model.triggerExplicitly();
            disposableStore.add(w);
            return disposableStore;
        }
        g(context, part, disposableStore) {
            const $ = dom.$;
            const markdownHoverElement = $('div.hover-row.markdown-hover');
            const hoverContentsElement = dom.$0O(markdownHoverElement, $('div.hover-contents', { ['aria-live']: 'assertive' }));
            const renderer = disposableStore.add(new markdownRenderer_1.$K2({ editor: this.a }, this.b, this.c));
            const render = (code) => {
                disposableStore.add(renderer.onDidRenderAsync(() => {
                    hoverContentsElement.className = 'hover-contents code-hover-contents';
                    context.onContentsChanged();
                }));
                const inlineSuggestionAvailable = nls.localize(0, null);
                const renderedContents = disposableStore.add(renderer.render(new htmlContent_1.$Xj().appendText(inlineSuggestionAvailable).appendCodeblock('text', code)));
                hoverContentsElement.replaceChildren(renderedContents.element);
            };
            disposableStore.add((0, observable_1.autorun)(reader => {
                /** @description update hover */
                const ghostText = part.controller.model.read(reader)?.ghostText.read(reader);
                if (ghostText) {
                    const lineText = this.a.getModel().getLineContent(ghostText.lineNumber);
                    render(ghostText.renderForScreenReader(lineText));
                }
                else {
                    dom.$_O(hoverContentsElement);
                }
            }));
            context.fragment.appendChild(markdownHoverElement);
        }
    };
    exports.$68 = $68;
    exports.$68 = $68 = __decorate([
        __param(1, language_1.$ct),
        __param(2, opener_1.$NT),
        __param(3, accessibility_1.$1r),
        __param(4, instantiation_1.$Ah),
        __param(5, telemetry_1.$9k)
    ], $68);
});
//# sourceMappingURL=hoverParticipant.js.map