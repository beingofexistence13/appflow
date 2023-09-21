/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OvertypingCapturer = void 0;
    class OvertypingCapturer {
        static { this._maxSelectionLength = 51200; }
        constructor(editor, suggestModel) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._lastOvertyped = [];
            this._locked = false;
            this._disposables.add(editor.onWillType(() => {
                if (this._locked || !editor.hasModel()) {
                    return;
                }
                const selections = editor.getSelections();
                const selectionsLength = selections.length;
                // Check if it will overtype any selections
                let willOvertype = false;
                for (let i = 0; i < selectionsLength; i++) {
                    if (!selections[i].isEmpty()) {
                        willOvertype = true;
                        break;
                    }
                }
                if (!willOvertype) {
                    if (this._lastOvertyped.length !== 0) {
                        this._lastOvertyped.length = 0;
                    }
                    return;
                }
                this._lastOvertyped = [];
                const model = editor.getModel();
                for (let i = 0; i < selectionsLength; i++) {
                    const selection = selections[i];
                    // Check for overtyping capturer restrictions
                    if (model.getValueLengthInRange(selection) > OvertypingCapturer._maxSelectionLength) {
                        return;
                    }
                    this._lastOvertyped[i] = { value: model.getValueInRange(selection), multiline: selection.startLineNumber !== selection.endLineNumber };
                }
            }));
            this._disposables.add(suggestModel.onDidTrigger(e => {
                this._locked = true;
            }));
            this._disposables.add(suggestModel.onDidCancel(e => {
                this._locked = false;
            }));
        }
        getLastOvertypedInfo(idx) {
            if (idx >= 0 && idx < this._lastOvertyped.length) {
                return this._lastOvertyped[idx];
            }
            return undefined;
        }
        dispose() {
            this._disposables.dispose();
        }
    }
    exports.OvertypingCapturer = OvertypingCapturer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdE92ZXJ0eXBpbmdDYXB0dXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N1Z2dlc3QvYnJvd3Nlci9zdWdnZXN0T3ZlcnR5cGluZ0NhcHR1cmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLGtCQUFrQjtpQkFFTix3QkFBbUIsR0FBRyxLQUFLLEFBQVIsQ0FBUztRQU1wRCxZQUFZLE1BQW1CLEVBQUUsWUFBMEI7WUFMMUMsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUU5QyxtQkFBYyxHQUE0QyxFQUFFLENBQUM7WUFDN0QsWUFBTyxHQUFZLEtBQUssQ0FBQztZQUloQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDNUMsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUUzQywyQ0FBMkM7Z0JBQzNDLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMxQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO3dCQUM3QixZQUFZLEdBQUcsSUFBSSxDQUFDO3dCQUNwQixNQUFNO3FCQUNOO2lCQUNEO2dCQUNELElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2xCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUNyQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7cUJBQy9CO29CQUNELE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7Z0JBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMxQyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLDZDQUE2QztvQkFDN0MsSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsbUJBQW1CLEVBQUU7d0JBQ3BGLE9BQU87cUJBQ1A7b0JBQ0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztpQkFDdkk7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsb0JBQW9CLENBQUMsR0FBVztZQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO2dCQUNqRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDaEM7WUFDRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQzs7SUEvREYsZ0RBZ0VDIn0=