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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/markerDecorations", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/gotoError/browser/gotoError", "vs/nls", "vs/platform/markers/common/markers", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress"], function (require, exports, dom, arrays_1, async_1, errors_1, lifecycle_1, resources_1, range_1, languageFeatures_1, markerDecorations_1, codeAction_1, codeActionController_1, types_1, gotoError_1, nls, markers_1, opener_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkerHoverParticipant = exports.MarkerHover = void 0;
    const $ = dom.$;
    class MarkerHover {
        constructor(owner, range, marker) {
            this.owner = owner;
            this.range = range;
            this.marker = marker;
        }
        isValidForHoverAnchor(anchor) {
            return (anchor.type === 1 /* HoverAnchorType.Range */
                && this.range.startColumn <= anchor.range.startColumn
                && this.range.endColumn >= anchor.range.endColumn);
        }
    }
    exports.MarkerHover = MarkerHover;
    const markerCodeActionTrigger = {
        type: 1 /* CodeActionTriggerType.Invoke */,
        filter: { include: types_1.CodeActionKind.QuickFix },
        triggerAction: types_1.CodeActionTriggerSource.QuickFixHover
    };
    let MarkerHoverParticipant = class MarkerHoverParticipant {
        constructor(_editor, _markerDecorationsService, _openerService, _languageFeaturesService) {
            this._editor = _editor;
            this._markerDecorationsService = _markerDecorationsService;
            this._openerService = _openerService;
            this._languageFeaturesService = _languageFeaturesService;
            this.hoverOrdinal = 1;
            this.recentMarkerCodeActionsInfo = undefined;
        }
        computeSync(anchor, lineDecorations) {
            if (!this._editor.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */ && !anchor.supportsMarkerHover) {
                return [];
            }
            const model = this._editor.getModel();
            const lineNumber = anchor.range.startLineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            const result = [];
            for (const d of lineDecorations) {
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                const marker = this._markerDecorationsService.getMarker(model.uri, d);
                if (!marker) {
                    continue;
                }
                const range = new range_1.Range(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
                result.push(new MarkerHover(this, range, marker));
            }
            return result;
        }
        renderHoverParts(context, hoverParts) {
            if (!hoverParts.length) {
                return lifecycle_1.Disposable.None;
            }
            const disposables = new lifecycle_1.DisposableStore();
            hoverParts.forEach(msg => context.fragment.appendChild(this.renderMarkerHover(msg, disposables)));
            const markerHoverForStatusbar = hoverParts.length === 1 ? hoverParts[0] : hoverParts.sort((a, b) => markers_1.MarkerSeverity.compare(a.marker.severity, b.marker.severity))[0];
            this.renderMarkerStatusbar(context, markerHoverForStatusbar, disposables);
            return disposables;
        }
        renderMarkerHover(markerHover, disposables) {
            const hoverElement = $('div.hover-row');
            const markerElement = dom.append(hoverElement, $('div.marker.hover-contents'));
            const { source, message, code, relatedInformation } = markerHover.marker;
            this._editor.applyFontInfo(markerElement);
            const messageElement = dom.append(markerElement, $('span'));
            messageElement.style.whiteSpace = 'pre-wrap';
            messageElement.innerText = message;
            if (source || code) {
                // Code has link
                if (code && typeof code !== 'string') {
                    const sourceAndCodeElement = $('span');
                    if (source) {
                        const sourceElement = dom.append(sourceAndCodeElement, $('span'));
                        sourceElement.innerText = source;
                    }
                    const codeLink = dom.append(sourceAndCodeElement, $('a.code-link'));
                    codeLink.setAttribute('href', code.target.toString());
                    disposables.add(dom.addDisposableListener(codeLink, 'click', (e) => {
                        this._openerService.open(code.target, { allowCommands: true });
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    const codeElement = dom.append(codeLink, $('span'));
                    codeElement.innerText = code.value;
                    const detailsElement = dom.append(markerElement, sourceAndCodeElement);
                    detailsElement.style.opacity = '0.6';
                    detailsElement.style.paddingLeft = '6px';
                }
                else {
                    const detailsElement = dom.append(markerElement, $('span'));
                    detailsElement.style.opacity = '0.6';
                    detailsElement.style.paddingLeft = '6px';
                    detailsElement.innerText = source && code ? `${source}(${code})` : source ? source : `(${code})`;
                }
            }
            if ((0, arrays_1.isNonEmptyArray)(relatedInformation)) {
                for (const { message, resource, startLineNumber, startColumn } of relatedInformation) {
                    const relatedInfoContainer = dom.append(markerElement, $('div'));
                    relatedInfoContainer.style.marginTop = '8px';
                    const a = dom.append(relatedInfoContainer, $('a'));
                    a.innerText = `${(0, resources_1.basename)(resource)}(${startLineNumber}, ${startColumn}): `;
                    a.style.cursor = 'pointer';
                    disposables.add(dom.addDisposableListener(a, 'click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (this._openerService) {
                            this._openerService.open(resource, {
                                fromUserGesture: true,
                                editorOptions: { selection: { startLineNumber, startColumn } }
                            }).catch(errors_1.onUnexpectedError);
                        }
                    }));
                    const messageElement = dom.append(relatedInfoContainer, $('span'));
                    messageElement.innerText = message;
                    this._editor.applyFontInfo(messageElement);
                }
            }
            return hoverElement;
        }
        renderMarkerStatusbar(context, markerHover, disposables) {
            if (markerHover.marker.severity === markers_1.MarkerSeverity.Error || markerHover.marker.severity === markers_1.MarkerSeverity.Warning || markerHover.marker.severity === markers_1.MarkerSeverity.Info) {
                context.statusBar.addAction({
                    label: nls.localize('view problem', "View Problem"),
                    commandId: gotoError_1.NextMarkerAction.ID,
                    run: () => {
                        context.hide();
                        gotoError_1.MarkerController.get(this._editor)?.showAtMarker(markerHover.marker);
                        this._editor.focus();
                    }
                });
            }
            if (!this._editor.getOption(90 /* EditorOption.readOnly */)) {
                const quickfixPlaceholderElement = context.statusBar.append($('div'));
                if (this.recentMarkerCodeActionsInfo) {
                    if (markers_1.IMarkerData.makeKey(this.recentMarkerCodeActionsInfo.marker) === markers_1.IMarkerData.makeKey(markerHover.marker)) {
                        if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
                            quickfixPlaceholderElement.textContent = nls.localize('noQuickFixes', "No quick fixes available");
                        }
                    }
                    else {
                        this.recentMarkerCodeActionsInfo = undefined;
                    }
                }
                const updatePlaceholderDisposable = this.recentMarkerCodeActionsInfo && !this.recentMarkerCodeActionsInfo.hasCodeActions ? lifecycle_1.Disposable.None : disposables.add((0, async_1.disposableTimeout)(() => quickfixPlaceholderElement.textContent = nls.localize('checkingForQuickFixes', "Checking for quick fixes..."), 200));
                if (!quickfixPlaceholderElement.textContent) {
                    // Have some content in here to avoid flickering
                    quickfixPlaceholderElement.textContent = String.fromCharCode(0xA0); // &nbsp;
                }
                const codeActionsPromise = this.getCodeActions(markerHover.marker);
                disposables.add((0, lifecycle_1.toDisposable)(() => codeActionsPromise.cancel()));
                codeActionsPromise.then(actions => {
                    updatePlaceholderDisposable.dispose();
                    this.recentMarkerCodeActionsInfo = { marker: markerHover.marker, hasCodeActions: actions.validActions.length > 0 };
                    if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
                        actions.dispose();
                        quickfixPlaceholderElement.textContent = nls.localize('noQuickFixes', "No quick fixes available");
                        return;
                    }
                    quickfixPlaceholderElement.style.display = 'none';
                    let showing = false;
                    disposables.add((0, lifecycle_1.toDisposable)(() => {
                        if (!showing) {
                            actions.dispose();
                        }
                    }));
                    context.statusBar.addAction({
                        label: nls.localize('quick fixes', "Quick Fix..."),
                        commandId: codeAction_1.quickFixCommandId,
                        run: (target) => {
                            showing = true;
                            const controller = codeActionController_1.CodeActionController.get(this._editor);
                            const elementPosition = dom.getDomNodePagePosition(target);
                            // Hide the hover pre-emptively, otherwise the editor can close the code actions
                            // context menu as well when using keyboard navigation
                            context.hide();
                            controller?.showCodeActions(markerCodeActionTrigger, actions, {
                                x: elementPosition.left,
                                y: elementPosition.top,
                                width: elementPosition.width,
                                height: elementPosition.height
                            });
                        }
                    });
                }, errors_1.onUnexpectedError);
            }
        }
        getCodeActions(marker) {
            return (0, async_1.createCancelablePromise)(cancellationToken => {
                return (0, codeAction_1.getCodeActions)(this._languageFeaturesService.codeActionProvider, this._editor.getModel(), new range_1.Range(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn), markerCodeActionTrigger, progress_1.Progress.None, cancellationToken);
            });
        }
    };
    exports.MarkerHoverParticipant = MarkerHoverParticipant;
    exports.MarkerHoverParticipant = MarkerHoverParticipant = __decorate([
        __param(1, markerDecorations_1.IMarkerDecorationsService),
        __param(2, opener_1.IOpenerService),
        __param(3, languageFeatures_1.ILanguageFeaturesService)
    ], MarkerHoverParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VySG92ZXJQYXJ0aWNpcGFudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2hvdmVyL2Jyb3dzZXIvbWFya2VySG92ZXJQYXJ0aWNpcGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBYSxXQUFXO1FBRXZCLFlBQ2lCLEtBQTJDLEVBQzNDLEtBQVksRUFDWixNQUFlO1lBRmYsVUFBSyxHQUFMLEtBQUssQ0FBc0M7WUFDM0MsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUNaLFdBQU0sR0FBTixNQUFNLENBQVM7UUFDNUIsQ0FBQztRQUVFLHFCQUFxQixDQUFDLE1BQW1CO1lBQy9DLE9BQU8sQ0FDTixNQUFNLENBQUMsSUFBSSxrQ0FBMEI7bUJBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVzttQkFDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQ2pELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFmRCxrQ0FlQztJQUVELE1BQU0sdUJBQXVCLEdBQXNCO1FBQ2xELElBQUksc0NBQThCO1FBQ2xDLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxzQkFBYyxDQUFDLFFBQVEsRUFBRTtRQUM1QyxhQUFhLEVBQUUsK0JBQXVCLENBQUMsYUFBYTtLQUNwRCxDQUFDO0lBRUssSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBc0I7UUFNbEMsWUFDa0IsT0FBb0IsRUFDVix5QkFBcUUsRUFDaEYsY0FBK0MsRUFDckMsd0JBQW1FO1lBSDVFLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDTyw4QkFBeUIsR0FBekIseUJBQXlC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