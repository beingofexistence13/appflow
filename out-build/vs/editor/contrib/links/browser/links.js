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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/common/model/textModel", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture", "vs/editor/contrib/links/browser/getLinks", "vs/nls!vs/editor/contrib/links/browser/links", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/css!./links"], function (require, exports, async_1, cancellation_1, errors_1, htmlContent_1, lifecycle_1, network_1, platform, resources, stopwatch_1, uri_1, editorExtensions_1, textModel_1, languageFeatureDebounce_1, languageFeatures_1, clickLinkGesture_1, getLinks_1, nls, notification_1, opener_1) {
    "use strict";
    var $49_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$49 = void 0;
    let $49 = class $49 extends lifecycle_1.$kc {
        static { $49_1 = this; }
        static { this.ID = 'editor.linkDetector'; }
        static get(editor) {
            return editor.getContribution($49_1.ID);
        }
        constructor(m, n, r, s, languageFeatureDebounceService) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.a = this.s.linkProvider;
            this.b = languageFeatureDebounceService.for(this.a, 'Links', { min: 1000, max: 4000 });
            this.c = this.B(new async_1.$Sg(() => this.t(), 1000));
            this.f = null;
            this.g = null;
            this.j = {};
            this.h = null;
            const clickLinkGesture = this.B(new clickLinkGesture_1.$v3(m));
            this.B(clickLinkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
                this.w(mouseEvent, keyboardEvent);
            }));
            this.B(clickLinkGesture.onExecute((e) => {
                this.z(e);
            }));
            this.B(clickLinkGesture.onCancel((e) => {
                this.y();
            }));
            this.B(m.onDidChangeConfiguration((e) => {
                if (!e.hasChanged(70 /* EditorOption.links */)) {
                    return;
                }
                // Remove any links (for the getting disabled case)
                this.u([]);
                // Stop any computation (for the getting disabled case)
                this.D();
                // Start computing (for the getting enabled case)
                this.c.schedule(0);
            }));
            this.B(m.onDidChangeModelContent((e) => {
                if (!this.m.hasModel()) {
                    return;
                }
                this.c.schedule(this.b.get(this.m.getModel()));
            }));
            this.B(m.onDidChangeModel((e) => {
                this.j = {};
                this.h = null;
                this.D();
                this.c.schedule(0);
            }));
            this.B(m.onDidChangeModelLanguage((e) => {
                this.D();
                this.c.schedule(0);
            }));
            this.B(this.a.onDidChange((e) => {
                this.D();
                this.c.schedule(0);
            }));
            this.c.schedule(0);
        }
        async t() {
            if (!this.m.hasModel() || !this.m.getOption(70 /* EditorOption.links */)) {
                return;
            }
            const model = this.m.getModel();
            if (model.isTooLargeForSyncing()) {
                return;
            }
            if (!this.a.has(model)) {
                return;
            }
            if (this.g) {
                this.g.dispose();
                this.g = null;
            }
            this.f = (0, async_1.$ug)(token => (0, getLinks_1.$39)(this.a, model, token));
            try {
                const sw = new stopwatch_1.$bd(false);
                this.g = await this.f;
                this.b.update(model, sw.elapsed());
                if (model.isDisposed()) {
                    return;
                }
                this.u(this.g.links);
            }
            catch (err) {
                (0, errors_1.$Y)(err);
            }
            finally {
                this.f = null;
            }
        }
        u(links) {
            const useMetaKey = (this.m.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            const oldDecorations = [];
            const keys = Object.keys(this.j);
            for (const decorationId of keys) {
                const occurence = this.j[decorationId];
                oldDecorations.push(occurence.decorationId);
            }
            const newDecorations = [];
            if (links) {
                // Not sure why this is sometimes null
                for (const link of links) {
                    newDecorations.push(LinkOccurrence.decoration(link, useMetaKey));
                }
            }
            this.m.changeDecorations((changeAccessor) => {
                const decorations = changeAccessor.deltaDecorations(oldDecorations, newDecorations);
                this.j = {};
                this.h = null;
                for (let i = 0, len = decorations.length; i < len; i++) {
                    const occurence = new LinkOccurrence(links[i], decorations[i]);
                    this.j[occurence.decorationId] = occurence;
                }
            });
        }
        w(mouseEvent, withKey) {
            const useMetaKey = (this.m.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            if (this.C(mouseEvent, withKey)) {
                this.y(); // always remove previous link decoration as their can only be one
                const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
                if (occurrence) {
                    this.m.changeDecorations((changeAccessor) => {
                        occurrence.activate(changeAccessor, useMetaKey);
                        this.h = occurrence.decorationId;
                    });
                }
            }
            else {
                this.y();
            }
        }
        y() {
            const useMetaKey = (this.m.getOption(77 /* EditorOption.multiCursorModifier */) === 'altKey');
            if (this.h) {
                const occurrence = this.j[this.h];
                if (occurrence) {
                    this.m.changeDecorations((changeAccessor) => {
                        occurrence.deactivate(changeAccessor, useMetaKey);
                    });
                }
                this.h = null;
            }
        }
        z(mouseEvent) {
            if (!this.C(mouseEvent)) {
                return;
            }
            const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
            if (!occurrence) {
                return;
            }
            this.openLinkOccurrence(occurrence, mouseEvent.hasSideBySideModifier, true /* from user gesture */);
        }
        openLinkOccurrence(occurrence, openToSide, fromUserGesture = false) {
            if (!this.n) {
                return;
            }
            const { link } = occurrence;
            link.resolve(cancellation_1.CancellationToken.None).then(uri => {
                // Support for relative file URIs of the shape file://./relativeFile.txt or file:///./relativeFile.txt
                if (typeof uri === 'string' && this.m.hasModel()) {
                    const modelUri = this.m.getModel().uri;
                    if (modelUri.scheme === network_1.Schemas.file && uri.startsWith(`${network_1.Schemas.file}:`)) {
                        const parsedUri = uri_1.URI.parse(uri);
                        if (parsedUri.scheme === network_1.Schemas.file) {
                            const fsPath = resources.$9f(parsedUri);
                            let relativePath = null;
                            if (fsPath.startsWith('/./')) {
                                relativePath = `.${fsPath.substr(1)}`;
                            }
                            else if (fsPath.startsWith('//./')) {
                                relativePath = `.${fsPath.substr(2)}`;
                            }
                            if (relativePath) {
                                uri = resources.$ig(modelUri, relativePath);
                            }
                        }
                    }
                }
                return this.n.open(uri, { openToSide, fromUserGesture, allowContributedOpeners: true, allowCommands: true, fromWorkspace: true });
            }, err => {
                const messageOrError = err instanceof Error ? err.message : err;
                // different error cases
                if (messageOrError === 'invalid') {
                    this.r.warn(nls.localize(0, null, link.url.toString()));
                }
                else if (messageOrError === 'missing') {
                    this.r.warn(nls.localize(1, null));
                }
                else {
                    (0, errors_1.$Y)(err);
                }
            });
        }
        getLinkOccurrence(position) {
            if (!this.m.hasModel() || !position) {
                return null;
            }
            const decorations = this.m.getModel().getDecorationsInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            }, 0, true);
            for (const decoration of decorations) {
                const currentOccurrence = this.j[decoration.id];
                if (currentOccurrence) {
                    return currentOccurrence;
                }
            }
            return null;
        }
        C(mouseEvent, withKey) {
            return Boolean((mouseEvent.target.type === 6 /* MouseTargetType.CONTENT_TEXT */)
                && (mouseEvent.hasTriggerModifier || (withKey && withKey.keyCodeIsTriggerKey)));
        }
        D() {
            this.c.cancel();
            if (this.g) {
                this.g?.dispose();
                this.g = null;
            }
            if (this.f) {
                this.f.cancel();
                this.f = null;
            }
        }
        dispose() {
            super.dispose();
            this.D();
        }
    };
    exports.$49 = $49;
    exports.$49 = $49 = $49_1 = __decorate([
        __param(1, opener_1.$NT),
        __param(2, notification_1.$Yu),
        __param(3, languageFeatures_1.$hF),
        __param(4, languageFeatureDebounce_1.$52)
    ], $49);
    const decoration = {
        general: textModel_1.$RC.register({
            description: 'detected-link',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            collapseOnReplaceEdit: true,
            inlineClassName: 'detected-link'
        }),
        active: textModel_1.$RC.register({
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
                options: LinkOccurrence.a(link, useMetaKey, false)
            };
        }
        static a(link, useMetaKey, isActive) {
            const options = { ...(isActive ? decoration.active : decoration.general) };
            options.hoverMessage = getHoverMessage(link, useMetaKey);
            return options;
        }
        constructor(link, decorationId) {
            this.link = link;
            this.decorationId = decorationId;
        }
        activate(changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence.a(this.link, useMetaKey, true));
        }
        deactivate(changeAccessor, useMetaKey) {
            changeAccessor.changeDecorationOptions(this.decorationId, LinkOccurrence.a(this.link, useMetaKey, false));
        }
    }
    function getHoverMessage(link, useMetaKey) {
        const executeCmd = link.url && /^command:/i.test(link.url.toString());
        const label = link.tooltip
            ? link.tooltip
            : executeCmd
                ? nls.localize(2, null)
                : nls.localize(3, null);
        const kb = useMetaKey
            ? platform.$j
                ? nls.localize(4, null)
                : nls.localize(5, null)
            : platform.$j
                ? nls.localize(6, null)
                : nls.localize(7, null);
        if (link.url) {
            let nativeLabel = '';
            if (/^command:/i.test(link.url.toString())) {
                // Don't show complete command arguments in the native tooltip
                const match = link.url.toString().match(/^command:([^?#]+)/);
                if (match) {
                    const commandId = match[1];
                    nativeLabel = nls.localize(8, null, commandId);
                }
            }
            const hoverMessage = new htmlContent_1.$Xj('', true)
                .appendLink(link.url.toString(true).replace(/ /g, '%20'), label, nativeLabel)
                .appendMarkdown(` (${kb})`);
            return hoverMessage;
        }
        else {
            return new htmlContent_1.$Xj().appendText(`${label} (${kb})`);
        }
    }
    class OpenLinkAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.openLink',
                label: nls.localize(9, null),
                alias: 'Open Link',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const linkDetector = $49.get(editor);
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
    (0, editorExtensions_1.$AV)($49.ID, $49, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$xV)(OpenLinkAction);
});
//# sourceMappingURL=links.js.map