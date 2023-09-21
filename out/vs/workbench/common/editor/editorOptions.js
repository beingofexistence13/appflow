/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/editor"], function (require, exports, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyTextEditorOptions = void 0;
    function applyTextEditorOptions(options, editor, scrollType) {
        let applied = false;
        // Restore view state if any
        const viewState = massageEditorViewState(options);
        if ((0, editor_1.isTextEditorViewState)(viewState)) {
            editor.restoreViewState(viewState);
            applied = true;
        }
        // Restore selection if any
        if (options.selection) {
            const range = {
                startLineNumber: options.selection.startLineNumber,
                startColumn: options.selection.startColumn,
                endLineNumber: options.selection.endLineNumber ?? options.selection.startLineNumber,
                endColumn: options.selection.endColumn ?? options.selection.startColumn
            };
            // Apply selection with a source so that listeners can
            // distinguish this selection change from others.
            // If no source is provided, set a default source to
            // signal this navigation.
            editor.setSelection(range, options.selectionSource ?? "code.navigation" /* TextEditorSelectionSource.NAVIGATION */);
            // Reveal selection
            if (options.selectionRevealType === 2 /* TextEditorSelectionRevealType.NearTop */) {
                editor.revealRangeNearTop(range, scrollType);
            }
            else if (options.selectionRevealType === 3 /* TextEditorSelectionRevealType.NearTopIfOutsideViewport */) {
                editor.revealRangeNearTopIfOutsideViewport(range, scrollType);
            }
            else if (options.selectionRevealType === 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */) {
                editor.revealRangeInCenterIfOutsideViewport(range, scrollType);
            }
            else {
                editor.revealRangeInCenter(range, scrollType);
            }
            applied = true;
        }
        return applied;
    }
    exports.applyTextEditorOptions = applyTextEditorOptions;
    function massageEditorViewState(options) {
        // Without a selection or view state, just return immediately
        if (!options.selection || !options.viewState) {
            return options.viewState;
        }
        // Diff editor: since we have an explicit selection, clear the
        // cursor state from the modified side where the selection
        // applies. This avoids a redundant selection change event.
        const candidateDiffViewState = options.viewState;
        if (candidateDiffViewState.modified) {
            candidateDiffViewState.modified.cursorState = [];
            return candidateDiffViewState;
        }
        // Code editor: since we have an explicit selection, clear the
        // cursor state. This avoids a redundant selection change event.
        const candidateEditorViewState = options.viewState;
        if (candidateEditorViewState.cursorState) {
            candidateEditorViewState.cursorState = [];
        }
        return candidateEditorViewState;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yT3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vZWRpdG9yL2VkaXRvck9wdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLFNBQWdCLHNCQUFzQixDQUFDLE9BQTJCLEVBQUUsTUFBZSxFQUFFLFVBQXNCO1FBQzFHLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUVwQiw0QkFBNEI7UUFDNUIsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsSUFBSSxJQUFBLDhCQUFxQixFQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3JDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVuQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1NBQ2Y7UUFFRCwyQkFBMkI7UUFDM0IsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQ3RCLE1BQU0sS0FBSyxHQUFXO2dCQUNyQixlQUFlLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUNsRCxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXO2dCQUMxQyxhQUFhLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUNuRixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXO2FBQ3ZFLENBQUM7WUFFRixzREFBc0Q7WUFDdEQsaURBQWlEO1lBQ2pELG9EQUFvRDtZQUNwRCwwQkFBMEI7WUFDMUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLGVBQWUsZ0VBQXdDLENBQUMsQ0FBQztZQUU1RixtQkFBbUI7WUFDbkIsSUFBSSxPQUFPLENBQUMsbUJBQW1CLGtEQUEwQyxFQUFFO2dCQUMxRSxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzdDO2lCQUFNLElBQUksT0FBTyxDQUFDLG1CQUFtQixtRUFBMkQsRUFBRTtnQkFDbEcsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQzthQUM5RDtpQkFBTSxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsa0VBQTBELEVBQUU7Z0JBQ2pHLE1BQU0sQ0FBQyxvQ0FBb0MsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDL0Q7aUJBQU07Z0JBQ04sTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQzthQUM5QztZQUVELE9BQU8sR0FBRyxJQUFJLENBQUM7U0FDZjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUF6Q0Qsd0RBeUNDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxPQUEyQjtRQUUxRCw2REFBNkQ7UUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQzdDLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQztTQUN6QjtRQUVELDhEQUE4RDtRQUM5RCwwREFBMEQ7UUFDMUQsMkRBQTJEO1FBQzNELE1BQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLFNBQWlDLENBQUM7UUFDekUsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLEVBQUU7WUFDcEMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFFakQsT0FBTyxzQkFBc0IsQ0FBQztTQUM5QjtRQUVELDhEQUE4RDtRQUM5RCxnRUFBZ0U7UUFDaEUsTUFBTSx3QkFBd0IsR0FBRyxPQUFPLENBQUMsU0FBaUMsQ0FBQztRQUMzRSxJQUFJLHdCQUF3QixDQUFDLFdBQVcsRUFBRTtZQUN6Qyx3QkFBd0IsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1NBQzFDO1FBRUQsT0FBTyx3QkFBd0IsQ0FBQztJQUNqQyxDQUFDIn0=