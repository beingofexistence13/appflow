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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/themables", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/platform/instantiation/common/instantiation", "vs/css!./inlineProgressWidget"], function (require, exports, dom, async_1, codicons_1, lifecycle_1, strings_1, themables_1, range_1, textModel_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$e7 = void 0;
    const inlineProgressDecoration = textModel_1.$RC.register({
        description: 'inline-progress-widget',
        stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
        showIfCollapsed: true,
        after: {
            content: strings_1.$gf,
            inlineClassName: 'inline-editor-progress-decoration',
            inlineClassNameAffectsLetterSpacing: true,
        }
    });
    class InlineProgressWidget extends lifecycle_1.$kc {
        static { this.a = 'editor.widget.inlineProgressWidget'; }
        constructor(f, g, h, title, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.allowEditorOverflow = false;
            this.suppressMouseDown = true;
            this.m(title);
            this.g.addContentWidget(this);
            this.g.layoutContentWidget(this);
        }
        m(title) {
            this.b = dom.$('.inline-progress-widget');
            this.b.role = 'button';
            this.b.title = title;
            const iconElement = dom.$('span.icon');
            this.b.append(iconElement);
            iconElement.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.loading), 'codicon-modifier-spin');
            const updateSize = () => {
                const lineHeight = this.g.getOption(66 /* EditorOption.lineHeight */);
                this.b.style.height = `${lineHeight}px`;
                this.b.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
            };
            updateSize();
            this.B(this.g.onDidChangeConfiguration(c => {
                if (c.hasChanged(52 /* EditorOption.fontSize */) || c.hasChanged(66 /* EditorOption.lineHeight */)) {
                    updateSize();
                }
            }));
            this.B(dom.$nO(this.b, dom.$3O.CLICK, e => {
                this.j.cancel();
            }));
        }
        getId() {
            return InlineProgressWidget.a + '.' + this.f;
        }
        getDomNode() {
            return this.b;
        }
        getPosition() {
            return {
                position: { lineNumber: this.h.startLineNumber, column: this.h.startColumn },
                preference: [0 /* ContentWidgetPositionPreference.EXACT */]
            };
        }
        dispose() {
            super.dispose();
            this.g.removeContentWidget(this);
        }
    }
    let $e7 = class $e7 extends lifecycle_1.$kc {
        constructor(id, m, n) {
            super();
            this.id = id;
            this.m = m;
            this.n = n;
            /** Delay before showing the progress widget */
            this.a = 500; // ms
            this.b = this.B(new lifecycle_1.$lc());
            this.g = new lifecycle_1.$lc();
            this.h = 0;
            this.f = m.createDecorationsCollection();
        }
        async showWhile(position, title, promise) {
            const operationId = this.h++;
            this.j = operationId;
            this.r();
            this.b.value = (0, async_1.$Ig)(() => {
                const range = range_1.$ks.fromPositions(position);
                const decorationIds = this.f.set([{
                        range: range,
                        options: inlineProgressDecoration,
                    }]);
                if (decorationIds.length > 0) {
                    this.g.value = this.n.createInstance(InlineProgressWidget, this.id, this.m, range, title, promise);
                }
            }, this.a);
            try {
                return await promise;
            }
            finally {
                if (this.j === operationId) {
                    this.r();
                    this.j = undefined;
                }
            }
        }
        r() {
            this.b.clear();
            this.f.clear();
            this.g.clear();
        }
    };
    exports.$e7 = $e7;
    exports.$e7 = $e7 = __decorate([
        __param(2, instantiation_1.$Ah)
    ], $e7);
});
//# sourceMappingURL=inlineProgress.js.map