/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/languages", "vs/editor/common/model/textModel"], function (require, exports, lifecycle_1, languages_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentThreadRangeDecorator = void 0;
    class CommentThreadRangeDecoration {
        get id() {
            return this._decorationId;
        }
        set id(id) {
            this._decorationId = id;
        }
        constructor(range, options) {
            this.range = range;
            this.options = options;
        }
    }
    class CommentThreadRangeDecorator extends lifecycle_1.Disposable {
        static { this.description = 'comment-thread-range-decorator'; }
        constructor(commentService) {
            super();
            this.decorationIds = [];
            this.activeDecorationIds = [];
            this.threadCollapseStateListeners = [];
            const decorationOptions = {
                description: CommentThreadRangeDecorator.description,
                isWholeLine: false,
                zIndex: 20,
                className: 'comment-thread-range',
                shouldFillLineOnLineBreak: true
            };
            this.decorationOptions = textModel_1.ModelDecorationOptions.createDynamic(decorationOptions);
            const activeDecorationOptions = {
                description: CommentThreadRangeDecorator.description,
                isWholeLine: false,
                zIndex: 20,
                className: 'comment-thread-range-current',
                shouldFillLineOnLineBreak: true
            };
            this.activeDecorationOptions = textModel_1.ModelDecorationOptions.createDynamic(activeDecorationOptions);
            this._register(commentService.onDidChangeCurrentCommentThread(thread => {
                this.updateCurrent(thread);
            }));
            this._register(commentService.onDidUpdateCommentThreads(() => {
                this.updateCurrent(undefined);
            }));
        }
        updateCurrent(thread) {
            if (!this.editor || (thread?.resource && (thread.resource?.toString() !== this.editor.getModel()?.uri.toString()))) {
                return;
            }
            this.currentThreadCollapseStateListener?.dispose();
            const newDecoration = [];
            if (thread) {
                const range = thread.range;
                if (range && !((range.startLineNumber === range.endLineNumber) && (range.startColumn === range.endColumn))) {
                    if (thread.collapsibleState === languages_1.CommentThreadCollapsibleState.Expanded) {
                        this.currentThreadCollapseStateListener = thread.onDidChangeCollapsibleState(state => {
                            if (state === languages_1.CommentThreadCollapsibleState.Collapsed) {
                                this.updateCurrent(undefined);
                            }
                        });
                        newDecoration.push(new CommentThreadRangeDecoration(range, this.activeDecorationOptions));
                    }
                }
            }
            this.editor.changeDecorations((changeAccessor) => {
                this.activeDecorationIds = changeAccessor.deltaDecorations(this.activeDecorationIds, newDecoration);
                newDecoration.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
            });
        }
        update(editor, commentInfos) {
            const model = editor?.getModel();
            if (!editor || !model) {
                return;
            }
            (0, lifecycle_1.dispose)(this.threadCollapseStateListeners);
            this.editor = editor;
            const commentThreadRangeDecorations = [];
            for (const info of commentInfos) {
                info.threads.forEach(thread => {
                    if (thread.isDisposed) {
                        return;
                    }
                    const range = thread.range;
                    // We only want to show a range decoration when there's the range spans either multiple lines
                    // or, when is spans multiple characters on the sample line
                    if (!range || (range.startLineNumber === range.endLineNumber) && (range.startColumn === range.endColumn)) {
                        return;
                    }
                    this.threadCollapseStateListeners.push(thread.onDidChangeCollapsibleState(() => {
                        this.update(editor, commentInfos);
                    }));
                    if (thread.collapsibleState === languages_1.CommentThreadCollapsibleState.Collapsed) {
                        return;
                    }
                    commentThreadRangeDecorations.push(new CommentThreadRangeDecoration(range, this.decorationOptions));
                });
            }
            editor.changeDecorations((changeAccessor) => {
                this.decorationIds = changeAccessor.deltaDecorations(this.decorationIds, commentThreadRangeDecorations);
                commentThreadRangeDecorations.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
            });
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.threadCollapseStateListeners);
            this.currentThreadCollapseStateListener?.dispose();
            super.dispose();
        }
    }
    exports.CommentThreadRangeDecorator = CommentThreadRangeDecorator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZFJhbmdlRGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvYnJvd3Nlci9jb21tZW50VGhyZWFkUmFuZ2VEZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQU0sNEJBQTRCO1FBR2pDLElBQVcsRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBVyxFQUFFLENBQUMsRUFBc0I7WUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELFlBQ2lCLEtBQWEsRUFDYixPQUErQjtZQUQvQixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ2IsWUFBTyxHQUFQLE9BQU8sQ0FBd0I7UUFDaEQsQ0FBQztLQUNEO0lBRUQsTUFBYSwyQkFBNEIsU0FBUSxzQkFBVTtpQkFDM0MsZ0JBQVcsR0FBRyxnQ0FBZ0MsQUFBbkMsQ0FBb0M7UUFTOUQsWUFBWSxjQUErQjtZQUMxQyxLQUFLLEVBQUUsQ0FBQztZQVBELGtCQUFhLEdBQWEsRUFBRSxDQUFDO1lBQzdCLHdCQUFtQixHQUFhLEVBQUUsQ0FBQztZQUVuQyxpQ0FBNEIsR0FBa0IsRUFBRSxDQUFDO1lBS3hELE1BQU0saUJBQWlCLEdBQTRCO2dCQUNsRCxXQUFXLEVBQUUsMkJBQTJCLENBQUMsV0FBVztnQkFDcEQsV0FBVyxFQUFFLEtBQUs7Z0JBQ2xCLE1BQU0sRUFBRSxFQUFFO2dCQUNWLFNBQVMsRUFBRSxzQkFBc0I7Z0JBQ2pDLHlCQUF5QixFQUFFLElBQUk7YUFDL0IsQ0FBQztZQUVGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxrQ0FBc0IsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUVqRixNQUFNLHVCQUF1QixHQUE0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