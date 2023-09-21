/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/editor/common/model", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/base/browser/ui/aria/aria"], function (require, exports, functional_1, lifecycle_1, editorBrowser_1, model_1, editorColorRegistry_1, themeService_1, aria_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractEditorNavigationQuickAccessProvider = void 0;
    /**
     * A reusable quick access provider for the editor with support
     * for adding decorations for navigating in the currently active file
     * (for example "Go to line", "Go to symbol").
     */
    class AbstractEditorNavigationQuickAccessProvider {
        constructor(options) {
            this.options = options;
            //#endregion
            //#region Decorations Utils
            this.rangeHighlightDecorationId = undefined;
        }
        //#region Provider methods
        provide(picker, token) {
            const disposables = new lifecycle_1.DisposableStore();
            // Apply options if any
            picker.canAcceptInBackground = !!this.options?.canAcceptInBackground;
            // Disable filtering & sorting, we control the results
            picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
            // Provide based on current active editor
            const pickerDisposable = disposables.add(new lifecycle_1.MutableDisposable());
            pickerDisposable.value = this.doProvide(picker, token);
            // Re-create whenever the active editor changes
            disposables.add(this.onDidActiveTextEditorControlChange(() => {
                // Clear old
                pickerDisposable.value = undefined;
                // Add new
                pickerDisposable.value = this.doProvide(picker, token);
            }));
            return disposables;
        }
        doProvide(picker, token) {
            const disposables = new lifecycle_1.DisposableStore();
            // With text control
            const editor = this.activeTextEditorControl;
            if (editor && this.canProvideWithTextEditor(editor)) {
                const context = { editor };
                // Restore any view state if this picker was closed
                // without actually going to a line
                const codeEditor = (0, editorBrowser_1.getCodeEditor)(editor);
                if (codeEditor) {
                    // Remember view state and update it when the cursor position
                    // changes even later because it could be that the user has
                    // configured quick access to remain open when focus is lost and
                    // we always want to restore the current location.
                    let lastKnownEditorViewState = editor.saveViewState() ?? undefined;
                    disposables.add(codeEditor.onDidChangeCursorPosition(() => {
                        lastKnownEditorViewState = editor.saveViewState() ?? undefined;
                    }));
                    context.restoreViewState = () => {
                        if (lastKnownEditorViewState && editor === this.activeTextEditorControl) {
                            editor.restoreViewState(lastKnownEditorViewState);
                        }
                    };
                    disposables.add((0, functional_1.once)(token.onCancellationRequested)(() => context.restoreViewState?.()));
                }
                // Clean up decorations on dispose
                disposables.add((0, lifecycle_1.toDisposable)(() => this.clearDecorations(editor)));
                // Ask subclass for entries
                disposables.add(this.provideWithTextEditor(context, picker, token));
            }
            // Without text control
            else {
                disposables.add(this.provideWithoutTextEditor(picker, token));
            }
            return disposables;
        }
        /**
         * Subclasses to implement if they can operate on the text editor.
         */
        canProvideWithTextEditor(editor) {
            return true;
        }
        gotoLocation({ editor }, options) {
            editor.setSelection(options.range);
            editor.revealRangeInCenter(options.range, 0 /* ScrollType.Smooth */);
            if (!options.preserveFocus) {
                editor.focus();
            }
            const model = editor.getModel();
            if (model && 'getLineContent' in model) {
                (0, aria_1.status)(`${model.getLineContent(options.range.startLineNumber)}`);
            }
        }
        getModel(editor) {
            return (0, editorBrowser_1.isDiffEditor)(editor) ?
                editor.getModel()?.modified :
                editor.getModel();
        }
        addDecorations(editor, range) {
            editor.changeDecorations(changeAccessor => {
                // Reset old decorations if any
                const deleteDecorations = [];
                if (this.rangeHighlightDecorationId) {
                    deleteDecorations.push(this.rangeHighlightDecorationId.overviewRulerDecorationId);
                    deleteDecorations.push(this.rangeHighlightDecorationId.rangeHighlightId);
                    this.rangeHighlightDecorationId = undefined;
                }
                // Add new decorations for the range
                const newDecorations = [
                    // highlight the entire line on the range
                    {
                        range,
                        options: {
                            description: 'quick-access-range-highlight',
                            className: 'rangeHighlight',
                            isWholeLine: true
                        }
                    },
                    // also add overview ruler highlight
                    {
                        range,
                        options: {
                            description: 'quick-access-range-highlight-overview',
                            overviewRuler: {
                                color: (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerRangeHighlight),
                                position: model_1.OverviewRulerLane.Full
                            }
                        }
                    }
                ];
                const [rangeHighlightId, overviewRulerDecorationId] = changeAccessor.deltaDecorations(deleteDecorations, newDecorations);
                this.rangeHighlightDecorationId = { rangeHighlightId, overviewRulerDecorationId };
            });
        }
        clearDecorations(editor) {
            const rangeHighlightDecorationId = this.rangeHighlightDecorationId;
            if (rangeHighlightDecorationId) {
                editor.changeDecorations(changeAccessor => {
                    changeAccessor.deltaDecorations([
                        rangeHighlightDecorationId.overviewRulerDecorationId,
                        rangeHighlightDecorationId.rangeHighlightId
                    ], []);
                });
                this.rangeHighlightDecorationId = undefined;
            }
        }
    }
    exports.AbstractEditorNavigationQuickAccessProvider = AbstractEditorNavigationQuickAccessProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yTmF2aWdhdGlvblF1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvcXVpY2tBY2Nlc3MvYnJvd3Nlci9lZGl0b3JOYXZpZ2F0aW9uUXVpY2tBY2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUNoRzs7OztPQUlHO0lBQ0gsTUFBc0IsMkNBQTJDO1FBRWhFLFlBQXNCLE9BQTZDO1lBQTdDLFlBQU8sR0FBUCxPQUFPLENBQXNDO1lBOEhuRSxZQUFZO1lBR1osMkJBQTJCO1lBRW5CLCtCQUEwQixHQUFzQyxTQUFTLENBQUM7UUFuSVgsQ0FBQztRQUV4RSwwQkFBMEI7UUFFMUIsT0FBTyxDQUFDLE1BQWtDLEVBQUUsS0FBd0I7WUFDbkUsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMsdUJBQXVCO1lBQ3ZCLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQztZQUVyRSxzREFBc0Q7WUFDdEQsTUFBTSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUVwRyx5Q0FBeUM7WUFDekMsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksNkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLGdCQUFnQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV2RCwrQ0FBK0M7WUFDL0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsR0FBRyxFQUFFO2dCQUU1RCxZQUFZO2dCQUNaLGdCQUFnQixDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7Z0JBRW5DLFVBQVU7Z0JBQ1YsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBRU8sU0FBUyxDQUFDLE1BQWtDLEVBQUUsS0FBd0I7WUFDN0UsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFMUMsb0JBQW9CO1lBQ3BCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztZQUM1QyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BELE1BQU0sT0FBTyxHQUFrQyxFQUFFLE1BQU0sRUFBRSxDQUFDO2dCQUUxRCxtREFBbUQ7Z0JBQ25ELG1DQUFtQztnQkFDbkMsTUFBTSxVQUFVLEdBQUcsSUFBQSw2QkFBYSxFQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLFVBQVUsRUFBRTtvQkFFZiw2REFBNkQ7b0JBQzdELDJEQUEyRDtvQkFDM0QsZ0VBQWdFO29CQUNoRSxrREFBa0Q7b0JBQ2xELElBQUksd0JBQXdCLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLFNBQVMsQ0FBQztvQkFDbkUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFO3dCQUN6RCx3QkFBd0IsR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLElBQUksU0FBUyxDQUFDO29CQUNoRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVKLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLEVBQUU7d0JBQy9CLElBQUksd0JBQXdCLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyx1QkFBdUIsRUFBRTs0QkFDeEUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLENBQUM7eUJBQ2xEO29CQUNGLENBQUMsQ0FBQztvQkFFRixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsaUJBQUksRUFBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDekY7Z0JBRUQsa0NBQWtDO2dCQUNsQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVuRSwyQkFBMkI7Z0JBQzNCLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNwRTtZQUVELHVCQUF1QjtpQkFDbEI7Z0JBQ0osV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDOUQ7WUFFRCxPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBRUQ7O1dBRUc7UUFDTyx3QkFBd0IsQ0FBQyxNQUFlO1lBQ2pELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQVlTLFlBQVksQ0FBQyxFQUFFLE1BQU0sRUFBaUMsRUFBRSxPQUFpRztZQUNsSyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEtBQUssNEJBQW9CLENBQUM7WUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNmO1lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLElBQUksS0FBSyxJQUFJLGdCQUFnQixJQUFJLEtBQUssRUFBRTtnQkFDdkMsSUFBQSxhQUFNLEVBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2pFO1FBQ0YsQ0FBQztRQUVTLFFBQVEsQ0FBQyxNQUE2QjtZQUMvQyxPQUFPLElBQUEsNEJBQVksRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxRQUFRLEVBQWdCLENBQUM7UUFDbEMsQ0FBQztRQXdCRCxjQUFjLENBQUMsTUFBZSxFQUFFLEtBQWE7WUFDNUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUV6QywrQkFBK0I7Z0JBQy9CLE1BQU0saUJBQWlCLEdBQWEsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtvQkFDcEMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO29CQUNsRixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBRXpFLElBQUksQ0FBQywwQkFBMEIsR0FBRyxTQUFTLENBQUM7aUJBQzVDO2dCQUVELG9DQUFvQztnQkFDcEMsTUFBTSxjQUFjLEdBQTRCO29CQUUvQyx5Q0FBeUM7b0JBQ3pDO3dCQUNDLEtBQUs7d0JBQ0wsT0FBTyxFQUFFOzRCQUNSLFdBQVcsRUFBRSw4QkFBOEI7NEJBQzNDLFNBQVMsRUFBRSxnQkFBZ0I7NEJBQzNCLFdBQVcsRUFBRSxJQUFJO3lCQUNqQjtxQkFDRDtvQkFFRCxvQ0FBb0M7b0JBQ3BDO3dCQUNDLEtBQUs7d0JBQ0wsT0FBTyxFQUFFOzRCQUNSLFdBQVcsRUFBRSx1Q0FBdUM7NEJBQ3BELGFBQWEsRUFBRTtnQ0FDZCxLQUFLLEVBQUUsSUFBQSwrQkFBZ0IsRUFBQyxpREFBMkIsQ0FBQztnQ0FDcEQsUUFBUSxFQUFFLHlCQUFpQixDQUFDLElBQUk7NkJBQ2hDO3lCQUNEO3FCQUNEO2lCQUNELENBQUM7Z0JBRUYsTUFBTSxDQUFDLGdCQUFnQixFQUFFLHlCQUF5QixDQUFDLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUV6SCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSx5QkFBeUIsRUFBRSxDQUFDO1lBQ25GLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGdCQUFnQixDQUFDLE1BQWU7WUFDL0IsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDbkUsSUFBSSwwQkFBMEIsRUFBRTtnQkFDL0IsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxFQUFFO29CQUN6QyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7d0JBQy9CLDBCQUEwQixDQUFDLHlCQUF5Qjt3QkFDcEQsMEJBQTBCLENBQUMsZ0JBQWdCO3FCQUMzQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNSLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksQ0FBQywwQkFBMEIsR0FBRyxTQUFTLENBQUM7YUFDNUM7UUFDRixDQUFDO0tBR0Q7SUFsTUQsa0dBa01DIn0=