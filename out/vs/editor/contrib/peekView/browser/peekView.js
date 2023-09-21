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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/color", "vs/base/common/event", "vs/base/common/objects", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/css!./media/peekViewWidget"], function (require, exports, dom, actionbar_1, actions_1, codicons_1, themables_1, color_1, event_1, objects, editorExtensions_1, codeEditorService_1, embeddedCodeEditorWidget_1, zoneWidget_1, nls, menuEntryActionViewItem_1, contextkey_1, extensions_1, instantiation_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.peekViewEditorMatchHighlightBorder = exports.peekViewEditorMatchHighlight = exports.peekViewResultsMatchHighlight = exports.peekViewEditorStickyScrollBackground = exports.peekViewEditorGutterBackground = exports.peekViewEditorBackground = exports.peekViewResultsSelectionForeground = exports.peekViewResultsSelectionBackground = exports.peekViewResultsFileForeground = exports.peekViewResultsMatchForeground = exports.peekViewResultsBackground = exports.peekViewBorder = exports.peekViewTitleInfoForeground = exports.peekViewTitleForeground = exports.peekViewTitleBackground = exports.PeekViewWidget = exports.getOuterEditor = exports.PeekContext = exports.IPeekViewService = void 0;
    exports.IPeekViewService = (0, instantiation_1.createDecorator)('IPeekViewService');
    (0, extensions_1.registerSingleton)(exports.IPeekViewService, class {
        constructor() {
            this._widgets = new Map();
        }
        addExclusiveWidget(editor, widget) {
            const existing = this._widgets.get(editor);
            if (existing) {
                existing.listener.dispose();
                existing.widget.dispose();
            }
            const remove = () => {
                const data = this._widgets.get(editor);
                if (data && data.widget === widget) {
                    data.listener.dispose();
                    this._widgets.delete(editor);
                }
            };
            this._widgets.set(editor, { widget, listener: widget.onDidClose(remove) });
        }
    }, 1 /* InstantiationType.Delayed */);
    var PeekContext;
    (function (PeekContext) {
        PeekContext.inPeekEditor = new contextkey_1.RawContextKey('inReferenceSearchEditor', true, nls.localize('inReferenceSearchEditor', "Whether the current code editor is embedded inside peek"));
        PeekContext.notInPeekEditor = PeekContext.inPeekEditor.toNegated();
    })(PeekContext || (exports.PeekContext = PeekContext = {}));
    let PeekContextController = class PeekContextController {
        static { this.ID = 'editor.contrib.referenceController'; }
        constructor(editor, contextKeyService) {
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                PeekContext.inPeekEditor.bindTo(contextKeyService);
            }
        }
        dispose() { }
    };
    PeekContextController = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], PeekContextController);
    (0, editorExtensions_1.registerEditorContribution)(PeekContextController.ID, PeekContextController, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to define a context key
    function getOuterEditor(accessor) {
        const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
        if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
            return editor.getParentEditor();
        }
        return editor;
    }
    exports.getOuterEditor = getOuterEditor;
    const defaultOptions = {
        headerBackgroundColor: color_1.Color.white,
        primaryHeadingColor: color_1.Color.fromHex('#333333'),
        secondaryHeadingColor: color_1.Color.fromHex('#6c6c6cb3')
    };
    let PeekViewWidget = class PeekViewWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, options, instantiationService) {
            super(editor, options);
            this.instantiationService = instantiationService;
            this._onDidClose = new event_1.Emitter();
            this.onDidClose = this._onDidClose.event;
            objects.mixin(this.options, defaultOptions, false);
        }
        dispose() {
            if (!this.disposed) {
                this.disposed = true; // prevent consumers who dispose on onDidClose from looping
                super.dispose();
                this._onDidClose.fire(this);
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
        _applyStyles() {
            super._applyStyles();
            const options = this.options;
            if (this._headElement && options.headerBackgroundColor) {
                this._headElement.style.backgroundColor = options.headerBackgroundColor.toString();
            }
            if (this._primaryHeading && options.primaryHeadingColor) {
                this._primaryHeading.style.color = options.primaryHeadingColor.toString();
            }
            if (this._secondaryHeading && options.secondaryHeadingColor) {
                this._secondaryHeading.style.color = options.secondaryHeadingColor.toString();
            }
            if (this._bodyElement && options.frameColor) {
                this._bodyElement.style.borderColor = options.frameColor.toString();
            }
        }
        _fillContainer(container) {
            this.setCssClass('peekview-widget');
            this._headElement = dom.$('.head');
            this._bodyElement = dom.$('.body');
            this._fillHead(this._headElement);
            this._fillBody(this._bodyElement);
            container.appendChild(this._headElement);
            container.appendChild(this._bodyElement);
        }
        _fillHead(container, noCloseAction) {
            this._titleElement = dom.$('.peekview-title');
            if (this.options.supportOnTitleClick) {
                this._titleElement.classList.add('clickable');
                dom.addStandardDisposableListener(this._titleElement, 'click', event => this._onTitleClick(event));
            }
            dom.append(this._headElement, this._titleElement);
            this._fillTitleIcon(this._titleElement);
            this._primaryHeading = dom.$('span.filename');
            this._secondaryHeading = dom.$('span.dirname');
            this._metaHeading = dom.$('span.meta');
            dom.append(this._titleElement, this._primaryHeading, this._secondaryHeading, this._metaHeading);
            const actionsContainer = dom.$('.peekview-actions');
            dom.append(this._headElement, actionsContainer);
            const actionBarOptions = this._getActionBarOptions();
            this._actionbarWidget = new actionbar_1.ActionBar(actionsContainer, actionBarOptions);
            this._disposables.add(this._actionbarWidget);
            if (!noCloseAction) {
                this._actionbarWidget.push(new actions_1.Action('peekview.close', nls.localize('label.close', "Close"), themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close), true, () => {
                    this.dispose();
                    return Promise.resolve();
                }), { label: false, icon: true });
            }
        }
        _fillTitleIcon(container) {
        }
        _getActionBarOptions() {
            return {
                actionViewItemProvider: menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService),
                orientation: 0 /* ActionsOrientation.HORIZONTAL */
            };
        }
        _onTitleClick(event) {
            // implement me if supportOnTitleClick option is set
        }
        setTitle(primaryHeading, secondaryHeading) {
            if (this._primaryHeading && this._secondaryHeading) {
                this._primaryHeading.innerText = primaryHeading;
                this._primaryHeading.setAttribute('title', primaryHeading);
                if (secondaryHeading) {
                    this._secondaryHeading.innerText = secondaryHeading;
                }
                else {
                    dom.clearNode(this._secondaryHeading);
                }
            }
        }
        setMetaTitle(value) {
            if (this._metaHeading) {
                if (value) {
                    this._metaHeading.innerText = value;
                    dom.show(this._metaHeading);
                }
                else {
                    dom.hide(this._metaHeading);
                }
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            if (!this._isShowing && heightInPixel < 0) {
                // Looks like the view zone got folded away!
                this.dispose();
                return;
            }
            const headHeight = Math.ceil(this.editor.getOption(66 /* EditorOption.lineHeight */) * 1.2);
            const bodyHeight = Math.round(heightInPixel - (headHeight + 2 /* the border-top/bottom width*/));
            this._doLayoutHead(headHeight, widthInPixel);
            this._doLayoutBody(bodyHeight, widthInPixel);
        }
        _doLayoutHead(heightInPixel, widthInPixel) {
            if (this._headElement) {
                this._headElement.style.height = `${heightInPixel}px`;
                this._headElement.style.lineHeight = this._headElement.style.height;
            }
        }
        _doLayoutBody(heightInPixel, widthInPixel) {
            if (this._bodyElement) {
                this._bodyElement.style.height = `${heightInPixel}px`;
            }
        }
    };
    exports.PeekViewWidget = PeekViewWidget;
    exports.PeekViewWidget = PeekViewWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], PeekViewWidget);
    exports.peekViewTitleBackground = (0, colorRegistry_1.registerColor)('peekViewTitle.background', { dark: '#252526', light: '#F3F3F3', hcDark: color_1.Color.black, hcLight: color_1.Color.white }, nls.localize('peekViewTitleBackground', 'Background color of the peek view title area.'));
    exports.peekViewTitleForeground = (0, colorRegistry_1.registerColor)('peekViewTitleLabel.foreground', { dark: color_1.Color.white, light: color_1.Color.black, hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewTitleForeground', 'Color of the peek view title.'));
    exports.peekViewTitleInfoForeground = (0, colorRegistry_1.registerColor)('peekViewTitleDescription.foreground', { dark: '#ccccccb3', light: '#616161', hcDark: '#FFFFFF99', hcLight: '#292929' }, nls.localize('peekViewTitleInfoForeground', 'Color of the peek view title info.'));
    exports.peekViewBorder = (0, colorRegistry_1.registerColor)('peekView.border', { dark: colorRegistry_1.editorInfoForeground, light: colorRegistry_1.editorInfoForeground, hcDark: colorRegistry_1.contrastBorder, hcLight: colorRegistry_1.contrastBorder }, nls.localize('peekViewBorder', 'Color of the peek view borders and arrow.'));
    exports.peekViewResultsBackground = (0, colorRegistry_1.registerColor)('peekViewResult.background', { dark: '#252526', light: '#F3F3F3', hcDark: color_1.Color.black, hcLight: color_1.Color.white }, nls.localize('peekViewResultsBackground', 'Background color of the peek view result list.'));
    exports.peekViewResultsMatchForeground = (0, colorRegistry_1.registerColor)('peekViewResult.lineForeground', { dark: '#bbbbbb', light: '#646465', hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewResultsMatchForeground', 'Foreground color for line nodes in the peek view result list.'));
    exports.peekViewResultsFileForeground = (0, colorRegistry_1.registerColor)('peekViewResult.fileForeground', { dark: color_1.Color.white, light: '#1E1E1E', hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewResultsFileForeground', 'Foreground color for file nodes in the peek view result list.'));
    exports.peekViewResultsSelectionBackground = (0, colorRegistry_1.registerColor)('peekViewResult.selectionBackground', { dark: '#3399ff33', light: '#3399ff33', hcDark: null, hcLight: null }, nls.localize('peekViewResultsSelectionBackground', 'Background color of the selected entry in the peek view result list.'));
    exports.peekViewResultsSelectionForeground = (0, colorRegistry_1.registerColor)('peekViewResult.selectionForeground', { dark: color_1.Color.white, light: '#6C6C6C', hcDark: color_1.Color.white, hcLight: colorRegistry_1.editorForeground }, nls.localize('peekViewResultsSelectionForeground', 'Foreground color of the selected entry in the peek view result list.'));
    exports.peekViewEditorBackground = (0, colorRegistry_1.registerColor)('peekViewEditor.background', { dark: '#001F33', light: '#F2F8FC', hcDark: color_1.Color.black, hcLight: color_1.Color.white }, nls.localize('peekViewEditorBackground', 'Background color of the peek view editor.'));
    exports.peekViewEditorGutterBackground = (0, colorRegistry_1.registerColor)('peekViewEditorGutter.background', { dark: exports.peekViewEditorBackground, light: exports.peekViewEditorBackground, hcDark: exports.peekViewEditorBackground, hcLight: exports.peekViewEditorBackground }, nls.localize('peekViewEditorGutterBackground', 'Background color of the gutter in the peek view editor.'));
    exports.peekViewEditorStickyScrollBackground = (0, colorRegistry_1.registerColor)('peekViewEditorStickyScroll.background', { dark: exports.peekViewEditorBackground, light: exports.peekViewEditorBackground, hcDark: exports.peekViewEditorBackground, hcLight: exports.peekViewEditorBackground }, nls.localize('peekViewEditorStickScrollBackground', 'Background color of sticky scroll in the peek view editor.'));
    exports.peekViewResultsMatchHighlight = (0, colorRegistry_1.registerColor)('peekViewResult.matchHighlightBackground', { dark: '#ea5c004d', light: '#ea5c004d', hcDark: null, hcLight: null }, nls.localize('peekViewResultsMatchHighlight', 'Match highlight color in the peek view result list.'));
    exports.peekViewEditorMatchHighlight = (0, colorRegistry_1.registerColor)('peekViewEditor.matchHighlightBackground', { dark: '#ff8f0099', light: '#f5d802de', hcDark: null, hcLight: null }, nls.localize('peekViewEditorMatchHighlight', 'Match highlight color in the peek view editor.'));
    exports.peekViewEditorMatchHighlightBorder = (0, colorRegistry_1.registerColor)('peekViewEditor.matchHighlightBorder', { dark: null, light: null, hcDark: colorRegistry_1.activeContrastBorder, hcLight: colorRegistry_1.activeContrastBorder }, nls.localize('peekViewEditorMatchHighlightBorder', 'Match highlight border in the peek view editor.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVla1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9wZWVrVmlldy9icm93c2VyL3BlZWtWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJCbkYsUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLCtCQUFlLEVBQW1CLGtCQUFrQixDQUFDLENBQUM7SUFNdEYsSUFBQSw4QkFBaUIsRUFBQyx3QkFBZ0IsRUFBRTtRQUFBO1lBR2xCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBa0UsQ0FBQztRQWlCdkcsQ0FBQztRQWZBLGtCQUFrQixDQUFDLE1BQW1CLEVBQUUsTUFBc0I7WUFDN0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0MsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDNUIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUMxQjtZQUNELE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO29CQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDN0I7WUFDRixDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENB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