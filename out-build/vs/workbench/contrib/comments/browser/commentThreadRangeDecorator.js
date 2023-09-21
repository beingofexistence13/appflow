/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/languages", "vs/editor/common/model/textModel"], function (require, exports, lifecycle_1, languages_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jmb = void 0;
    class CommentThreadRangeDecoration {
        get id() {
            return this.a;
        }
        set id(id) {
            this.a = id;
        }
        constructor(range, options) {
            this.range = range;
            this.options = options;
        }
    }
    class $Jmb extends lifecycle_1.$kc {
        static { this.a = 'comment-thread-range-decorator'; }
        constructor(commentService) {
            super();
            this.f = [];
            this.g = [];
            this.j = [];
            const decorationOptions = {
                description: $Jmb.a,
                isWholeLine: false,
                zIndex: 20,
                className: 'comment-thread-range',
                shouldFillLineOnLineBreak: true
            };
            this.b = textModel_1.$RC.createDynamic(decorationOptions);
            const activeDecorationOptions = {
                description: $Jmb.a,
                isWholeLine: false,
                zIndex: 20,
                className: 'comment-thread-range-current',
                shouldFillLineOnLineBreak: true
            };
            this.c = textModel_1.$RC.createDynamic(activeDecorationOptions);
            this.B(commentService.onDidChangeCurrentCommentThread(thread => {
                this.n(thread);
            }));
            this.B(commentService.onDidUpdateCommentThreads(() => {
                this.n(undefined);
            }));
        }
        n(thread) {
            if (!this.h || (thread?.resource && (thread.resource?.toString() !== this.h.getModel()?.uri.toString()))) {
                return;
            }
            this.m?.dispose();
            const newDecoration = [];
            if (thread) {
                const range = thread.range;
                if (range && !((range.startLineNumber === range.endLineNumber) && (range.startColumn === range.endColumn))) {
                    if (thread.collapsibleState === languages_1.CommentThreadCollapsibleState.Expanded) {
                        this.m = thread.onDidChangeCollapsibleState(state => {
                            if (state === languages_1.CommentThreadCollapsibleState.Collapsed) {
                                this.n(undefined);
                            }
                        });
                        newDecoration.push(new CommentThreadRangeDecoration(range, this.c));
                    }
                }
            }
            this.h.changeDecorations((changeAccessor) => {
                this.g = changeAccessor.deltaDecorations(this.g, newDecoration);
                newDecoration.forEach((decoration, index) => decoration.id = this.f[index]);
            });
        }
        update(editor, commentInfos) {
            const model = editor?.getModel();
            if (!editor || !model) {
                return;
            }
            (0, lifecycle_1.$fc)(this.j);
            this.h = editor;
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
                    this.j.push(thread.onDidChangeCollapsibleState(() => {
                        this.update(editor, commentInfos);
                    }));
                    if (thread.collapsibleState === languages_1.CommentThreadCollapsibleState.Collapsed) {
                        return;
                    }
                    commentThreadRangeDecorations.push(new CommentThreadRangeDecoration(range, this.b));
                });
            }
            editor.changeDecorations((changeAccessor) => {
                this.f = changeAccessor.deltaDecorations(this.f, commentThreadRangeDecorations);
                commentThreadRangeDecorations.forEach((decoration, index) => decoration.id = this.f[index]);
            });
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.j);
            this.m?.dispose();
            super.dispose();
        }
    }
    exports.$Jmb = $Jmb;
});
//# sourceMappingURL=commentThreadRangeDecorator.js.map