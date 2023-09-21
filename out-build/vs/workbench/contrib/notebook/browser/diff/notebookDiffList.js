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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/browser/diff/diffComponents", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/notification/common/notification", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/editor/common/config/fontInfo", "vs/base/browser/browser", "vs/platform/actions/browser/toolbar", "vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions", "vs/platform/accessibility/common/accessibility", "vs/css!./notebookDiff"], function (require, exports, DOM, listWidget_1, lifecycle_1, configuration_1, contextkey_1, instantiation_1, keybinding_1, listService_1, themeService_1, notebookDiffEditorBrowser_1, diffComponents_1, codeEditorWidget_1, diffEditorWidget_1, actions_1, contextView_1, notification_1, cellActionView_1, fontInfo_1, browser_1, toolbar_1, diffCellEditorOptions_1, accessibility_1) {
    "use strict";
    var $VEb_1, $WEb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YEb = exports.$XEb = exports.$WEb = exports.$VEb = exports.$UEb = void 0;
    let $UEb = class $UEb {
        constructor(b) {
            this.b = b;
            const editorOptions = this.b.getValue('editor');
            this.a = fontInfo_1.$Rr.createFromRawSettings(editorOptions, browser_1.$WN.value).lineHeight;
        }
        getHeight(element) {
            return element.getHeight(this.a);
        }
        hasDynamicHeight(element) {
            return false;
        }
        getTemplateId(element) {
            switch (element.type) {
                case 'delete':
                case 'insert':
                    return $VEb.TEMPLATE_ID;
                case 'modified':
                case 'unchanged':
                    return $WEb.TEMPLATE_ID;
            }
        }
    };
    exports.$UEb = $UEb;
    exports.$UEb = $UEb = __decorate([
        __param(0, configuration_1.$8h)
    ], $UEb);
    let $VEb = class $VEb {
        static { $VEb_1 = this; }
        static { this.TEMPLATE_ID = 'cell_diff_single'; }
        constructor(notebookEditor, a) {
            this.notebookEditor = notebookEditor;
            this.a = a;
        }
        get templateId() {
            return $VEb_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const body = DOM.$('.cell-body');
            DOM.$0O(container, body);
            const diffEditorContainer = DOM.$('.cell-diff-editor-container');
            DOM.$0O(body, diffEditorContainer);
            const diagonalFill = DOM.$0O(body, DOM.$('.diagonal-fill'));
            const sourceContainer = DOM.$0O(diffEditorContainer, DOM.$('.source-container'));
            const editor = this.b(sourceContainer);
            const metadataHeaderContainer = DOM.$0O(diffEditorContainer, DOM.$('.metadata-header-container'));
            const metadataInfoContainer = DOM.$0O(diffEditorContainer, DOM.$('.metadata-info-container'));
            const outputHeaderContainer = DOM.$0O(diffEditorContainer, DOM.$('.output-header-container'));
            const outputInfoContainer = DOM.$0O(diffEditorContainer, DOM.$('.output-info-container'));
            const borderContainer = DOM.$0O(body, DOM.$('.border-container'));
            const leftBorder = DOM.$0O(borderContainer, DOM.$('.left-border'));
            const rightBorder = DOM.$0O(borderContainer, DOM.$('.right-border'));
            const topBorder = DOM.$0O(borderContainer, DOM.$('.top-border'));
            const bottomBorder = DOM.$0O(borderContainer, DOM.$('.bottom-border'));
            return {
                body,
                container,
                diffEditorContainer,
                diagonalFill,
                sourceEditor: editor,
                metadataHeaderContainer,
                metadataInfoContainer,
                outputHeaderContainer,
                outputInfoContainer,
                leftBorder,
                rightBorder,
                topBorder,
                bottomBorder,
                elementDisposables: new lifecycle_1.$jc()
            };
        }
        b(sourceContainer) {
            const editorContainer = DOM.$0O(sourceContainer, DOM.$('.editor-container'));
            const editor = this.a.createInstance(codeEditorWidget_1.$uY, editorContainer, {
                ...diffCellEditorOptions_1.$wEb,
                dimension: {
                    width: (this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.$yEb) / 2 - 18,
                    height: 0
                },
                automaticLayout: false,
                overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
            }, {});
            return editor;
        }
        renderElement(element, index, templateData, height) {
            templateData.body.classList.remove('left', 'right', 'full');
            switch (element.type) {
                case 'delete':
                    templateData.elementDisposables.add(this.a.createInstance(diffComponents_1.$REb, this.notebookEditor, element, templateData));
                    return;
                case 'insert':
                    templateData.elementDisposables.add(this.a.createInstance(diffComponents_1.$SEb, this.notebookEditor, element, templateData));
                    return;
                default:
                    break;
            }
        }
        disposeTemplate(templateData) {
            templateData.container.innerText = '';
            templateData.sourceEditor.dispose();
            templateData.elementDisposables.dispose();
        }
        disposeElement(element, index, templateData) {
            templateData.elementDisposables.clear();
        }
    };
    exports.$VEb = $VEb;
    exports.$VEb = $VEb = $VEb_1 = __decorate([
        __param(1, instantiation_1.$Ah)
    ], $VEb);
    let $WEb = class $WEb {
        static { $WEb_1 = this; }
        static { this.TEMPLATE_ID = 'cell_diff_side_by_side'; }
        constructor(notebookEditor, a, b, c, d, f, g, h, i) {
            this.notebookEditor = notebookEditor;
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
        }
        get templateId() {
            return $WEb_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const body = DOM.$('.cell-body');
            DOM.$0O(container, body);
            const diffEditorContainer = DOM.$('.cell-diff-editor-container');
            DOM.$0O(body, diffEditorContainer);
            const sourceContainer = DOM.$0O(diffEditorContainer, DOM.$('.source-container'));
            const { editor, editorContainer } = this.j(sourceContainer);
            const inputToolbarContainer = DOM.$0O(sourceContainer, DOM.$('.editor-input-toolbar-container'));
            const cellToolbarContainer = DOM.$0O(inputToolbarContainer, DOM.$('div.property-toolbar'));
            const toolbar = this.a.createInstance(toolbar_1.$L6, cellToolbarContainer, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.$Vu) {
                        const item = new cellActionView_1.$lpb(action, undefined, this.c, this.g, this.f, this.h, this.b, this.i);
                        return item;
                    }
                    return undefined;
                }
            });
            const metadataHeaderContainer = DOM.$0O(diffEditorContainer, DOM.$('.metadata-header-container'));
            const metadataInfoContainer = DOM.$0O(diffEditorContainer, DOM.$('.metadata-info-container'));
            const outputHeaderContainer = DOM.$0O(diffEditorContainer, DOM.$('.output-header-container'));
            const outputInfoContainer = DOM.$0O(diffEditorContainer, DOM.$('.output-info-container'));
            const borderContainer = DOM.$0O(body, DOM.$('.border-container'));
            const leftBorder = DOM.$0O(borderContainer, DOM.$('.left-border'));
            const rightBorder = DOM.$0O(borderContainer, DOM.$('.right-border'));
            const topBorder = DOM.$0O(borderContainer, DOM.$('.top-border'));
            const bottomBorder = DOM.$0O(borderContainer, DOM.$('.bottom-border'));
            return {
                body,
                container,
                diffEditorContainer,
                sourceEditor: editor,
                editorContainer,
                inputToolbarContainer,
                toolbar,
                metadataHeaderContainer,
                metadataInfoContainer,
                outputHeaderContainer,
                outputInfoContainer,
                leftBorder,
                rightBorder,
                topBorder,
                bottomBorder,
                elementDisposables: new lifecycle_1.$jc()
            };
        }
        j(sourceContainer) {
            const editorContainer = DOM.$0O(sourceContainer, DOM.$('.editor-container'));
            const editor = this.a.createInstance(diffEditorWidget_1.$6Z, editorContainer, {
                ...diffCellEditorOptions_1.$xEb,
                padding: {
                    top: 24,
                    bottom: 12
                },
                overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                originalEditable: false,
                ignoreTrimWhitespace: false,
                automaticLayout: false,
                dimension: {
                    height: 0,
                    width: 0
                }
            }, {
                originalEditor: (0, diffComponents_1.$QEb)(),
                modifiedEditor: (0, diffComponents_1.$QEb)()
            });
            return {
                editor,
                editorContainer
            };
        }
        renderElement(element, index, templateData, height) {
            templateData.body.classList.remove('left', 'right', 'full');
            switch (element.type) {
                case 'unchanged':
                    templateData.elementDisposables.add(this.a.createInstance(diffComponents_1.$TEb, this.notebookEditor, element, templateData));
                    return;
                case 'modified':
                    templateData.elementDisposables.add(this.a.createInstance(diffComponents_1.$TEb, this.notebookEditor, element, templateData));
                    return;
                default:
                    break;
            }
        }
        disposeTemplate(templateData) {
            templateData.container.innerText = '';
            templateData.sourceEditor.dispose();
            templateData.toolbar?.dispose();
            templateData.elementDisposables.dispose();
        }
        disposeElement(element, index, templateData) {
            if (templateData.toolbar) {
                templateData.toolbar.context = undefined;
            }
            templateData.elementDisposables.clear();
        }
    };
    exports.$WEb = $WEb;
    exports.$WEb = $WEb = $WEb_1 = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, contextView_1.$WZ),
        __param(3, keybinding_1.$2D),
        __param(4, actions_1.$Su),
        __param(5, contextkey_1.$3i),
        __param(6, notification_1.$Yu),
        __param(7, themeService_1.$gv),
        __param(8, accessibility_1.$1r)
    ], $WEb);
    class $XEb extends listWidget_1.$tQ {
        u(e) {
            if ((0, listWidget_1.$oQ)(e.browserEvent.target)) {
                const focus = typeof e.index === 'undefined' ? [] : [e.index];
                this.k.setFocus(focus, e.browserEvent);
            }
            else {
                super.u(e);
            }
        }
    }
    exports.$XEb = $XEb;
    let $YEb = class $YEb extends listService_1.$p4 {
        get rowsContainer() {
            return this.k.containerDomNode;
        }
        constructor(listUser, container, delegate, renderers, contextKeyService, options, listService, configurationService, instantiationService) {
            super(listUser, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService);
        }
        D(options) {
            return new $XEb(this);
        }
        getCellViewScrollTop(element) {
            const index = this.indexOf(element);
            // if (index === undefined || index < 0 || index >= this.length) {
            // 	this._getViewIndexUpperBound(element);
            // 	throw new ListError(this.listUser, `Invalid index ${index}`);
            // }
            return this.k.elementTop(index);
        }
        getScrollHeight() {
            return this.k.scrollHeight;
        }
        triggerScrollFromMouseWheelEvent(browserEvent) {
            this.k.delegateScrollFromMouseWheelEvent(browserEvent);
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.k.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        clear() {
            super.splice(0, this.length);
        }
        updateElementHeight2(element, size) {
            const viewIndex = this.indexOf(element);
            const focused = this.getFocus();
            this.k.updateElementHeight(viewIndex, size, focused.length ? focused[0] : null);
        }
        style(styles) {
            const selectorSuffix = this.k.domId;
            if (!this.p) {
                this.p = DOM.$XO(this.k.domNode);
            }
            const suffix = selectorSuffix && `.${selectorSuffix}`;
            const content = [];
            if (styles.listBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
            }
            if (styles.listFocusBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listFocusAndSelectionBackground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
            }
            if (styles.listFocusAndSelectionForeground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
            }
            if (styles.listInactiveFocusBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
            }
            if (styles.listSelectionOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listFocusOutline) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
            }
            if (styles.listInactiveFocusOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            if (styles.listDropBackground) {
                content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropBackground} !important; color: inherit !important; }
			`);
            }
            const newStyles = content.join('\n');
            if (newStyles !== this.p.textContent) {
                this.p.textContent = newStyles;
            }
        }
    };
    exports.$YEb = $YEb;
    exports.$YEb = $YEb = __decorate([
        __param(6, listService_1.$03),
        __param(7, configuration_1.$8h),
        __param(8, instantiation_1.$Ah)
    ], $YEb);
});
//# sourceMappingURL=notebookDiffList.js.map