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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/contrib/links/browser/getLinks", "vs/nls", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/css!./links"], function (require, exports, async_1, cancellation_1, errors_1, htmlContent_1, lifecycle_1, network_1, platform, resources, stopwatch_1, uri_1, editorExtensions_1, textModel_1, languageFeatureDebounce_1, languageFeatures_1, clickLinkGesture_1, getLinks_1, nls, notification_1, opener_1) {
    "use strict";
    var LinkDetector_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkDetector = void 0;
    let LinkDetector = class LinkDetector extends lifecycle_1.Disposable {
        static { LinkDetector_1 = this; }
        static { this.ID = 'editor.linkDetector'; }
        static get(editor) {
            return editor.getContribution(LinkDetector_1.ID);
        }
        constructor(editor, openerService, notificationService, languageFeaturesService, languageFeatureDebounceService) {
            super();
            this.editor = editor;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.languageFeaturesService = languageFeaturesService;
            this.providers = this.languageFeaturesService.linkProvider;
            this.debounceInformation = languageFeatureDebounceService.for(this.providers, 'Links', { min: 1000, max: 4000 });
            this.computeLinks = this._register(new async_1.RunOnceScheduler(() => this.computeLinksNow(), 1000));
            this.computePromise = null;
            this.activeLinksList = null;
            this.currentOccurrences = {};
            this.activeLinkDecorationId = null;
            const clickLinkGesture = this._register(new clickLinkGesture_1.ClickLinkGesture(editor));
            this._register(clickLinkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
                this._onEditorMouseMove(mouseEvent, keyboardEvent);
            }));
            this._register(clickLinkGesture.onExecute((e) => {
                this.onEditorMouseUp(e);
            }));
            this._register(clickLinkGesture.onCancel((e) => {
                this.cleanUpActiveLinkDecoration();
            }));
            this._register(editor.onDidChangeConfiguration((e) => {
                if (!e.hasChanged(70 /* EditorOption.links */)) {
                    return;
                }
                // Remove any links (for the getting disabled case)
                this.updateDecorations([]);
                // Stop any computation (for the getting disabled case)
                this.stop();
                // Start computing (for the getting enabled case)
                this.computeLinks.schedule(0);
            }));
            this._register(editor.onDidChangeModelContent((e) => {
                if (!this.editor.hasModel()) {
                    return;
                }
                this.computeLinks.schedule(this.debounceInformation.get(this.editor.getModel()));
            }));
            this._register(editor.onDidChangeModel((e) => {
                this.currentOccurrences = {};
                this.activeLinkDecorationId = null;
                this.stop();
                this.computeLinks.schedule(0);
            }));
            this._register(editor.onDidChangeModelLanguage((e) => {
                this.stop();
                this.computeLinks.schedule(0);
            }));
            this._register(this.providers.onDidChange((e) => {
                this.stop();
                this.computeLinks.schedule(0);
            }));
            this.computeLinks.schedule(0);
        }
        async computeLinksNow() {
            if (!this.editor.hasModel() || !this.editor.getOption(70 /* EditorOption.links */)) {
                return;
            }
            const model = this.editor.getModel();
            if (model.isTooLargeForSyncing()) {
                return;
            }
            if (!this.providers.has(model)) {
                return;
            }
            if (this.activeLinksList) {
                this.activeLinksList.dispose();
                this.activeLinksList = null;
            }
            this.computePromise = (0, async_1.createCancelablePromise)(token => (0, getLinks_1.getLinks)(this.providers, model, token));
            try {
                const sw = new stopwatch_1.StopWatch(false);
                this.activeLinksList = await this.computePromise;
                this.debounceInformation.update(model, sw.elapsed());
                if (model.isDisposed()) {
                    return;
                }
                this.updateDecorations(this.activeLinksList.links);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
            }
            finally {
                this.computePromise = null;
            }
        }
        updateDecorations(links) {
            const useMetaKey = (this.editor.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            const oldDecorations = [];
            const keys = Object.keys(this.currentOccurrences);
            for (const decorationId of keys) {
                const occurence = this.currentOccurrences[decorationId];
                oldDecorations.push(occurence.decorationId);
            }
            const newDecorations = [];
            if (links) {
                // Not sure why this is sometimes null
                for (const link of links) {
                    newDecorations.push(LinkOccurrence.decoration(link, useMetaKey));
                }
            }
            this.editor.changeDecorations((changeAccessor) => {
                const decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
                this.currentOccurrences = {};
                this.activeLinkDecorationId = null;
                for (let i = 0, len = decorations.length; i < len; i++) {
                    const occurence = new LinkOccurrence(links[i], decorations[i]);
                    this.currentOccurrences[occurence.decorationId] = occurence;
                }
            });
        }
        _onEditorMouseMove(mouseEvent, withKey) {
            const useMetaKey = (this.editor.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            if (this.isEnabled(mouseEvent, withKey)) {
                this.cleanUpActiveLinkDecoration(); // always remove previous link decoration as their can only be one
                const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
                if (occurrence) {
                    this.editor.changeDecorations((changeAccessor) => {
                        occurrence.activate(changeAccessor, useMetaKey);
                        this.activeLinkDecorationId = occurrence.decorationId;
                    });
                }
            }
            else {
                this.cleanUpActiveLinkDecoration();
            }
        }
        cleanUpActiveLinkDecoration() {
            const useMetaKey = (this.editor.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            if (this.activeLinkDecorationId) {
                const occurrence = this.currentOccurrences[this.activeLinkDecorationId];
                if (occurrence) {
                    this.editor.changeDecorations((changeAccessor) => {
                        occurrence.deactivate(changeAccessor, useMetaKey);
                    });
                }
                this.activeLinkDecorationId = null;
            }
        }
        onEditorMouseUp(mouseEvent) {
            if (!this.isEnabled(mouseEvent)) {
                return;
            }
            const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
            if (!occurrence) {
                return;
            }
            this.openLinkOccurrence(occurrence, mouseEvent.hasSideBySideModifier, true /* from user gesture */);
        }
        openLinkOccurrence(occurrence, openToSide, fromUserGesture = false) {
            if (!this.openerService) {
                return;
            }
            const { link } = occurrence;
            link.resolve(cancellation_1.CancellationToken.None).then(uri => {
                // Support for relative file URIs of the shape file://./relativeFile.txt or file:///./relativeFile.txt
                if (typeof uri === 'string' && this.editor.hasModel()) {
                    const modelUri = this.editor.getModel().uri;
                    if (modelUri.scheme === network_1.Schemas.file && uri.startsWith(`${network_1.Schemas.file}:`)) {
                        const parsedUri = uri_1.URI.parse(uri);
                        if (parsedUri.scheme === network_1.Schemas.file) {
                            const fsPath = resources.originalFSPath(parsedUri);
                            let relativePath = null;
                            if (fsPath.startsWith('/./')) {
                                relativePath = `.${fsPath.substr(1)}`;
                            }
                            else if (fsPath.startsWith('//./')) {
                                relativePath = `.${fsPath.substr(2)}`;
                            }
                            if (relativePath) {
                                uri = resources.joinPath(modelUri, relativePath);
                            }
                        }
                    }
                }
                return this.openerService.open(uri, { openToSide, fromUserGesture, allowContributedOpeners: true, allowCommands: true, fromWorkspace: true });
            }, err => {
                const messageOrError = err instanceof Error ? err.message : err;
                // different error cases
                if (messageOrError === 'invalid') {
                    this.notificationService.warn(nls.localize('invalid.url', 'Failed to open this link because it is not well-formed: {0}', link.url.toString()));
                }
                else if (messageOrError === 'missing') {
                    this.notificationService.warn(nls.localize('missing.url', 'Failed to open this link because its target is missing.'));
                }
                else {
                    (0, errors_1.onUnexpectedError)(err);
                }
            });
        }
        getLinkOccurrence(position) {
            if (!this.editor.hasModel() || !position) {
                return null;
            }
            const decorations = this.editor.getModel().getDecorationsInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            }, 0, true);
            for (const decoration of decorations) {
                const currentOccurrence = this.currentOccurrences[decoration.id];
                if (currentOccurrence) {
                    return currentOccurrence;
                }
            }
            return null;
        }
        isEnabled(mouseEvent, withKey) {
            return Boolean((mouseEvent.target.type === 6 /* MouseTargetType.CONTENT_TEXT */)
                && (mouseEvent.hasTriggerModifier || (withKey && withKey.keyCodeIsTriggerKey)));
        }
        stop() {
            this.computeLinks.cancel();
            if (this.activeLinksList) {
                this.activeLinksList?.dispose();
                this.activeLinksList = null;
            }
            if (this.computePromise) {
                this.computePromise.cancel();
                this.computePromise = null;
            }
        }
        dispose() {
            super.dispose();
            this.stop();
        }
    };
    exports.LinkDetector = LinkDetector;
    exports.LinkDetector = LinkDetector = LinkDetector_1 = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, notification_1.INotificationService),
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, languageFeatureDebounce_1.ILanguageFeatureDebounceService)
    ], LinkDetector);
    const decoration = {
        general: textModel_1.ModelDecorationOptions.register({
            description: 'detected-link',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            collapseOnReplaceEdit: true,
            inlineClassName: 'detected-link'
        }),
        active: textModel_1.ModelDecorationOptions.register({
            description: 'detected-link-active',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            collapseOnReplaceEdit: true,
            inlineClassName: 'detected-link-active'
        })
    };
    class LinkOccurrence {
        static decoration(link, useMetaKey) {
            return {
                range: link.range,
                options: LinkOccurrence._getOptions(link, useMetaKey, false)
            };
        }
        static _getOptions(link, useMetaKey, isActive) {
            const options = { ...(isActive ? decoration.active : decoration.general) };
            options.hoverMessage = getHoverMessage(link, useMetaKey);
            return options;
        }
        constructor(link, decorationId) {
            this.link = link;
            this.decorationId = decorationId;
        }
        activate(changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence._getOptions(this.link, useMetaKey, true));
        }
        deactivate(changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence._getOptions(this.link, useMetaKey, false));
        }
    }
    function getHoverMessage(link, useMetaKey) {
        const executeCmd = link.url && /^command:/i.test(link.url.toString());
        const label = link.tooltip
            ? link.tooltip
            : executeCmd
                ? nls.localize('links.navigate.executeCmd', 'Execute command')
                : nls.localize('links.navigate.follow', 'Follow link');
        const kb = useMetaKey
            ? platform.isMacintosh
                ? nls.localize('links.navigate.kb.meta.mac', "cmd + click")
                : nls.localize('links.navigate.kb.meta', "ctrl + click")
            : platform.isMacintosh
                ? nls.localize('links.navigate.kb.alt.mac', "option + click")
                : nls.localize('links.navigate.kb.alt', "alt + click");
        if (link.url) {
            let nativeLabel = '';
            if (/^command:/i.test(link.url.toString())) {
                // Don't show complete command arguments in the native tooltip
                const match = link.url.toString().match(/^command:([^?#]+)/);
                if (match) {
                    const commandId = match[1];
                    nativeLabel = nls.localize('tooltip.explanation', "Execute command {0}", commandId);
                }
            }
            const hoverMessage = new htmlContent_1.MarkdownString('', true)
                .appendLink(link.url.toString(true).replace(/ /g, '%20'), label, nativeLabel)
                .appendMarkdown(` (${kb})`);
            return hoverMessage;
        }
        else {
            return new htmlContent_1.MarkdownString().appendText(`${label} (${kb})`);
        }
    }
    class OpenLinkAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.openLink',
                label: nls.localize('label', "Open Link"),
                alias: 'Open Link',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const linkDetector = LinkDetector.get(editor);
            if (!linkDetector) {
                return;
            }
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections();
            for (const sel of selections) {
                const link = linkDetector.getLinkOccurrence(sel.getEndPosition());
                if (link) {
                    linkDetector.openLinkOccurrence(link, false);
                }
            }
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(LinkDetector.ID, LinkDetector, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorAction)(OpenLinkAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9saW5rcy9icm93c2VyL2xpbmtzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE4QnpGLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxzQkFBVTs7aUJBRXBCLE9BQUUsR0FBVyxxQkFBcUIsQUFBaEMsQ0FBaUM7UUFFbkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUNwQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQWUsY0FBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFVRCxZQUNrQixNQUFtQixFQUNILGFBQTZCLEVBQ3ZCLG1CQUF5QyxFQUNyQyx1QkFBaUQsRUFDM0QsOEJBQStEO1lBRWhHLEtBQUssRUFBRSxDQUFDO1lBTlMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUNILGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN2Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ3JDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFLNUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDO1lBQzNELElBQUksQ0FBQyxtQkFBbUIsR0FBRyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2pILElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1lBQzVCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUVuQyxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxtQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXRFLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFO2dCQUM1RixJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUMvQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLDZCQUFvQixFQUFFO29CQUN0QyxPQUFPO2lCQUNQO2dCQUNELG1EQUFtRDtnQkFDbkQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUUzQix1REFBdUQ7Z0JBQ3ZELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFWixpREFBaUQ7Z0JBQ2pELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDNUIsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUM1QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO2dCQUNuQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1osSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1osSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyxLQUFLLENBQUMsZUFBZTtZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyw2QkFBb0IsRUFBRTtnQkFDMUUsT0FBTzthQUNQO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUVyQyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO2dCQUNqQyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU87YUFDUDtZQUVELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7YUFDNUI7WUFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUEsK0JBQXVCLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFBLG1CQUFRLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMvRixJQUFJO2dCQUNILE1BQU0sRUFBRSxHQUFHLElBQUkscUJBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRTtvQkFDdkIsT0FBTztpQkFDUDtnQkFDRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuRDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLElBQUEsMEJBQWlCLEVBQUMsR0FBRyxDQUFDLENBQUM7YUFDdkI7b0JBQVM7Z0JBQ1QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7YUFDM0I7UUFDRixDQUFDO1FBRU8saUJBQWlCLENBQUMsS0FBYTtZQUN0QyxNQUFNLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUywyQ0FBa0MsS0FBSyxRQUFRLENBQUMsQ0FBQztZQUMxRixNQUFNLGNBQWMsR0FBYSxFQUFFLENBQUM7WUFDcEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNsRCxLQUFLLE1BQU0sWUFBWSxJQUFJLElBQUksRUFBRTtnQkFDaEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN4RCxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM1QztZQUVELE1BQU0sY0FBYyxHQUE0QixFQUFFLENBQUM7WUFDbkQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1Ysc0NBQXNDO2dCQUN0QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtvQkFDekIsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO2lCQUNqRTthQUNEO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFO2dCQUNoRCxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUVwRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO2dCQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN2RCxNQUFNLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFDO2lCQUM1RDtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLGtCQUFrQixDQUFDLFVBQStCLEVBQUUsT0FBc0M7WUFDakcsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsMkNBQWtDLEtBQUssUUFBUSxDQUFDLENBQUM7WUFDMUYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxrRUFBa0U7Z0JBQ3RHLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLFVBQVUsRUFBRTtvQkFDZixJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUU7d0JBQ2hELFVBQVUsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUNoRCxJQUFJLENBQUMsc0JBQXNCLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQztvQkFDdkQsQ0FBQyxDQUFDLENBQUM7aUJBQ0g7YUFDRDtpQkFBTTtnQkFDTixJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQzthQUNuQztRQUNGLENBQUM7UUFFTywyQkFBMkI7WUFDbEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsMkNBQWtDLEtBQUssUUFBUSxDQUFDLENBQUM7WUFDMUYsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ2hDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDeEUsSUFBSSxVQUFVLEVBQUU7b0JBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFO3dCQUNoRCxVQUFVLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDbkQsQ0FBQyxDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQzthQUNuQztRQUNGLENBQUM7UUFFTyxlQUFlLENBQUMsVUFBK0I7WUFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU87YUFDUDtZQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RFLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxVQUEwQixFQUFFLFVBQW1CLEVBQUUsZUFBZSxHQUFHLEtBQUs7WUFFakcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hCLE9BQU87YUFDUDtZQUVELE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUM7WUFFNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBRS9DLHNHQUFzRztnQkFDdEcsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDdEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUM7b0JBQzVDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO3dCQUMzRSxNQUFNLFNBQVMsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNqQyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUU7NEJBQ3RDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBRW5ELElBQUksWUFBWSxHQUFrQixJQUFJLENBQUM7NEJBQ3ZDLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQ0FDN0IsWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDOzZCQUN0QztpQ0FBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0NBQ3JDLFlBQVksR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs2QkFDdEM7NEJBRUQsSUFBSSxZQUFZLEVBQUU7Z0NBQ2pCLEdBQUcsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQzs2QkFDakQ7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRS9JLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDUixNQUFNLGNBQWMsR0FDbkIsR0FBRyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQVMsR0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNuRCx3QkFBd0I7Z0JBQ3hCLElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRTtvQkFDakMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSw2REFBNkQsRUFBRSxJQUFJLENBQUMsR0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDaEo7cUJBQU0sSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUN4QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLHlEQUF5RCxDQUFDLENBQUMsQ0FBQztpQkFDdEg7cUJBQU07b0JBQ04sSUFBQSwwQkFBaUIsRUFBQyxHQUFHLENBQUMsQ0FBQztpQkFDdkI7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxRQUF5QjtZQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDekMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMscUJBQXFCLENBQUM7Z0JBQ2hFLGVBQWUsRUFBRSxRQUFRLENBQUMsVUFBVTtnQkFDcEMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNO2dCQUM1QixhQUFhLEVBQUUsUUFBUSxDQUFDLFVBQVU7Z0JBQ2xDLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTTthQUMxQixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVaLEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxFQUFFO2dCQUNyQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLElBQUksaUJBQWlCLEVBQUU7b0JBQ3RCLE9BQU8saUJBQWlCLENBQUM7aUJBQ3pCO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTyxTQUFTLENBQUMsVUFBK0IsRUFBRSxPQUF1QztZQUN6RixPQUFPLE9BQU8sQ0FDYixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSx5Q0FBaUMsQ0FBQzttQkFDdEQsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FDOUUsQ0FBQztRQUNILENBQUM7UUFFTyxJQUFJO1lBQ1gsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMzQixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBQ0QsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQzthQUMzQjtRQUNGLENBQUM7UUFFZSxPQUFPO1lBQ3RCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDYixDQUFDOztJQXRSVyxvQ0FBWTsyQkFBWixZQUFZO1FBa0J0QixXQUFBLHVCQUFjLENBQUE7UUFDZCxXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEsMkNBQXdCLENBQUE7UUFDeEIsV0FBQSx5REFBK0IsQ0FBQTtPQXJCckIsWUFBWSxDQXVSeEI7SUFFRCxNQUFNLFVBQVUsR0FBRztRQUNsQixPQUFPLEVBQUUsa0NBQXNCLENBQUMsUUFBUSxDQUFDO1lBQ3hDLFdBQVcsRUFBRSxlQUFlO1lBQzVCLFVBQVUsNERBQW9EO1lBQzlELHFCQUFxQixFQUFFLElBQUk7WUFDM0IsZUFBZSxFQUFFLGVBQWU7U0FDaEMsQ0FBQztRQUNGLE1BQU0sRUFBRSxrQ0FBc0IsQ0FBQyxRQUFRLENBQUM7WUFDdkMsV0FBVyxFQUFFLHNCQUFzQjtZQUNuQyxVQUFVLDREQUFvRDtZQUM5RCxxQkFBcUIsRUFBRSxJQUFJO1lBQzNCLGVBQWUsRUFBRSxzQkFBc0I7U0FDdkMsQ0FBQztLQUNGLENBQUM7SUFFRixNQUFNLGNBQWM7UUFFWixNQUFNLENBQUMsVUFBVSxDQUFDLElBQVUsRUFBRSxVQUFtQjtZQUN2RCxPQUFPO2dCQUNOLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDakIsT0FBTyxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUM7YUFDNUQsQ0FBQztRQUNILENBQUM7UUFFTyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQVUsRUFBRSxVQUFtQixFQUFFLFFBQWlCO1lBQzVFLE1BQU0sT0FBTyxHQUFHLEVBQUUsR0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDNUUsT0FBTyxDQUFDLFlBQVksR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3pELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7UUFLRCxZQUFZLElBQVUsRUFBRSxZQUFvQjtZQUMzQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNsQyxDQUFDO1FBRU0sUUFBUSxDQUFDLGNBQStDLEVBQUUsVUFBbUI7WUFDbkYsY0FBYyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BILENBQUM7UUFFTSxVQUFVLENBQUMsY0FBK0MsRUFBRSxVQUFtQjtZQUNyRixjQUFjLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDckgsQ0FBQztLQUNEO0lBRUQsU0FBUyxlQUFlLENBQUMsSUFBVSxFQUFFLFVBQW1CO1FBQ3ZELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFdEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQ2QsQ0FBQyxDQUFDLFVBQVU7Z0JBQ1gsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsaUJBQWlCLENBQUM7Z0JBQzlELENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXpELE1BQU0sRUFBRSxHQUFHLFVBQVU7WUFDcEIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXO2dCQUNyQixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxhQUFhLENBQUM7Z0JBQzNELENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLGNBQWMsQ0FBQztZQUN6RCxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVc7Z0JBQ3JCLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLGdCQUFnQixDQUFDO2dCQUM3RCxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV6RCxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDYixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTtnQkFDM0MsOERBQThEO2dCQUM5RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLEtBQUssRUFBRTtvQkFDVixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLFdBQVcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUNwRjthQUNEO1lBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBYyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUM7aUJBQy9DLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUM7aUJBQzVFLGNBQWMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDN0IsT0FBTyxZQUFZLENBQUM7U0FDcEI7YUFBTTtZQUNOLE9BQU8sSUFBSSw0QkFBYyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDM0Q7SUFDRixDQUFDO0lBRUQsTUFBTSxjQUFlLFNBQVEsK0JBQVk7UUFFeEM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHdCQUF3QjtnQkFDNUIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztnQkFDekMsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLFlBQVksRUFBRSxTQUFTO2FBQ3ZCLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUFtQjtZQUN6RCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2xCLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU87YUFDUDtZQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMxQyxLQUFLLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRTtnQkFDN0IsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLElBQUksRUFBRTtvQkFDVCxZQUFZLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUM3QzthQUNEO1FBQ0YsQ0FBQztLQUNEO0lBRUQsSUFBQSw2Q0FBMEIsRUFBQyxZQUFZLENBQUMsRUFBRSxFQUFFLFlBQVksMkRBQW1ELENBQUM7SUFDNUcsSUFBQSx1Q0FBb0IsRUFBQyxjQUFjLENBQUMsQ0FBQyJ9