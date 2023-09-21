/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/themables", "vs/nls!vs/editor/browser/widget/diffEditor/inlineDiffDeletedCodeMargin"], function (require, exports, dom_1, actions_1, codicons_1, lifecycle_1, platform_1, themables_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XZ = void 0;
    class $XZ extends lifecycle_1.$kc {
        get visibility() {
            return this.b;
        }
        set visibility(_visibility) {
            if (this.b !== _visibility) {
                this.b = _visibility;
                this.a.style.visibility = _visibility ? 'visible' : 'hidden';
            }
        }
        constructor(c, f, g, h, j, m, n, r, s) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.b = false;
            // make sure the diff margin shows above overlay.
            this.f.style.zIndex = '10';
            this.a = document.createElement('div');
            this.a.className = themables_1.ThemeIcon.asClassName(codicons_1.$Pj.lightBulb) + ' lightbulb-glyph';
            this.a.style.position = 'absolute';
            const lineHeight = this.g.getOption(66 /* EditorOption.lineHeight */);
            this.a.style.right = '0px';
            this.a.style.visibility = 'hidden';
            this.a.style.height = `${lineHeight}px`;
            this.a.style.lineHeight = `${lineHeight}px`;
            this.f.appendChild(this.a);
            let currentLineNumberOffset = 0;
            const useShadowDOM = g.getOption(126 /* EditorOption.useShadowDOM */) && !platform_1.$q; // Do not use shadow dom on IOS #122035
            const showContextMenu = (x, y) => {
                this.r.showContextMenu({
                    domForShadowRoot: useShadowDOM ? g.getDomNode() ?? undefined : undefined,
                    getAnchor: () => ({ x, y }),
                    getActions: () => {
                        const actions = [];
                        const isDeletion = h.modified.isEmpty;
                        // default action
                        actions.push(new actions_1.$gi('diff.clipboard.copyDeletedContent', isDeletion
                            ? (h.original.length > 1
                                ? (0, nls_1.localize)(0, null)
                                : (0, nls_1.localize)(1, null))
                            : (h.original.length > 1
                                ? (0, nls_1.localize)(2, null)
                                : (0, nls_1.localize)(3, null)), undefined, true, async () => {
                            const originalText = this.n.getValueInRange(h.original.toExclusiveRange());
                            await this.s.writeText(originalText);
                        }));
                        if (h.original.length > 1) {
                            actions.push(new actions_1.$gi('diff.clipboard.copyDeletedLineContent', isDeletion
                                ? (0, nls_1.localize)(4, null, h.original.startLineNumber + currentLineNumberOffset)
                                : (0, nls_1.localize)(5, null, h.original.startLineNumber + currentLineNumberOffset), undefined, true, async () => {
                                let lineContent = this.n.getLineContent(h.original.startLineNumber + currentLineNumberOffset);
                                if (lineContent === '') {
                                    // empty line -> new line
                                    const eof = this.n.getEndOfLineSequence();
                                    lineContent = eof === 0 /* EndOfLineSequence.LF */ ? '\n' : '\r\n';
                                }
                                await this.s.writeText(lineContent);
                            }));
                        }
                        const readOnly = g.getOption(90 /* EditorOption.readOnly */);
                        if (!readOnly) {
                            actions.push(new actions_1.$gi('diff.inline.revertChange', (0, nls_1.localize)(6, null), undefined, true, async () => {
                                this.j.revert(this.h);
                            }));
                        }
                        return actions;
                    },
                    autoSelectFirstItem: true
                });
            };
            this.B((0, dom_1.$oO)(this.a, 'mousedown', e => {
                const { top, height } = (0, dom_1.$FO)(this.a);
                const pad = Math.floor(lineHeight / 3);
                e.preventDefault();
                showContextMenu(e.posx, top + height + pad);
            }));
            this.B(g.onMouseMove((e) => {
                if ((e.target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || e.target.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */) && e.target.detail.viewZoneId === this.c()) {
                    currentLineNumberOffset = this.t(this.f, e.event.browserEvent.y, lineHeight);
                    this.visibility = true;
                }
                else {
                    this.visibility = false;
                }
            }));
            this.B(g.onMouseDown((e) => {
                if (!e.event.rightButton) {
                    return;
                }
                if (e.target.type === 8 /* MouseTargetType.CONTENT_VIEW_ZONE */ || e.target.type === 5 /* MouseTargetType.GUTTER_VIEW_ZONE */) {
                    const viewZoneId = e.target.detail.viewZoneId;
                    if (viewZoneId === this.c()) {
                        e.event.preventDefault();
                        currentLineNumberOffset = this.t(this.f, e.event.browserEvent.y, lineHeight);
                        showContextMenu(e.event.posx, e.event.posy + lineHeight);
                    }
                }
            }));
        }
        t(marginDomNode, y, lineHeight) {
            const { top } = (0, dom_1.$FO)(marginDomNode);
            const offset = y - top;
            const lineNumberOffset = Math.floor(offset / lineHeight);
            const newTop = lineNumberOffset * lineHeight;
            this.a.style.top = `${newTop}px`;
            if (this.m) {
                let acc = 0;
                for (let i = 0; i < this.m.length; i++) {
                    acc += this.m[i];
                    if (lineNumberOffset < acc) {
                        return i;
                    }
                }
            }
            return lineNumberOffset;
        }
    }
    exports.$XZ = $XZ;
});
//# sourceMappingURL=inlineDiffDeletedCodeMargin.js.map