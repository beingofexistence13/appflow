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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/color", "vs/base/common/event", "vs/base/common/objects", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/nls!vs/editor/contrib/peekView/browser/peekView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/css!./media/peekViewWidget"], function (require, exports, dom, actionbar_1, actions_1, codicons_1, themables_1, color_1, event_1, objects, editorExtensions_1, codeEditorService_1, embeddedCodeEditorWidget_1, zoneWidget_1, nls, menuEntryActionViewItem_1, contextkey_1, extensions_1, instantiation_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X3 = exports.$W3 = exports.$V3 = exports.$U3 = exports.$T3 = exports.$S3 = exports.$R3 = exports.$Q3 = exports.$P3 = exports.$O3 = exports.$N3 = exports.$M3 = exports.$L3 = exports.$K3 = exports.$J3 = exports.$I3 = exports.$H3 = exports.PeekContext = exports.$G3 = void 0;
    exports.$G3 = (0, instantiation_1.$Bh)('IPeekViewService');
    (0, extensions_1.$mr)(exports.$G3, class {
        constructor() {
            this.a = new Map();
        }
        addExclusiveWidget(editor, widget) {
            const existing = this.a.get(editor);
            if (existing) {
                existing.listener.dispose();
                existing.widget.dispose();
            }
            const remove = () => {
                const data = this.a.get(editor);
                if (data && data.widget === widget) {
                    data.listener.dispose();
                    this.a.delete(editor);
                }
            };
            this.a.set(editor, { widget, listener: widget.onDidClose(remove) });
        }
    }, 1 /* InstantiationType.Delayed */);
    var PeekContext;
    (function (PeekContext) {
        PeekContext.inPeekEditor = new contextkey_1.$2i('inReferenceSearchEditor', true, nls.localize(0, null));
        PeekContext.notInPeekEditor = PeekContext.inPeekEditor.toNegated();
    })(PeekContext || (exports.PeekContext = PeekContext = {}));
    let PeekContextController = class PeekContextController {
        static { this.ID = 'editor.contrib.referenceController'; }
        constructor(editor, contextKeyService) {
            if (editor instanceof embeddedCodeEditorWidget_1.$w3) {
                PeekContext.inPeekEditor.bindTo(contextKeyService);
            }
        }
        dispose() { }
    };
    PeekContextController = __decorate([
        __param(1, contextkey_1.$3i)
    ], PeekContextController);
    (0, editorExtensions_1.$AV)(PeekContextController.ID, PeekContextController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    function $H3(accessor) {
        const editor = accessor.get(codeEditorService_1.$nV).getFocusedCodeEditor();
        if (editor instanceof embeddedCodeEditorWidget_1.$w3) {
            return editor.getParentEditor();
        }
        return editor;
    }
    exports.$H3 = $H3;
    const defaultOptions = {
        headerBackgroundColor: color_1.$Os.white,
        primaryHeadingColor: color_1.$Os.fromHex('#333333'),
        secondaryHeadingColor: color_1.$Os.fromHex('#6c6c6cb3')
    };
    let $I3 = class $I3 extends zoneWidget_1.$z3 {
        constructor(editor, options, Q) {
            super(editor, options);
            this.Q = Q;
            this.h = new event_1.$fd();
            this.onDidClose = this.h.event;
            objects.$Ym(this.options, defaultOptions, false);
        }
        dispose() {
            if (!this.s) {
                this.s = true; // prevent consumers who dispose on onDidClose from looping
                super.dispose();
                this.h.fire(this);
            }
        }
        style(styles) {
            const options = this.options;
            if (styles.headerBackgroundColor) {
                options.headerBackgroundColor = styles.headerBackgroundColor;
            }
            if (styles.primaryHeadingColor) {
                options.primaryHeadingColor = styles.primaryHeadingColor;
            }
            if (styles.secondaryHeadingColor) {
                options.secondaryHeadingColor = styles.secondaryHeadingColor;
            }
            super.style(styles);
        }
        q() {
            super.q();
            const options = this.options;
            if (this.J && options.headerBackgroundColor) {
                this.J.style.backgroundColor = options.headerBackgroundColor.toString();
            }
            if (this.L && options.primaryHeadingColor) {
                this.L.style.color = options.primaryHeadingColor.toString();
            }
            if (this.M && options.secondaryHeadingColor) {
                this.M.style.color = options.secondaryHeadingColor.toString();
            }
            if (this.P && options.frameColor) {
                this.P.style.borderColor = options.frameColor.toString();
            }
        }
        E(container) {
            this.D('peekview-widget');
            this.J = dom.$('.head');
            this.P = dom.$('.body');
            this.U(this.J);
            this.Y(this.P);
            container.appendChild(this.J);
            container.appendChild(this.P);
        }
        U(container, noCloseAction) {
            this.K = dom.$('.peekview-title');
            if (this.options.supportOnTitleClick) {
                this.K.classList.add('clickable');
                dom.$oO(this.K, 'click', event => this.X(event));
            }
            dom.$0O(this.J, this.K);
            this.V(this.K);
            this.L = dom.$('span.filename');
            this.M = dom.$('span.dirname');
            this.N = dom.$('span.meta');
            dom.$0O(this.K, this.L, this.M, this.N);
            const actionsContainer = dom.$('.peekview-actions');
            dom.$0O(this.J, actionsContainer);
            const actionBarOptions = this.W();
            this.O = new actionbar_1.$1P(actionsContainer, actionBarOptions);
            this.o.add(this.O);
            if (!noCloseAction) {
                this.O.push(new actions_1.$gi('peekview.close', nls.localize(1, null), themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close), true, () => {
                    this.dispose();
                    return Promise.resolve();
                }), { label: false, icon: true });
            }
        }
        V(container) {
        }
        W() {
            return {
                actionViewItemProvider: menuEntryActionViewItem_1.$F3.bind(undefined, this.Q),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */
            };
        }
        X(event) {
            // implement me if supportOnTitleClick option is set
        }
        setTitle(primaryHeading, secondaryHeading) {
            if (this.L && this.M) {
                this.L.innerText = primaryHeading;
                this.L.setAttribute('title', primaryHeading);
                if (secondaryHeading) {
                    this.M.innerText = secondaryHeading;
                }
                else {
                    dom.$lO(this.M);
                }
            }
        }
        setMetaTitle(value) {
            if (this.N) {
                if (value) {
                    this.N.innerText = value;
                    dom.$dP(this.N);
                }
                else {
                    dom.$eP(this.N);
                }
            }
        }
        G(heightInPixel, widthInPixel) {
            if (!this.z && heightInPixel < 0) {
                // Looks like the view zone got folded away!
                this.dispose();
                return;
            }
            const headHeight = Math.ceil(this.editor.getOption(66 /* EditorOption.lineHeight */) * 1.2);
            const bodyHeight = Math.round(heightInPixel - (headHeight + 2 /* the border-top/bottom width*/));
            this.ab(headHeight, widthInPixel);
            this.bb(bodyHeight, widthInPixel);
        }
        ab(heightInPixel, widthInPixel) {
            if (this.J) {
                this.J.style.height = `${heightInPixel}px`;
                this.J.style.lineHeight = this.J.style.height;
            }
        }
        bb(heightInPixel, widthInPixel) {
            if (this.P) {
                this.P.style.height = `${heightInPixel}px`;
            }
        }
    };
    exports.$I3 = $I3;
    exports.$I3 = $I3 = __decorate([
        __param(2, instantiation_1.$Ah)
    ], $I3);
    exports.$J3 = (0, colorRegistry_1.$sv)('peekViewTitle.background', { dark: '#252526', light: '#F3F3F3', hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(2, null));
    exports.$K3 = (0, colorRegistry_1.$sv)('peekViewTitleLabel.foreground', { dark: color_1.$Os.white, light: color_1.$Os.black, hcDark: color_1.$Os.white, hcLight: colorRegistry_1.$xw }, nls.localize(3, null));
    exports.$L3 = (0, colorRegistry_1.$sv)('peekViewTitleDescription.foreground', { dark: '#ccccccb3', light: '#616161', hcDark: '#FFFFFF99', hcLight: '#292929' }, nls.localize(4, null));
    exports.$M3 = (0, colorRegistry_1.$sv)('peekView.border', { dark: colorRegistry_1.$rw, light: colorRegistry_1.$rw, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(5, null));
    exports.$N3 = (0, colorRegistry_1.$sv)('peekViewResult.background', { dark: '#252526', light: '#F3F3F3', hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(6, null));
    exports.$O3 = (0, colorRegistry_1.$sv)('peekViewResult.lineForeground', { dark: '#bbbbbb', light: '#646465', hcDark: color_1.$Os.white, hcLight: colorRegistry_1.$xw }, nls.localize(7, null));
    exports.$P3 = (0, colorRegistry_1.$sv)('peekViewResult.fileForeground', { dark: color_1.$Os.white, light: '#1E1E1E', hcDark: color_1.$Os.white, hcLight: colorRegistry_1.$xw }, nls.localize(8, null));
    exports.$Q3 = (0, colorRegistry_1.$sv)('peekViewResult.selectionBackground', { dark: '#3399ff33', light: '#3399ff33', hcDark: null, hcLight: null }, nls.localize(9, null));
    exports.$R3 = (0, colorRegistry_1.$sv)('peekViewResult.selectionForeground', { dark: color_1.$Os.white, light: '#6C6C6C', hcDark: color_1.$Os.white, hcLight: colorRegistry_1.$xw }, nls.localize(10, null));
    exports.$S3 = (0, colorRegistry_1.$sv)('peekViewEditor.background', { dark: '#001F33', light: '#F2F8FC', hcDark: color_1.$Os.black, hcLight: color_1.$Os.white }, nls.localize(11, null));
    exports.$T3 = (0, colorRegistry_1.$sv)('peekViewEditorGutter.background', { dark: exports.$S3, light: exports.$S3, hcDark: exports.$S3, hcLight: exports.$S3 }, nls.localize(12, null));
    exports.$U3 = (0, colorRegistry_1.$sv)('peekViewEditorStickyScroll.background', { dark: exports.$S3, light: exports.$S3, hcDark: exports.$S3, hcLight: exports.$S3 }, nls.localize(13, null));
    exports.$V3 = (0, colorRegistry_1.$sv)('peekViewResult.matchHighlightBackground', { dark: '#ea5c004d', light: '#ea5c004d', hcDark: null, hcLight: null }, nls.localize(14, null));
    exports.$W3 = (0, colorRegistry_1.$sv)('peekViewEditor.matchHighlightBackground', { dark: '#ff8f0099', light: '#f5d802de', hcDark: null, hcLight: null }, nls.localize(15, null));
    exports.$X3 = (0, colorRegistry_1.$sv)('peekViewEditor.matchHighlightBorder', { dark: null, light: null, hcDark: colorRegistry_1.$Bv, hcLight: colorRegistry_1.$Bv }, nls.localize(16, null));
});
//# sourceMappingURL=peekView.js.map