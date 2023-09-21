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
define(["require", "exports", "vs/base/common/async", "vs/base/common/htmlContent", "vs/editor/common/core/position", "vs/editor/common/model/textModel", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/editor/contrib/hover/browser/getHover", "vs/editor/contrib/hover/browser/markdownHoverParticipant", "vs/editor/contrib/inlayHints/browser/inlayHintsController", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/editor/common/services/languageFeatures", "vs/nls", "vs/base/common/platform", "vs/editor/contrib/inlayHints/browser/inlayHints", "vs/base/common/arrays"], function (require, exports, async_1, htmlContent_1, position_1, textModel_1, hoverTypes_1, language_1, resolverService_1, getHover_1, markdownHoverParticipant_1, inlayHintsController_1, configuration_1, opener_1, languageFeatures_1, nls_1, platform, inlayHints_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlayHintsHover = void 0;
    class InlayHintsHoverAnchor extends hoverTypes_1.HoverForeignElementAnchor {
        constructor(part, owner, initialMousePosX, initialMousePosY) {
            super(10, owner, part.item.anchor.range, initialMousePosX, initialMousePosY, true);
            this.part = part;
        }
    }
    let InlayHintsHover = class InlayHintsHover extends markdownHoverParticipant_1.MarkdownHoverParticipant {
        constructor(editor, languageService, openerService, configurationService, _resolverService, languageFeaturesService) {
            super(editor, languageService, openerService, configurationService, languageFeaturesService);
            this._resolverService = _resolverService;
            this.hoverOrdinal = 6;
        }
        suggestHoverAnchor(mouseEvent) {
            const controller = inlayHintsController_1.InlayHintsController.get(this._editor);
            if (!controller) {
                return null;
            }
            if (mouseEvent.target.type !== 6 /* MouseTargetType.CONTENT_TEXT */) {
                return null;
            }
            const options = mouseEvent.target.detail.injectedText?.options;
            if (!(options instanceof textModel_1.ModelDecorationInjectedTextOptions && options.attachedData instanceof inlayHintsController_1.RenderedInlayHintLabelPart)) {
                return null;
            }
            return new InlayHintsHoverAnchor(options.attachedData, this, mouseEvent.event.posx, mouseEvent.event.posy);
        }
        computeSync() {
            return [];
        }
        computeAsync(anchor, _lineDecorations, token) {
            if (!(anchor instanceof InlayHintsHoverAnchor)) {
                return async_1.AsyncIterableObject.EMPTY;
            }
            return new async_1.AsyncIterableObject(async (executor) => {
                const { part } = anchor;
                await part.item.resolve(token);
                if (token.isCancellationRequested) {
                    return;
                }
                // (1) Inlay Tooltip
                let itemTooltip;
                if (typeof part.item.hint.tooltip === 'string') {
                    itemTooltip = new htmlContent_1.MarkdownString().appendText(part.item.hint.tooltip);
                }
                else if (part.item.hint.tooltip) {
                    itemTooltip = part.item.hint.tooltip;
                }
                if (itemTooltip) {
                    executor.emitOne(new markdownHoverParticipant_1.MarkdownHover(this, anchor.range, [itemTooltip], false, 0));
                }
                // (1.2) Inlay dbl-click gesture
                if ((0, arrays_1.isNonEmptyArray)(part.item.hint.textEdits)) {
                    executor.emitOne(new markdownHoverParticipant_1.MarkdownHover(this, anchor.range, [new htmlContent_1.MarkdownString().appendText((0, nls_1.localize)('hint.dbl', "Double-click to insert"))], false, 10001));
                }
                // (2) Inlay Label Part Tooltip
                let partTooltip;
                if (typeof part.part.tooltip === 'string') {
                    partTooltip = new htmlContent_1.MarkdownString().appendText(part.part.tooltip);
                }
                else if (part.part.tooltip) {
                    partTooltip = part.part.tooltip;
                }
                if (partTooltip) {
                    executor.emitOne(new markdownHoverParticipant_1.MarkdownHover(this, anchor.range, [partTooltip], false, 1));
                }
                // (2.2) Inlay Label Part Help Hover
                if (part.part.location || part.part.command) {
                    let linkHint;
                    const useMetaKey = this._editor.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey';
                    const kb = useMetaKey
                        ? platform.isMacintosh
                            ? (0, nls_1.localize)('links.navigate.kb.meta.mac', "cmd + click")
                            : (0, nls_1.localize)('links.navigate.kb.meta', "ctrl + click")
                        : platform.isMacintosh
                            ? (0, nls_1.localize)('links.navigate.kb.alt.mac', "option + click")
                            : (0, nls_1.localize)('links.navigate.kb.alt', "alt + click");
                    if (part.part.location && part.part.command) {
                        linkHint = new htmlContent_1.MarkdownString().appendText((0, nls_1.localize)('hint.defAndCommand', 'Go to Definition ({0}), right click for more', kb));
                    }
                    else if (part.part.location) {
                        linkHint = new htmlContent_1.MarkdownString().appendText((0, nls_1.localize)('hint.def', 'Go to Definition ({0})', kb));
                    }
                    else if (part.part.command) {
                        linkHint = new htmlContent_1.MarkdownString(`[${(0, nls_1.localize)('hint.cmd', "Execute Command")}](${(0, inlayHints_1.asCommandLink)(part.part.command)} "${part.part.command.title}") (${kb})`, { isTrusted: true });
                    }
                    if (linkHint) {
                        executor.emitOne(new markdownHoverParticipant_1.MarkdownHover(this, anchor.range, [linkHint], false, 10000));
                    }
                }
                // (3) Inlay Label Part Location tooltip
                const iterable = await this._resolveInlayHintLabelPartHover(part, token);
                for await (const item of iterable) {
                    executor.emitOne(item);
                }
            });
        }
        async _resolveInlayHintLabelPartHover(part, token) {
            if (!part.part.location) {
                return async_1.AsyncIterableObject.EMPTY;
            }
            const { uri, range } = part.part.location;
            const ref = await this._resolverService.createModelReference(uri);
            try {
                const model = ref.object.textEditorModel;
                if (!this._languageFeaturesService.hoverProvider.has(model)) {
                    return async_1.AsyncIterableObject.EMPTY;
                }
                return (0, getHover_1.getHover)(this._languageFeaturesService.hoverProvider, model, new position_1.Position(range.startLineNumber, range.startColumn), token)
                    .filter(item => !(0, htmlContent_1.isEmptyMarkdownString)(item.hover.contents))
                    .map(item => new markdownHoverParticipant_1.MarkdownHover(this, part.item.anchor.range, item.hover.contents, false, 2 + item.ordinal));
            }
            finally {
                ref.dispose();
            }
        }
    };
    exports.InlayHintsHover = InlayHintsHover;
    exports.InlayHintsHover = InlayHintsHover = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, opener_1.IOpenerService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, languageFeatures_1.ILanguageFeaturesService)
    ], InlayHintsHover);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5sYXlIaW50c0hvdmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5sYXlIaW50cy9icm93c2VyL2lubGF5SGludHNIb3Zlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QmhHLE1BQU0scUJBQXNCLFNBQVEsc0NBQXlCO1FBQzVELFlBQ1UsSUFBZ0MsRUFDekMsS0FBc0IsRUFDdEIsZ0JBQW9DLEVBQ3BDLGdCQUFvQztZQUVwQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFMMUUsU0FBSSxHQUFKLElBQUksQ0FBNEI7UUFNMUMsQ0FBQztLQUNEO0lBRU0sSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSxtREFBd0I7UUFJNUQsWUFDQyxNQUFtQixFQUNELGVBQWlDLEVBQ25DLGFBQTZCLEVBQ3RCLG9CQUEyQyxFQUMvQyxnQkFBb0QsRUFDN0MsdUJBQWlEO1lBRTNFLEtBQUssQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1lBSHpELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFQL0MsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFXbEQsQ0FBQztRQUVELGtCQUFrQixDQUFDLFVBQTZCO1lBQy9DLE1BQU0sVUFBVSxHQUFHLDJDQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLHlD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