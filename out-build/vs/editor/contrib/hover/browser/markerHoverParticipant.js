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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/markerDecorations", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionController", "vs/editor/contrib/codeAction/common/types", "vs/editor/contrib/gotoError/browser/gotoError", "vs/nls!vs/editor/contrib/hover/browser/markerHoverParticipant", "vs/platform/markers/common/markers", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress"], function (require, exports, dom, arrays_1, async_1, errors_1, lifecycle_1, resources_1, range_1, languageFeatures_1, markerDecorations_1, codeAction_1, codeActionController_1, types_1, gotoError_1, nls, markers_1, opener_1, progress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g5 = exports.$f5 = void 0;
    const $ = dom.$;
    class $f5 {
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
    exports.$f5 = $f5;
    const markerCodeActionTrigger = {
        type: 1 /* CodeActionTriggerType.Invoke */,
        filter: { include: types_1.$v1.QuickFix },
        triggerAction: types_1.CodeActionTriggerSource.QuickFixHover
    };
    let $g5 = class $g5 {
        constructor(f, g, h, i) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.hoverOrdinal = 1;
            this.c = undefined;
        }
        computeSync(anchor, lineDecorations) {
            if (!this.f.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */ && !anchor.supportsMarkerHover) {
                return [];
            }
            const model = this.f.getModel();
            const lineNumber = anchor.range.startLineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            const result = [];
            for (const d of lineDecorations) {
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                const marker = this.g.getMarker(model.uri, d);
                if (!marker) {
                    continue;
                }
                const range = new range_1.$ks(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
                result.push(new $f5(this, range, marker));
            }
            return result;
        }
        renderHoverParts(context, hoverParts) {
            if (!hoverParts.length) {
                return lifecycle_1.$kc.None;
            }
            const disposables = new lifecycle_1.$jc();
            hoverParts.forEach(msg => context.fragment.appendChild(this.j(msg, disposables)));
            const markerHoverForStatusbar = hoverParts.length === 1 ? hoverParts[0] : hoverParts.sort((a, b) => markers_1.MarkerSeverity.compare(a.marker.severity, b.marker.severity))[0];
            this.k(context, markerHoverForStatusbar, disposables);
            return disposables;
        }
        j(markerHover, disposables) {
            const hoverElement = $('div.hover-row');
            const markerElement = dom.$0O(hoverElement, $('div.marker.hover-contents'));
            const { source, message, code, relatedInformation } = markerHover.marker;
            this.f.applyFontInfo(markerElement);
            const messageElement = dom.$0O(markerElement, $('span'));
            messageElement.style.whiteSpace = 'pre-wrap';
            messageElement.innerText = message;
            if (source || code) {
                // Code has link
                if (code && typeof code !== 'string') {
                    const sourceAndCodeElement = $('span');
                    if (source) {
                        const sourceElement = dom.$0O(sourceAndCodeElement, $('span'));
                        sourceElement.innerText = source;
                    }
                    const codeLink = dom.$0O(sourceAndCodeElement, $('a.code-link'));
                    codeLink.setAttribute('href', code.target.toString());
                    disposables.add(dom.$nO(codeLink, 'click', (e) => {
                        this.h.open(code.target, { allowCommands: true });
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    const codeElement = dom.$0O(codeLink, $('span'));
                    codeElement.innerText = code.value;
                    const detailsElement = dom.$0O(markerElement, sourceAndCodeElement);
                    detailsElement.style.opacity = '0.6';
                    detailsElement.style.paddingLeft = '6px';
                }
                else {
                    const detailsElement = dom.$0O(markerElement, $('span'));
                    detailsElement.style.opacity = '0.6';
                    detailsElement.style.paddingLeft = '6px';
                    detailsElement.innerText = source && code ? `${source}(${code})` : source ? source : `(${code})`;
                }
            }
            if ((0, arrays_1.$Jb)(relatedInformation)) {
                for (const { message, resource, startLineNumber, startColumn } of relatedInformation) {
                    const relatedInfoContainer = dom.$0O(markerElement, $('div'));
                    relatedInfoContainer.style.marginTop = '8px';
                    const a = dom.$0O(relatedInfoContainer, $('a'));
                    a.innerText = `${(0, resources_1.$fg)(resource)}(${startLineNumber}, ${startColumn}): `;
                    a.style.cursor = 'pointer';
                    disposables.add(dom.$nO(a, 'click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (this.h) {
                            this.h.open(resource, {
                                fromUserGesture: true,
                                editorOptions: { selection: { startLineNumber, startColumn } }
                            }).catch(errors_1.$Y);
                        }
                    }));
                    const messageElement = dom.$0O(relatedInfoContainer, $('span'));
                    messageElement.innerText = message;
                    this.f.applyFontInfo(messageElement);
                }
            }
            return hoverElement;
        }
        k(context, markerHover, disposables) {
            if (markerHover.marker.severity === markers_1.MarkerSeverity.Error || markerHover.marker.severity === markers_1.MarkerSeverity.Warning || markerHover.marker.severity === markers_1.MarkerSeverity.Info) {
                context.statusBar.addAction({
                    label: nls.localize(0, null),
                    commandId: gotoError_1.$e5.ID,
                    run: () => {
                        context.hide();
                        gotoError_1.$d5.get(this.f)?.showAtMarker(markerHover.marker);
                        this.f.focus();
                    }
                });
            }
            if (!this.f.getOption(90 /* EditorOption.readOnly */)) {
                const quickfixPlaceholderElement = context.statusBar.append($('div'));
                if (this.c) {
                    if (markers_1.IMarkerData.makeKey(this.c.marker) === markers_1.IMarkerData.makeKey(markerHover.marker)) {
                        if (!this.c.hasCodeActions) {
                            quickfixPlaceholderElement.textContent = nls.localize(1, null);
                        }
                    }
                    else {
                        this.c = undefined;
                    }
                }
                const updatePlaceholderDisposable = this.c && !this.c.hasCodeActions ? lifecycle_1.$kc.None : disposables.add((0, async_1.$Ig)(() => quickfixPlaceholderElement.textContent = nls.localize(2, null), 200));
                if (!quickfixPlaceholderElement.textContent) {
                    // Have some content in here to avoid flickering
                    quickfixPlaceholderElement.textContent = String.fromCharCode(0xA0); // &nbsp;
                }
                const codeActionsPromise = this.l(markerHover.marker);
                disposables.add((0, lifecycle_1.$ic)(() => codeActionsPromise.cancel()));
                codeActionsPromise.then(actions => {
                    updatePlaceholderDisposable.dispose();
                    this.c = { marker: markerHover.marker, hasCodeActions: actions.validActions.length > 0 };
                    if (!this.c.hasCodeActions) {
                        actions.dispose();
                        quickfixPlaceholderElement.textContent = nls.localize(3, null);
                        return;
                    }
                    quickfixPlaceholderElement.style.display = 'none';
                    let showing = false;
                    disposables.add((0, lifecycle_1.$ic)(() => {
                        if (!showing) {
                            actions.dispose();
                        }
                    }));
                    context.statusBar.addAction({
                        label: nls.localize(4, null),
                        commandId: codeAction_1.$B1,
                        run: (target) => {
                            showing = true;
                            const controller = codeActionController_1.$Q2.get(this.f);
                            const elementPosition = dom.$FO(target);
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
                }, errors_1.$Y);
            }
        }
        l(marker) {
            return (0, async_1.$ug)(cancellationToken => {
                return (0, codeAction_1.$I1)(this.i.codeActionProvider, this.f.getModel(), new range_1.$ks(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn), markerCodeActionTrigger, progress_1.$4u.None, cancellationToken);
            });
        }
    };
    exports.$g5 = $g5;
    exports.$g5 = $g5 = __decorate([
        __param(1, markerDecorations_1.$hW),
        __param(2, opener_1.$NT),
        __param(3, languageFeatures_1.$hF)
    ], $g5);
});
//# sourceMappingURL=markerHoverParticipant.js.map