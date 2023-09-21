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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "vs/base/common/cancellation", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/event", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider"], function (require, exports, lifecycle_1, languageFeatures_1, cancellation_1, async_1, arrays_1, event_1, languageConfigurationRegistry_1, stickyScrollModelProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T0 = exports.$S0 = void 0;
    class $S0 {
        constructor(startLineNumber, endLineNumber, nestingDepth) {
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
            this.nestingDepth = nestingDepth;
        }
    }
    exports.$S0 = $S0;
    let $T0 = class $T0 extends lifecycle_1.$kc {
        static { this.ID = 'store.contrib.stickyScrollController'; }
        constructor(editor, s, t) {
            super();
            this.s = s;
            this.t = t;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeStickyScroll = this.c.event;
            this.j = null;
            this.m = null;
            this.n = null;
            this.r = null;
            this.f = editor;
            this.h = this.B(new lifecycle_1.$jc());
            this.g = this.B(new async_1.$Sg(() => this.update(), 50));
            this.B(this.f.onDidChangeConfiguration(e => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)) {
                    this.u();
                }
            }));
            this.u();
        }
        u() {
            this.r = null;
            this.h.clear();
            this.j = this.f.getOption(114 /* EditorOption.stickyScroll */);
            if (!this.j.enabled) {
                return;
            }
            this.r = this.h.add(new stickyScrollModelProvider_1.$R0(this.f, this.t, this.s, this.j.defaultModel));
            this.h.add(this.f.onDidChangeModel(() => {
                // We should not show an old model for a different file, it will always be wrong.
                // So we clear the model here immediately and then trigger an update.
                this.m = null;
                this.c.fire();
                this.update();
            }));
            this.h.add(this.f.onDidChangeHiddenAreas(() => this.update()));
            this.h.add(this.f.onDidChangeModelContent(() => this.g.schedule()));
            this.h.add(this.s.documentSymbolProvider.onDidChange(() => this.update()));
            this.update();
        }
        getVersionId() {
            return this.m?.version;
        }
        async update() {
            this.n?.dispose(true);
            this.n = new cancellation_1.$pd();
            await this.w(this.n.token);
            this.c.fire();
        }
        async w(token) {
            if (!this.f.hasModel() || !this.r || this.f.getModel().isTooLargeForTokenization()) {
                this.m = null;
                return;
            }
            const textModel = this.f.getModel();
            const modelVersionId = textModel.getVersionId();
            const model = await this.r.update(textModel, modelVersionId, token);
            if (token.isCancellationRequested) {
                // the computation was canceled, so do not overwrite the model
                return;
            }
            this.m = model;
        }
        y(index) {
            if (index === -1) {
                index = 0;
            }
            else if (index < 0) {
                index = -index - 2;
            }
            return index;
        }
        getCandidateStickyLinesIntersectingFromStickyModel(range, outlineModel, result, depth, lastStartLineNumber) {
            if (outlineModel.children.length === 0) {
                return;
            }
            let lastLine = lastStartLineNumber;
            const childrenStartLines = [];
            for (let i = 0; i < outlineModel.children.length; i++) {
                const child = outlineModel.children[i];
                if (child.range) {
                    childrenStartLines.push(child.range.startLineNumber);
                }
            }
            const lowerBound = this.y((0, arrays_1.$ub)(childrenStartLines, range.startLineNumber, (a, b) => { return a - b; }));
            const upperBound = this.y((0, arrays_1.$ub)(childrenStartLines, range.startLineNumber + depth, (a, b) => { return a - b; }));
            for (let i = lowerBound; i <= upperBound; i++) {
                const child = outlineModel.children[i];
                if (!child) {
                    return;
                }
                if (child.range) {
                    const childStartLine = child.range.startLineNumber;
                    const childEndLine = child.range.endLineNumber;
                    if (range.startLineNumber <= childEndLine + 1 && childStartLine - 1 <= range.endLineNumber && childStartLine !== lastLine) {
                        lastLine = childStartLine;
                        result.push(new $S0(childStartLine, childEndLine - 1, depth + 1));
                        this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth + 1, childStartLine);
                    }
                }
                else {
                    this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth, lastStartLineNumber);
                }
            }
        }
        getCandidateStickyLinesIntersecting(range) {
            if (!this.m?.element) {
                return [];
            }
            let stickyLineCandidates = [];
            this.getCandidateStickyLinesIntersectingFromStickyModel(range, this.m.element, stickyLineCandidates, 0, -1);
            const hiddenRanges = this.f._getViewModel()?.getHiddenAreas();
            if (hiddenRanges) {
                for (const hiddenRange of hiddenRanges) {
                    stickyLineCandidates = stickyLineCandidates.filter(stickyLine => !(stickyLine.startLineNumber >= hiddenRange.startLineNumber && stickyLine.endLineNumber <= hiddenRange.endLineNumber + 1));
                }
            }
            return stickyLineCandidates;
        }
    };
    exports.$T0 = $T0;
    exports.$T0 = $T0 = __decorate([
        __param(1, languageFeatures_1.$hF),
        __param(2, languageConfigurationRegistry_1.$2t)
    ], $T0);
});
//# sourceMappingURL=stickyScrollProvider.js.map