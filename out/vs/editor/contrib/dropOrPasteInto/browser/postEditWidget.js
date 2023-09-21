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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/services/bulkEditService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/css!./postEditWidget"], function (require, exports, dom, button_1, actions_1, event_1, lifecycle_1, bulkEditService_1, contextkey_1, contextView_1, instantiation_1, keybinding_1) {
    "use strict";
    var PostEditWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostEditWidgetManager = void 0;
    let PostEditWidget = class PostEditWidget extends lifecycle_1.Disposable {
        static { PostEditWidget_1 = this; }
        static { this.baseId = 'editor.widget.postEditWidget'; }
        constructor(typeId, editor, visibleContext, showCommand, range, edits, onSelectNewEdit, _contextMenuService, contextKeyService, _keybindingService) {
            super();
            this.typeId = typeId;
            this.editor = editor;
            this.showCommand = showCommand;
            this.range = range;
            this.edits = edits;
            this.onSelectNewEdit = onSelectNewEdit;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = true;
            this.create();
            this.visibleContext = visibleContext.bindTo(contextKeyService);
            this.visibleContext.set(true);
            this._register((0, lifecycle_1.toDisposable)(() => this.visibleContext.reset()));
            this.editor.addContentWidget(this);
            this.editor.layoutContentWidget(this);
            this._register((0, lifecycle_1.toDisposable)((() => this.editor.removeContentWidget(this))));
            this._register(this.editor.onDidChangeCursorPosition(e => {
                if (!range.containsPosition(e.position)) {
                    this.dispose();
                }
            }));
            this._register(event_1.Event.runAndSubscribe(_keybindingService.onDidUpdateKeybindings, () => {
                this._updateButtonTitle();
            }));
        }
        _updateButtonTitle() {
            const binding = this._keybindingService.lookupKeybinding(this.showCommand.id)?.getLabel();
            this.button.element.title = this.showCommand.label + (binding ? ` (${binding})` : '');
        }
        create() {
            this.domNode = dom.$('.post-edit-widget');
            this.button = this._register(new button_1.Button(this.domNode, {
                supportIcons: true,
            }));
            this.button.label = '$(insert)';
            this._register(dom.addDisposableListener(this.domNode, dom.EventType.CLICK, () => this.showSelector()));
        }
        getId() {
            return PostEditWidget_1.baseId + '.' + this.typeId;
        }
        getDomNode() {
            return this.domNode;
        }
        getPosition() {
            return {
                position: this.range.getEndPosition(),
                preference: [2 /* ContentWidgetPositionPreference.BELOW */]
            };
        }
        showSelector() {
            this._contextMenuService.showContextMenu({
                getAnchor: () => {
                    const pos = dom.getDomNodePagePosition(this.button.element);
                    return { x: pos.left + pos.width, y: pos.top + pos.height };
                },
                getActions: () => {
                    return this.edits.allEdits.map((edit, i) => (0, actions_1.toAction)({
                        id: '',
                        label: edit.label,
                        checked: i === this.edits.activeEditIndex,
                        run: () => {
                            if (i !== this.edits.activeEditIndex) {
                                return this.onSelectNewEdit(i);
                            }
                        },
                    }));
                }
            });
        }
    };
    PostEditWidget = PostEditWidget_1 = __decorate([
        __param(7, contextView_1.IContextMenuService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, keybinding_1.IKeybindingService)
    ], PostEditWidget);
    let PostEditWidgetManager = class PostEditWidgetManager extends lifecycle_1.Disposable {
        constructor(_id, _editor, _visibleContext, _showCommand, _instantiationService, _bulkEditService) {
            super();
            this._id = _id;
            this._editor = _editor;
            this._visibleContext = _visibleContext;
            this._showCommand = _showCommand;
            this._instantiationService = _instantiationService;
            this._bulkEditService = _bulkEditService;
            this._currentWidget = this._register(new lifecycle_1.MutableDisposable());
            this._register(event_1.Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelContent)(() => this.clear()));
        }
        async applyEditAndShowIfNeeded(ranges, edits, canShowWidget, token) {
            const model = this._editor.getModel();
            if (!model || !ranges.length) {
                return;
            }
            const edit = edits.allEdits[edits.activeEditIndex];
            if (!edit) {
                return;
            }
            let insertTextEdit = [];
            if (typeof edit.insertText === 'string' ? edit.insertText === '' : edit.insertText.snippet === '') {
                insertTextEdit = [];
            }
            else {
                insertTextEdit = ranges.map(range => new bulkEditService_1.ResourceTextEdit(model.uri, typeof edit.insertText === 'string'
                    ? { range, text: edit.insertText, insertAsSnippet: false }
                    : { range, text: edit.insertText.snippet, insertAsSnippet: true }));
            }
            const allEdits = [
                ...insertTextEdit,
                ...(edit.additionalEdit?.edits ?? [])
            ];
            const combinedWorkspaceEdit = {
                edits: allEdits
            };
            // Use a decoration to track edits around the trigger range
            const primaryRange = ranges[0];
            const editTrackingDecoration = model.deltaDecorations([], [{
                    range: primaryRange,
                    options: { description: 'paste-line-suffix', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }
                }]);
            let editResult;
            let editRange;
            try {
                editResult = await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor, token });
                editRange = model.getDecorationRange(editTrackingDecoration[0]);
            }
            finally {
                model.deltaDecorations(editTrackingDecoration, []);
            }
            if (canShowWidget && editResult.isApplied && edits.allEdits.length > 1) {
                this.show(editRange ?? primaryRange, edits, async (newEditIndex) => {
                    const model = this._editor.getModel();
                    if (!model) {
                        return;
                    }
                    await model.undo();
                    this.applyEditAndShowIfNeeded(ranges, { activeEditIndex: newEditIndex, allEdits: edits.allEdits }, canShowWidget, token);
                });
            }
        }
        show(range, edits, onDidSelectEdit) {
            this.clear();
            if (this._editor.hasModel()) {
                this._currentWidget.value = this._instantiationService.createInstance(PostEditWidget, this._id, this._editor, this._visibleContext, this._showCommand, range, edits, onDidSelectEdit);
            }
        }
        clear() {
            this._currentWidget.clear();
        }
        tryShowSelector() {
            this._currentWidget.value?.showSelector();
        }
    };
    exports.PostEditWidgetManager = PostEditWidgetManager;
    exports.PostEditWidgetManager = PostEditWidgetManager = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, bulkEditService_1.IBulkEditService)
    ], PostEditWidgetManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdEVkaXRXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9kcm9wT3JQYXN0ZUludG8vYnJvd3Nlci9wb3N0RWRpdFdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsc0JBQVU7O2lCQUNkLFdBQU0sR0FBRyw4QkFBOEIsQUFBakMsQ0FBa0M7UUFVaEUsWUFDa0IsTUFBYyxFQUNkLE1BQW1CLEVBQ3BDLGNBQXNDLEVBQ3JCLFdBQXdCLEVBQ3hCLEtBQVksRUFDWixLQUFjLEVBQ2QsZUFBNEMsRUFDeEMsbUJBQXlELEVBQzFELGlCQUFxQyxFQUNyQyxrQkFBdUQ7WUFFM0UsS0FBSyxFQUFFLENBQUM7WUFYUyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUVuQixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUN4QixVQUFLLEdBQUwsS0FBSyxDQUFPO1lBQ1osVUFBSyxHQUFMLEtBQUssQ0FBUztZQUNkLG9CQUFlLEdBQWYsZUFBZSxDQUE2QjtZQUN2Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBRXpDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFsQm5FLHdCQUFtQixHQUFHLElBQUksQ0FBQztZQUMzQixzQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFxQmpDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdB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