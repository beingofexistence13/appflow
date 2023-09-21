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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsHintsWidget", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry"], function (require, exports, dom, htmlContent_1, lifecycle_1, observable_1, range_1, language_1, hoverTypes_1, inlineCompletionsController_1, inlineCompletionsHintsWidget_1, markdownRenderer_1, nls, accessibility_1, instantiation_1, opener_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionsHoverParticipant = exports.InlineCompletionsHover = void 0;
    class InlineCompletionsHover {
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
    exports.InlineCompletionsHover = InlineCompletionsHover;
    let InlineCompletionsHoverParticipant = class InlineCompletionsHoverParticipant {
        constructor(_editor, _languageService, _openerService, accessibilityService, _instantiationService, _telemetryService) {
            this._editor = _editor;
            this._languageService = _languageService;
            this._openerService = _openerService;
            this.accessibilityService = accessibilityService;
            this._instantiationService = _instantiationService;
            this._telemetryService = _telemetryService;
            this.hoverOrdinal = 4;
        }
        suggestHoverAnchor(mouseEvent) {
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(this._editor);
            if (!controller) {
                return null;
            }
            const target = mouseEvent.target;
            if (target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */) {
                // handle the case where the mouse is over the view zone
                const viewZoneData = target.detail;
                if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
                    return new hoverTypes_1.HoverForeignElementAnchor(1000, this, range_1.Range.fromPositions(this._editor.getModel().validatePosition(viewZoneData.positionBefore || viewZoneData.position)), mouseEvent.event.posx, mouseEvent.event.posy, false);
                }
            }
            if (target.type === 7 /* MouseTargetType.CONTENT_EMPTY */) {
                // handle the case where the mouse is over the empty portion of a line following ghost text
                if (controller.shouldShowHoverAt(target.range)) {
                    return new hoverTypes_1.HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
                }
            }
            if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
                // handle the case where the mouse is directly over ghost text
                const mightBeForeignElement = target.detail.mightBeForeignElement;
                if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
                    return new hoverTypes_1.HoverForeignElementAnchor(1000, this, target.range, mouseEvent.event.posx, mouseEvent.event.posy, false);
                }
            }
            return null;
        }
        computeSync(anchor, lineDecorations) {
            if (this._editor.getOption(62 /* EditorOption.inlineSuggest */).showToolbar === 'always') {
                return [];
            }
            const controller = inlineCompletionsController_1.InlineCompletionsController.get(this._editor);
            if (controller && controller.shouldShowHoverAt(anchor.range)) {
                return [new InlineCompletionsHover(this, anchor.range, controller)];
            }
            return [];
        }
        renderHoverParts(context, hoverParts) {
            const disposableStore = new lifecycle_1.DisposableStore();
            const part = hoverParts[0];
            this._telemetryService.publicLog2('inlineCompletionHover.shown');
            if (this.accessibilityService.isScreenReaderOptimized() && !this._editor.getOption(8 /* EditorOption.screenReaderAnnounceInlineSuggestion */)) {
                this.renderScreenReaderText(context, part, disposableStore);
            }
            const model = part.controller.model.get();
            const w = this._instantiationService.createInstance(inlineCompletionsHintsWidget_1.InlineSuggestionHintsContentWidget, this._editor, false, (0, observable_1.constObservable)(null), model.selectedInlineCompletionIndex, model.inlineCompletionsCount, model.selectedInlineCompletion.map(v => v?.inlineCompletion.source.inlineCompletions.commands ?? []));
            context.fragment.appendChild(w.getDomNode());
            model.triggerExplicitly();
            disposableStore.add(w);
            return disposableStore;
        }
        renderScreenReaderText(context, part, disposableStore) {
            const $ = dom.$;
            const markdownHoverElement = $('div.hover-row.markdown-hover');
            const hoverContentsElement = dom.append(markdownHoverElement, $('div.hover-contents', { ['aria-live']: 'assertive' }));
            const renderer = disposableStore.add(new markdownRenderer_1.MarkdownRenderer({ editor: this._editor }, this._languageService, this._openerService));
            const render = (code) => {
                disposableStore.add(renderer.onDidRenderAsync(() => {
                    hoverContentsElement.className = 'hover-contents code-hover-contents';
                    context.onContentsChanged();
                }));
                const inlineSuggestionAvailable = nls.localize('inlineSuggestionFollows', "Suggestion:");
                const renderedContents = disposableStore.add(renderer.render(new htmlContent_1.MarkdownString().appendText(inlineSuggestionAvailable).appendCodeblock('text', code)));
                hoverContentsElement.replaceChildren(renderedContents.element);
            };
            disposableStore.add((0, observable_1.autorun)(reader => {
                /** @description update hover */
                const ghostText = part.controller.model.read(reader)?.ghostText.read(reader);
                if (ghostText) {
                    const lineText = this._editor.getModel().getLineContent(ghostText.lineNumber);
                    render(ghostText.renderForScreenReader(lineText));
                }
                else {
                    dom.reset(hoverContentsElement);
                }
            }));
            context.fragment.appendChild(markdownHoverElement);
        }
    };
    exports.InlineCompletionsHoverParticipant = InlineCompletionsHoverParticipant;
    exports.InlineCompletionsHoverParticipant = InlineCompletionsHoverParticipant = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, opener_1.IOpenerService),
        __param(3, accessibility_1.IAccessibilityService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, telemetry_1.ITelemetryService)
    ], InlineCompletionsHoverParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJQYXJ0aWNpcGFudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL2Jyb3dzZXIvaG92ZXJQYXJ0aWNpcGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFxQmhHLE1BQWEsc0JBQXNCO1FBQ2xDLFlBQ2lCLEtBQXNELEVBQ3RELEtBQVksRUFDWixVQUF1QztZQUZ2QyxVQUFLLEdBQUwsS0FBSyxDQUFpRDtZQUN0RCxVQUFLLEdBQUwsS0FBSyxDQUFPO1lBQ1osZUFBVSxHQUFWLFVBQVUsQ0FBNkI7UUFDcEQsQ0FBQztRQUVFLHFCQUFxQixDQUFDLE1BQW1CO1lBQy9DLE9BQU8sQ0FDTixNQUFNLENBQUMsSUFBSSxrQ0FBMEI7bUJBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVzttQkFDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQ2pELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFkRCx3REFjQztJQUVNLElBQU0saUNBQWlDLEdBQXZDLE1BQU0saUNBQWlDO1FBSTdDLFlBQ2tCLE9BQW9CLEVBQ25CLGdCQUFtRCxFQUNyRCxjQUErQyxFQUN4QyxvQkFBNEQsRUFDNUQscUJBQTZELEVBQ2pFLGlCQUFxRDtZQUx2RCxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQ0YscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNwQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDdkIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUMzQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2hELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFSekQsaUJBQVksR0FB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