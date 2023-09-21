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
define(["require", "exports", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorOptions", "vs/editor/common/model/textModel", "vs/editor/common/services/unicodeTextModelHighlighter", "vs/editor/common/services/editorWorker", "vs/editor/common/languages/language", "vs/editor/common/viewModel/viewModelDecorations", "vs/editor/contrib/hover/browser/hoverTypes", "vs/editor/contrib/hover/browser/markdownHoverParticipant", "vs/editor/contrib/unicodeHighlighter/browser/bannerController", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/theme/common/iconRegistry", "vs/platform/workspace/common/workspaceTrust", "vs/css!./unicodeHighlighter"], function (require, exports, async_1, codicons_1, htmlContent_1, lifecycle_1, platform, strings_1, editorExtensions_1, editorOptions_1, textModel_1, unicodeTextModelHighlighter_1, editorWorker_1, language_1, viewModelDecorations_1, hoverTypes_1, markdownHoverParticipant_1, bannerController_1, nls, configuration_1, instantiation_1, opener_1, quickInput_1, iconRegistry_1, workspaceTrust_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowExcludeOptions = exports.DisableHighlightingOfNonBasicAsciiCharactersAction = exports.DisableHighlightingOfInvisibleCharactersAction = exports.DisableHighlightingOfAmbiguousCharactersAction = exports.DisableHighlightingInStringsAction = exports.DisableHighlightingInCommentsAction = exports.UnicodeHighlighterHoverParticipant = exports.UnicodeHighlighterHover = exports.UnicodeHighlighter = exports.warningIcon = void 0;
    exports.warningIcon = (0, iconRegistry_1.registerIcon)('extensions-warning-message', codicons_1.Codicon.warning, nls.localize('warningIcon', 'Icon shown with a warning message in the extensions editor.'));
    let UnicodeHighlighter = class UnicodeHighlighter extends lifecycle_1.Disposable {
        static { this.ID = 'editor.contrib.unicodeHighlighter'; }
        constructor(_editor, _editorWorkerService, _workspaceTrustService, instantiationService) {
            super();
            this._editor = _editor;
            this._editorWorkerService = _editorWorkerService;
            this._workspaceTrustService = _workspaceTrustService;
            this._highlighter = null;
            this._bannerClosed = false;
            this._updateState = (state) => {
                if (state && state.hasMore) {
                    if (this._bannerClosed) {
                        return;
                    }
                    // This document contains many non-basic ASCII characters.
                    const max = Math.max(state.ambiguousCharacterCount, state.nonBasicAsciiCharacterCount, state.invisibleCharacterCount);
                    let data;
                    if (state.nonBasicAsciiCharacterCount >= max) {
                        data = {
                            message: nls.localize('unicodeHighlighting.thisDocumentHasManyNonBasicAsciiUnicodeCharacters', 'This document contains many non-basic ASCII unicode characters'),
                            command: new DisableHighlightingOfNonBasicAsciiCharactersAction(),
                        };
                    }
                    else if (state.ambiguousCharacterCount >= max) {
                        data = {
                            message: nls.localize('unicodeHighlighting.thisDocumentHasManyAmbiguousUnicodeCharacters', 'This document contains many ambiguous unicode characters'),
                            command: new DisableHighlightingOfAmbiguousCharactersAction(),
                        };
                    }
                    else if (state.invisibleCharacterCount >= max) {
                        data = {
                            message: nls.localize('unicodeHighlighting.thisDocumentHasManyInvisibleUnicodeCharacters', 'This document contains many invisible unicode characters'),
                            command: new DisableHighlightingOfInvisibleCharactersAction(),
                        };
                    }
                    else {
                        throw new Error('Unreachable');
                    }
                    this._bannerController.show({
                        id: 'unicodeHighlightBanner',
                        message: data.message,
                        icon: exports.warningIcon,
                        actions: [
                            {
                                label: data.command.shortLabel,
                                href: `command:${data.command.id}`
                            }
                        ],
                        onClose: () => {
                            this._bannerClosed = true;
                        },
                    });
                }
                else {
                    this._bannerController.hide();
                }
            };
            this._bannerController = this._register(instantiationService.createInstance(bannerController_1.BannerController, _editor));
            this._register(this._editor.onDidChangeModel(() => {
                this._bannerClosed = false;
                this._updateHighlighter();
            }));
            this._options = _editor.getOption(124 /* EditorOption.unicodeHighlighting */);
            this._register(_workspaceTrustService.onDidChangeTrust(e => {
                this._updateHighlighter();
            }));
            this._register(_editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(124 /* EditorOption.unicodeHighlighting */)) {
                    this._options = _editor.getOption(124 /* EditorOption.unicodeHighlighting */);
                    this._updateHighlighter();
                }
            }));
            this._updateHighlighter();
        }
        dispose() {
            if (this._highlighter) {
                this._highlighter.dispose();
                this._highlighter = null;
            }
            super.dispose();
        }
        _updateHighlighter() {
            this._updateState(null);
            if (this._highlighter) {
                this._highlighter.dispose();
                this._highlighter = null;
            }
            if (!this._editor.hasModel()) {
                return;
            }
            const options = resolveOptions(this._workspaceTrustService.isWorkspaceTrusted(), this._options);
            if ([
                options.nonBasicASCII,
                options.ambiguousCharacters,
                options.invisibleCharacters,
            ].every((option) => option === false)) {
                // Don't do anything if the feature is fully disabled
                return;
            }
            const highlightOptions = {
                nonBasicASCII: options.nonBasicASCII,
                ambiguousCharacters: options.ambiguousCharacters,
                invisibleCharacters: options.invisibleCharacters,
                includeComments: options.includeComments,
                includeStrings: options.includeStrings,
                allowedCodePoints: Object.keys(options.allowedCharacters).map(c => c.codePointAt(0)),
                allowedLocales: Object.keys(options.allowedLocales).map(locale => {
                    if (locale === '_os') {
                        const osLocale = new Intl.NumberFormat().resolvedOptions().locale;
                        return osLocale;
                    }
                    else if (locale === '_vscode') {
                        return platform.language;
                    }
                    return locale;
                }),
            };
            if (this._editorWorkerService.canComputeUnicodeHighlights(this._editor.getModel().uri)) {
                this._highlighter = new DocumentUnicodeHighlighter(this._editor, highlightOptions, this._updateState, this._editorWorkerService);
            }
            else {
                this._highlighter = new ViewportUnicodeHighlighter(this._editor, highlightOptions, this._updateState);
            }
        }
        getDecorationInfo(decoration) {
            if (this._highlighter) {
                return this._highlighter.getDecorationInfo(decoration);
            }
            return null;
        }
    };
    exports.UnicodeHighlighter = UnicodeHighlighter;
    exports.UnicodeHighlighter = UnicodeHighlighter = __decorate([
        __param(1, editorWorker_1.IEditorWorkerService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, instantiation_1.IInstantiationService)
    ], UnicodeHighlighter);
    function resolveOptions(trusted, options) {
        return {
            nonBasicASCII: options.nonBasicASCII === editorOptions_1.inUntrustedWorkspace ? !trusted : options.nonBasicASCII,
            ambiguousCharacters: options.ambiguousCharacters,
            invisibleCharacters: options.invisibleCharacters,
            includeComments: options.includeComments === editorOptions_1.inUntrustedWorkspace ? !trusted : options.includeComments,
            includeStrings: options.includeStrings === editorOptions_1.inUntrustedWorkspace ? !trusted : options.includeStrings,
            allowedCharacters: options.allowedCharacters,
            allowedLocales: options.allowedLocales,
        };
    }
    let DocumentUnicodeHighlighter = class DocumentUnicodeHighlighter extends lifecycle_1.Disposable {
        constructor(_editor, _options, _updateState, _editorWorkerService) {
            super();
            this._editor = _editor;
            this._options = _options;
            this._updateState = _updateState;
            this._editorWorkerService = _editorWorkerService;
            this._model = this._editor.getModel();
            this._decorations = this._editor.createDecorationsCollection();
            this._updateSoon = this._register(new async_1.RunOnceScheduler(() => this._update(), 250));
            this._register(this._editor.onDidChangeModelContent(() => {
                this._updateSoon.schedule();
            }));
            this._updateSoon.schedule();
        }
        dispose() {
            this._decorations.clear();
            super.dispose();
        }
        _update() {
            if (this._model.isDisposed()) {
                return;
            }
            if (!this._model.mightContainNonBasicASCII()) {
                this._decorations.clear();
                return;
            }
            const modelVersionId = this._model.getVersionId();
            this._editorWorkerService
                .computedUnicodeHighlights(this._model.uri, this._options)
                .then((info) => {
                if (this._model.isDisposed()) {
                    return;
                }
                if (this._model.getVersionId() !== modelVersionId) {
                    // model changed in the meantime
                    return;
                }
                this._updateState(info);
                const decorations = [];
                if (!info.hasMore) {
                    // Don't show decoration if there are too many.
                    // In this case, a banner is shown.
                    for (const range of info.ranges) {
                        decorations.push({
                            range: range,
                            options: Decorations.instance.getDecorationFromOptions(this._options),
                        });
                    }
                }
                this._decorations.set(decorations);
            });
        }
        getDecorationInfo(decoration) {
            if (!this._decorations.has(decoration)) {
                return null;
            }
            const model = this._editor.getModel();
            if (!(0, viewModelDecorations_1.isModelDecorationVisible)(model, decoration)) {
                return null;
            }
            const text = model.getValueInRange(decoration.range);
            return {
                reason: computeReason(text, this._options),
                inComment: (0, viewModelDecorations_1.isModelDecorationInComment)(model, decoration),
                inString: (0, viewModelDecorations_1.isModelDecorationInString)(model, decoration),
            };
        }
    };
    DocumentUnicodeHighlighter = __decorate([
        __param(3, editorWorker_1.IEditorWorkerService)
    ], DocumentUnicodeHighlighter);
    class ViewportUnicodeHighlighter extends lifecycle_1.Disposable {
        constructor(_editor, _options, _updateState) {
            super();
            this._editor = _editor;
            this._options = _options;
            this._updateState = _updateState;
            this._model = this._editor.getModel();
            this._decorations = this._editor.createDecorationsCollection();
            this._updateSoon = this._register(new async_1.RunOnceScheduler(() => this._update(), 250));
            this._register(this._editor.onDidLayoutChange(() => {
                this._updateSoon.schedule();
            }));
            this._register(this._editor.onDidScrollChange(() => {
                this._updateSoon.schedule();
            }));
            this._register(this._editor.onDidChangeHiddenAreas(() => {
                this._updateSoon.schedule();
            }));
            this._register(this._editor.onDidChangeModelContent(() => {
                this._updateSoon.schedule();
            }));
            this._updateSoon.schedule();
        }
        dispose() {
            this._decorations.clear();
            super.dispose();
        }
        _update() {
            if (this._model.isDisposed()) {
                return;
            }
            if (!this._model.mightContainNonBasicASCII()) {
                this._decorations.clear();
                return;
            }
            const ranges = this._editor.getVisibleRanges();
            const decorations = [];
            const totalResult = {
                ranges: [],
                ambiguousCharacterCount: 0,
                invisibleCharacterCount: 0,
                nonBasicAsciiCharacterCount: 0,
                hasMore: false,
            };
            for (const range of ranges) {
                const result = unicodeTextModelHighlighter_1.UnicodeTextModelHighlighter.computeUnicodeHighlights(this._model, this._options, range);
                for (const r of result.ranges) {
                    totalResult.ranges.push(r);
                }
                totalResult.ambiguousCharacterCount += totalResult.ambiguousCharacterCount;
                totalResult.invisibleCharacterCount += totalResult.invisibleCharacterCount;
                totalResult.nonBasicAsciiCharacterCount += totalResult.nonBasicAsciiCharacterCount;
                totalResult.hasMore = totalResult.hasMore || result.hasMore;
            }
            if (!totalResult.hasMore) {
                // Don't show decorations if there are too many.
                // A banner will be shown instead.
                for (const range of totalResult.ranges) {
                    decorations.push({ range, options: Decorations.instance.getDecorationFromOptions(this._options) });
                }
            }
            this._updateState(totalResult);
            this._decorations.set(decorations);
        }
        getDecorationInfo(decoration) {
            if (!this._decorations.has(decoration)) {
                return null;
            }
            const model = this._editor.getModel();
            const text = model.getValueInRange(decoration.range);
            if (!(0, viewModelDecorations_1.isModelDecorationVisible)(model, decoration)) {
                return null;
            }
            return {
                reason: computeReason(text, this._options),
                inComment: (0, viewModelDecorations_1.isModelDecorationInComment)(model, decoration),
                inString: (0, viewModelDecorations_1.isModelDecorationInString)(model, decoration),
            };
        }
    }
    class UnicodeHighlighterHover {
        constructor(owner, range, decoration) {
            this.owner = owner;
            this.range = range;
            this.decoration = decoration;
        }
        isValidForHoverAnchor(anchor) {
            return (anchor.type === 1 /* HoverAnchorType.Range */
                && this.range.startColumn <= anchor.range.startColumn
                && this.range.endColumn >= anchor.range.endColumn);
        }
    }
    exports.UnicodeHighlighterHover = UnicodeHighlighterHover;
    let UnicodeHighlighterHoverParticipant = class UnicodeHighlighterHoverParticipant {
        constructor(_editor, _languageService, _openerService) {
            this._editor = _editor;
            this._languageService = _languageService;
            this._openerService = _openerService;
            this.hoverOrdinal = 5;
        }
        computeSync(anchor, lineDecorations) {
            if (!this._editor.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return [];
            }
            const model = this._editor.getModel();
            const unicodeHighlighter = this._editor.getContribution(UnicodeHighlighter.ID);
            if (!unicodeHighlighter) {
                return [];
            }
            const result = [];
            const existedReason = new Set();
            let index = 300;
            for (const d of lineDecorations) {
                const highlightInfo = unicodeHighlighter.getDecorationInfo(d);
                if (!highlightInfo) {
                    continue;
                }
                const char = model.getValueInRange(d.range);
                // text refers to a single character.
                const codePoint = char.codePointAt(0);
                const codePointStr = formatCodePointMarkdown(codePoint);
                let reason;
                switch (highlightInfo.reason.kind) {
                    case 0 /* UnicodeHighlighterReasonKind.Ambiguous */: {
                        if ((0, strings_1.isBasicASCII)(highlightInfo.reason.confusableWith)) {
                            reason = nls.localize('unicodeHighlight.characterIsAmbiguousASCII', 'The character {0} could be confused with the ASCII character {1}, which is more common in source code.', codePointStr, formatCodePointMarkdown(highlightInfo.reason.confusableWith.codePointAt(0)));
                        }
                        else {
                            reason = nls.localize('unicodeHighlight.characterIsAmbiguous', 'The character {0} could be confused with the character {1}, which is more common in source code.', codePointStr, formatCodePointMarkdown(highlightInfo.reason.confusableWith.codePointAt(0)));
                        }
                        break;
                    }
                    case 1 /* UnicodeHighlighterReasonKind.Invisible */:
                        reason = nls.localize('unicodeHighlight.characterIsInvisible', 'The character {0} is invisible.', codePointStr);
                        break;
                    case 2 /* UnicodeHighlighterReasonKind.NonBasicAscii */:
                        reason = nls.localize('unicodeHighlight.characterIsNonBasicAscii', 'The character {0} is not a basic ASCII character.', codePointStr);
                        break;
                }
                if (existedReason.has(reason)) {
                    continue;
                }
                existedReason.add(reason);
                const adjustSettingsArgs = {
                    codePoint: codePoint,
                    reason: highlightInfo.reason,
                    inComment: highlightInfo.inComment,
                    inString: highlightInfo.inString,
                };
                const adjustSettings = nls.localize('unicodeHighlight.adjustSettings', 'Adjust settings');
                const uri = `command:${ShowExcludeOptions.ID}?${encodeURIComponent(JSON.stringify(adjustSettingsArgs))}`;
                const markdown = new htmlContent_1.MarkdownString('', true)
                    .appendMarkdown(reason)
                    .appendText(' ')
                    .appendLink(uri, adjustSettings);
                result.push(new markdownHoverParticipant_1.MarkdownHover(this, d.range, [markdown], false, index++));
            }
            return result;
        }
        renderHoverParts(context, hoverParts) {
            return (0, markdownHoverParticipant_1.renderMarkdownHovers)(context, hoverParts, this._editor, this._languageService, this._openerService);
        }
    };
    exports.UnicodeHighlighterHoverParticipant = UnicodeHighlighterHoverParticipant;
    exports.UnicodeHighlighterHoverParticipant = UnicodeHighlighterHoverParticipant = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, opener_1.IOpenerService)
    ], UnicodeHighlighterHoverParticipant);
    function codePointToHex(codePoint) {
        return `U+${codePoint.toString(16).padStart(4, '0')}`;
    }
    function formatCodePointMarkdown(codePoint) {
        let value = `\`${codePointToHex(codePoint)}\``;
        if (!strings_1.InvisibleCharacters.isInvisibleCharacter(codePoint)) {
            // Don't render any control characters or any invisible characters, as they cannot be seen anyways.
            value += ` "${`${renderCodePointAsInlineCode(codePoint)}`}"`;
        }
        return value;
    }
    function renderCodePointAsInlineCode(codePoint) {
        if (codePoint === 96 /* CharCode.BackTick */) {
            return '`` ` ``';
        }
        return '`' + String.fromCodePoint(codePoint) + '`';
    }
    function computeReason(char, options) {
        return unicodeTextModelHighlighter_1.UnicodeTextModelHighlighter.computeUnicodeHighlightReason(char, options);
    }
    class Decorations {
        constructor() {
            this.map = new Map();
        }
        static { this.instance = new Decorations(); }
        getDecorationFromOptions(options) {
            return this.getDecoration(!options.includeComments, !options.includeStrings);
        }
        getDecoration(hideInComments, hideInStrings) {
            const key = `${hideInComments}${hideInStrings}`;
            let options = this.map.get(key);
            if (!options) {
                options = textModel_1.ModelDecorationOptions.createDynamic({
                    description: 'unicode-highlight',
                    stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
                    className: 'unicode-highlight',
                    showIfCollapsed: true,
                    overviewRuler: null,
                    minimap: null,
                    hideInCommentTokens: hideInComments,
                    hideInStringTokens: hideInStrings,
                });
                this.map.set(key, options);
            }
            return options;
        }
    }
    class DisableHighlightingInCommentsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingInComments'; }
        constructor() {
            super({
                id: DisableHighlightingOfAmbiguousCharactersAction.ID,
                label: nls.localize('action.unicodeHighlight.disableHighlightingInComments', 'Disable highlighting of characters in comments'),
                alias: 'Disable highlighting of characters in comments',
                precondition: undefined
            });
            this.shortLabel = nls.localize('unicodeHighlight.disableHighlightingInComments.shortLabel', 'Disable Highlight In Comments');
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.IConfigurationService);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.includeComments, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.DisableHighlightingInCommentsAction = DisableHighlightingInCommentsAction;
    class DisableHighlightingInStringsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingInStrings'; }
        constructor() {
            super({
                id: DisableHighlightingOfAmbiguousCharactersAction.ID,
                label: nls.localize('action.unicodeHighlight.disableHighlightingInStrings', 'Disable highlighting of characters in strings'),
                alias: 'Disable highlighting of characters in strings',
                precondition: undefined
            });
            this.shortLabel = nls.localize('unicodeHighlight.disableHighlightingInStrings.shortLabel', 'Disable Highlight In Strings');
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.IConfigurationService);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.includeStrings, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.DisableHighlightingInStringsAction = DisableHighlightingInStringsAction;
    class DisableHighlightingOfAmbiguousCharactersAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingOfAmbiguousCharacters'; }
        constructor() {
            super({
                id: DisableHighlightingOfAmbiguousCharactersAction.ID,
                label: nls.localize('action.unicodeHighlight.disableHighlightingOfAmbiguousCharacters', 'Disable highlighting of ambiguous characters'),
                alias: 'Disable highlighting of ambiguous characters',
                precondition: undefined
            });
            this.shortLabel = nls.localize('unicodeHighlight.disableHighlightingOfAmbiguousCharacters.shortLabel', 'Disable Ambiguous Highlight');
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.IConfigurationService);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.ambiguousCharacters, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.DisableHighlightingOfAmbiguousCharactersAction = DisableHighlightingOfAmbiguousCharactersAction;
    class DisableHighlightingOfInvisibleCharactersAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingOfInvisibleCharacters'; }
        constructor() {
            super({
                id: DisableHighlightingOfInvisibleCharactersAction.ID,
                label: nls.localize('action.unicodeHighlight.disableHighlightingOfInvisibleCharacters', 'Disable highlighting of invisible characters'),
                alias: 'Disable highlighting of invisible characters',
                precondition: undefined
            });
            this.shortLabel = nls.localize('unicodeHighlight.disableHighlightingOfInvisibleCharacters.shortLabel', 'Disable Invisible Highlight');
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.IConfigurationService);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.invisibleCharacters, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.DisableHighlightingOfInvisibleCharactersAction = DisableHighlightingOfInvisibleCharactersAction;
    class DisableHighlightingOfNonBasicAsciiCharactersAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters'; }
        constructor() {
            super({
                id: DisableHighlightingOfNonBasicAsciiCharactersAction.ID,
                label: nls.localize('action.unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters', 'Disable highlighting of non basic ASCII characters'),
                alias: 'Disable highlighting of non basic ASCII characters',
                precondition: undefined
            });
            this.shortLabel = nls.localize('unicodeHighlight.disableHighlightingOfNonBasicAsciiCharacters.shortLabel', 'Disable Non ASCII Highlight');
        }
        async run(accessor, editor, args) {
            const configurationService = accessor?.get(configuration_1.IConfigurationService);
            if (configurationService) {
                this.runAction(configurationService);
            }
        }
        async runAction(configurationService) {
            await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.nonBasicASCII, false, 2 /* ConfigurationTarget.USER */);
        }
    }
    exports.DisableHighlightingOfNonBasicAsciiCharactersAction = DisableHighlightingOfNonBasicAsciiCharactersAction;
    class ShowExcludeOptions extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.unicodeHighlight.showExcludeOptions'; }
        constructor() {
            super({
                id: ShowExcludeOptions.ID,
                label: nls.localize('action.unicodeHighlight.showExcludeOptions', "Show Exclude Options"),
                alias: 'Show Exclude Options',
                precondition: undefined
            });
        }
        async run(accessor, editor, args) {
            const { codePoint, reason, inString, inComment } = args;
            const char = String.fromCodePoint(codePoint);
            const quickPickService = accessor.get(quickInput_1.IQuickInputService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            function getExcludeCharFromBeingHighlightedLabel(codePoint) {
                if (strings_1.InvisibleCharacters.isInvisibleCharacter(codePoint)) {
                    return nls.localize('unicodeHighlight.excludeInvisibleCharFromBeingHighlighted', 'Exclude {0} (invisible character) from being highlighted', codePointToHex(codePoint));
                }
                return nls.localize('unicodeHighlight.excludeCharFromBeingHighlighted', 'Exclude {0} from being highlighted', `${codePointToHex(codePoint)} "${char}"`);
            }
            const options = [];
            if (reason.kind === 0 /* UnicodeHighlighterReasonKind.Ambiguous */) {
                for (const locale of reason.notAmbiguousInLocales) {
                    options.push({
                        label: nls.localize("unicodeHighlight.allowCommonCharactersInLanguage", "Allow unicode characters that are more common in the language \"{0}\".", locale),
                        run: async () => {
                            excludeLocaleFromBeingHighlighted(configurationService, [locale]);
                        },
                    });
                }
            }
            options.push({
                label: getExcludeCharFromBeingHighlightedLabel(codePoint),
                run: () => excludeCharFromBeingHighlighted(configurationService, [codePoint])
            });
            if (inComment) {
                const action = new DisableHighlightingInCommentsAction();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else if (inString) {
                const action = new DisableHighlightingInStringsAction();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            if (reason.kind === 0 /* UnicodeHighlighterReasonKind.Ambiguous */) {
                const action = new DisableHighlightingOfAmbiguousCharactersAction();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else if (reason.kind === 1 /* UnicodeHighlighterReasonKind.Invisible */) {
                const action = new DisableHighlightingOfInvisibleCharactersAction();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else if (reason.kind === 2 /* UnicodeHighlighterReasonKind.NonBasicAscii */) {
                const action = new DisableHighlightingOfNonBasicAsciiCharactersAction();
                options.push({ label: action.label, run: async () => action.runAction(configurationService) });
            }
            else {
                expectNever(reason);
            }
            const result = await quickPickService.pick(options, { title: nls.localize('unicodeHighlight.configureUnicodeHighlightOptions', 'Configure Unicode Highlight Options') });
            if (result) {
                await result.run();
            }
        }
    }
    exports.ShowExcludeOptions = ShowExcludeOptions;
    async function excludeCharFromBeingHighlighted(configurationService, charCodes) {
        const existingValue = configurationService.getValue(editorOptions_1.unicodeHighlightConfigKeys.allowedCharacters);
        let value;
        if ((typeof existingValue === 'object') && existingValue) {
            value = existingValue;
        }
        else {
            value = {};
        }
        for (const charCode of charCodes) {
            value[String.fromCodePoint(charCode)] = true;
        }
        await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.allowedCharacters, value, 2 /* ConfigurationTarget.USER */);
    }
    async function excludeLocaleFromBeingHighlighted(configurationService, locales) {
        const existingValue = configurationService.inspect(editorOptions_1.unicodeHighlightConfigKeys.allowedLocales).user?.value;
        let value;
        if ((typeof existingValue === 'object') && existingValue) {
            // Copy value, as the existing value is read only
            value = Object.assign({}, existingValue);
        }
        else {
            value = {};
        }
        for (const locale of locales) {
            value[locale] = true;
        }
        await configurationService.updateValue(editorOptions_1.unicodeHighlightConfigKeys.allowedLocales, value, 2 /* ConfigurationTarget.USER */);
    }
    function expectNever(value) {
        throw new Error(`Unexpected value: ${value}`);
    }
    (0, editorExtensions_1.registerEditorAction)(DisableHighlightingOfAmbiguousCharactersAction);
    (0, editorExtensions_1.registerEditorAction)(DisableHighlightingOfInvisibleCharactersAction);
    (0, editorExtensions_1.registerEditorAction)(DisableHighlightingOfNonBasicAsciiCharactersAction);
    (0, editorExtensions_1.registerEditorAction)(ShowExcludeOptions);
    (0, editorExtensions_1.registerEditorContribution)(UnicodeHighlighter.ID, UnicodeHighlighter, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    hoverTypes_1.HoverParticipantRegistry.register(UnicodeHighlighterHoverParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pY29kZUhpZ2hsaWdodGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvdW5pY29kZUhpZ2hsaWdodGVyL2Jyb3dzZXIvdW5pY29kZUhpZ2hsaWdodGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdDbkYsUUFBQSxXQUFXLEdBQUcsSUFBQSwyQkFBWSxFQUFDLDRCQUE0QixFQUFFLGtCQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLDZEQUE2RCxDQUFDLENBQUMsQ0FBQztJQUU1SyxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFVO2lCQUMxQixPQUFFLEdBQUcsbUNBQW1DLEFBQXRDLENBQXVDO1FBUWhFLFlBQ2tCLE9BQW9CLEVBQ2Ysb0JBQTJELEVBQy9DLHNCQUF5RSxFQUNwRixvQkFBMkM7WUFFbEUsS0FBSyxFQUFFLENBQUM7WUFMUyxZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQ0UseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUM5QiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQWtDO1lBVHBHLGlCQUFZLEdBQW1FLElBQUksQ0FBQztZQUlwRixrQkFBYSxHQUFZLEtBQUssQ0FBQztZQXlDdEIsaUJBQVksR0FBRyxDQUFDLEtBQXNDLEVBQVEsRUFBRTtnQkFDaEYsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtvQkFDM0IsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO3dCQUN2QixPQUFPO3FCQUNQO29CQUVELDBEQUEwRDtvQkFDMUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxD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