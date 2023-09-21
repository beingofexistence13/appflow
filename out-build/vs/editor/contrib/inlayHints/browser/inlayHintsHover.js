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
define(["require", "exports", "vs/base/common/async", "vs/base/common/htmlContent", "vs/editor/common/core/position", "vs/editor/common/model/textModel", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/editor/contrib/hover/browser/getHover", "vs/editor/contrib/hover/browser/markdownHoverParticipant", "vs/editor/contrib/inlayHints/browser/inlayHintsController", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/editor/common/services/languageFeatures", "vs/nls!vs/editor/contrib/inlayHints/browser/inlayHintsHover", "vs/base/common/platform", "vs/editor/contrib/inlayHints/browser/inlayHints", "vs/base/common/arrays"], function (require, exports, async_1, htmlContent_1, position_1, textModel_1, hoverTypes_1, language_1, resolverService_1, getHover_1, markdownHoverParticipant_1, inlayHintsController_1, configuration_1, opener_1, languageFeatures_1, nls_1, platform, inlayHints_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$s9 = void 0;
    class InlayHintsHoverAnchor extends hoverTypes_1.$i3 {
        constructor(part, owner, initialMousePosX, initialMousePosY) {
            super(10, owner, part.item.anchor.range, initialMousePosX, initialMousePosY, true);
            this.part = part;
        }
    }
    let $s9 = class $s9 extends markdownHoverParticipant_1.$04 {
        constructor(editor, languageService, openerService, configurationService, i, languageFeaturesService) {
            super(editor, languageService, openerService, configurationService, languageFeaturesService);
            this.i = i;
            this.hoverOrdinal = 6;
        }
        suggestHoverAnchor(mouseEvent) {
            const controller = inlayHintsController_1.$r9.get(this.c);
            if (!controller) {
                return null;
            }
            if (mouseEvent.target.type !== 6 /* MouseTargetType.CONTENT_TEXT */) {
                return null;
            }
            const options = mouseEvent.target.detail.injectedText?.options;
            if (!(options instanceof textModel_1.$QC && options.attachedData instanceof inlayHintsController_1.$q9)) {
                return null;
            }
            return new InlayHintsHoverAnchor(options.attachedData, this, mouseEvent.event.posx, mouseEvent.event.posy);
        }
        computeSync() {
            return [];
        }
        computeAsync(anchor, _lineDecorations, token) {
            if (!(anchor instanceof InlayHintsHoverAnchor)) {
                return async_1.$3g.EMPTY;
            }
            return new async_1.$3g(async (executor) => {
                const { part } = anchor;
                await part.item.resolve(token);
                if (token.isCancellationRequested) {
                    return;
                }
                // (1) Inlay Tooltip
                let itemTooltip;
                if (typeof part.item.hint.tooltip === 'string') {
                    itemTooltip = new htmlContent_1.$Xj().appendText(part.item.hint.tooltip);
                }
                else if (part.item.hint.tooltip) {
                    itemTooltip = part.item.hint.tooltip;
                }
                if (itemTooltip) {
                    executor.emitOne(new markdownHoverParticipant_1.$94(this, anchor.range, [itemTooltip], false, 0));
                }
                // (1.2) Inlay dbl-click gesture
                if ((0, arrays_1.$Jb)(part.item.hint.textEdits)) {
                    executor.emitOne(new markdownHoverParticipant_1.$94(this, anchor.range, [new htmlContent_1.$Xj().appendText((0, nls_1.localize)(0, null))], false, 10001));
                }
                // (2) Inlay Label Part Tooltip
                let partTooltip;
                if (typeof part.part.tooltip === 'string') {
                    partTooltip = new htmlContent_1.$Xj().appendText(part.part.tooltip);
                }
                else if (part.part.tooltip) {
                    partTooltip = part.part.tooltip;
                }
                if (partTooltip) {
                    executor.emitOne(new markdownHoverParticipant_1.$94(this, anchor.range, [partTooltip], false, 1));
                }
                // (2.2) Inlay Label Part Help Hover
                if (part.part.location || part.part.command) {
                    let linkHint;
                    const useMetaKey = this.c.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey';
                    const kb = useMetaKey
                        ? platform.$j
                            ? (0, nls_1.localize)(1, null)
                            : (0, nls_1.localize)(2, null)
                        : platform.$j
                            ? (0, nls_1.localize)(3, null)
                            : (0, nls_1.localize)(4, null);
                    if (part.part.location && part.part.command) {
                        linkHint = new htmlContent_1.$Xj().appendText((0, nls_1.localize)(5, null, kb));
                    }
                    else if (part.part.location) {
                        linkHint = new htmlContent_1.$Xj().appendText((0, nls_1.localize)(6, null, kb));
                    }
                    else if (part.part.command) {
                        linkHint = new htmlContent_1.$Xj(`[${(0, nls_1.localize)(7, null)}](${(0, inlayHints_1.$n9)(part.part.command)} "${part.part.command.title}") (${kb})`, { isTrusted: true });
                    }
                    if (linkHint) {
                        executor.emitOne(new markdownHoverParticipant_1.$94(this, anchor.range, [linkHint], false, 10000));
                    }
                }
                // (3) Inlay Label Part Location tooltip
                const iterable = await this.j(part, token);
                for await (const item of iterable) {
                    executor.emitOne(item);
                }
            });
        }
        async j(part, token) {
            if (!part.part.location) {
                return async_1.$3g.EMPTY;
            }
            const { uri, range } = part.part.location;
            const ref = await this.i.createModelReference(uri);
            try {
                const model = ref.object.textEditorModel;
                if (!this.h.hoverProvider.has(model)) {
                    return async_1.$3g.EMPTY;
                }
                return (0, getHover_1.$74)(this.h.hoverProvider, model, new position_1.$js(range.startLineNumber, range.startColumn), token)
                    .filter(item => !(0, htmlContent_1.$Yj)(item.hover.contents))
                    .map(item => new markdownHoverParticipant_1.$94(this, part.item.anchor.range, item.hover.contents, false, 2 + item.ordinal));
            }
            finally {
                ref.dispose();
            }
        }
    };
    exports.$s9 = $s9;
    exports.$s9 = $s9 = __decorate([
        __param(1, language_1.$ct),
        __param(2, opener_1.$NT),
        __param(3, configuration_1.$8h),
        __param(4, resolverService_1.$uA),
        __param(5, languageFeatures_1.$hF)
    ], $s9);
});
//# sourceMappingURL=inlayHintsHover.js.map