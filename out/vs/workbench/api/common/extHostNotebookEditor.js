/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes"], function (require, exports, errors_1, extHostConverter, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookEditor = void 0;
    class ExtHostNotebookEditor {
        static { this.apiEditorsToExtHost = new WeakMap(); }
        constructor(id, _proxy, notebookData, visibleRanges, selections, viewColumn) {
            this.id = id;
            this._proxy = _proxy;
            this.notebookData = notebookData;
            this._selections = [];
            this._visibleRanges = [];
            this._visible = false;
            this._selections = selections;
            this._visibleRanges = visibleRanges;
            this._viewColumn = viewColumn;
        }
        get apiEditor() {
            if (!this._editor) {
                const that = this;
                this._editor = {
                    get notebook() {
                        return that.notebookData.apiNotebook;
                    },
                    get selection() {
                        return that._selections[0];
                    },
                    set selection(selection) {
                        this.selections = [selection];
                    },
                    get selections() {
                        return that._selections;
                    },
                    set selections(value) {
                        if (!Array.isArray(value) || !value.every(extHostTypes.NotebookRange.isNotebookRange)) {
                            throw (0, errors_1.illegalArgument)('selections');
                        }
                        that._selections = value;
                        that._trySetSelections(value);
                    },
                    get visibleRanges() {
                        return that._visibleRanges;
                    },
                    revealRange(range, revealType) {
                        that._proxy.$tryRevealRange(that.id, extHostConverter.NotebookRange.from(range), revealType ?? extHostTypes.NotebookEditorRevealType.Default);
                    },
                    get viewColumn() {
                        return that._viewColumn;
                    },
                };
                ExtHostNotebookEditor.apiEditorsToExtHost.set(this._editor, this);
            }
            return this._editor;
        }
        get visible() {
            return this._visible;
        }
        _acceptVisibility(value) {
            this._visible = value;
        }
        _acceptVisibleRanges(value) {
            this._visibleRanges = value;
        }
        _acceptSelections(selections) {
            this._selections = selections;
        }
        _trySetSelections(value) {
            this._proxy.$trySetSelections(this.id, value.map(extHostConverter.NotebookRange.from));
        }
        _acceptViewColumn(value) {
            this._viewColumn = value;
        }
    }
    exports.ExtHostNotebookEditor = ExtHostNotebookEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE5vdGVib29rRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdE5vdGVib29rRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLHFCQUFxQjtpQkFFVix3QkFBbUIsR0FBRyxJQUFJLE9BQU8sRUFBZ0QsQUFBOUQsQ0FBK0Q7UUFVekcsWUFDVSxFQUFVLEVBQ0YsTUFBc0MsRUFDOUMsWUFBcUMsRUFDOUMsYUFBcUMsRUFDckMsVUFBa0MsRUFDbEMsVUFBeUM7WUFMaEMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUNGLFdBQU0sR0FBTixNQUFNLENBQWdDO1lBQzlDLGlCQUFZLEdBQVosWUFBWSxDQUF5QjtZQVh2QyxnQkFBVyxHQUEyQixFQUFFLENBQUM7WUFDekMsbUJBQWMsR0FBMkIsRUFBRSxDQUFDO1lBRzVDLGFBQVEsR0FBWSxLQUFLLENBQUM7WUFZakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFDcEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksU0FBUztZQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNsQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUc7b0JBQ2QsSUFBSSxRQUFRO3dCQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7b0JBQ3RDLENBQUM7b0JBQ0QsSUFBSSxTQUFTO3dCQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsQ0FBQztvQkFDRCxJQUFJLFNBQVMsQ0FBQyxTQUErQjt3QkFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMvQixDQUFDO29CQUNELElBQUksVUFBVTt3QkFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3pCLENBQUM7b0JBQ0QsSUFBSSxVQUFVLENBQUMsS0FBNkI7d0JBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxFQUFFOzRCQUN0RixNQUFNLElBQUEsd0JBQWUsRUFBQyxZQUFZLENBQUMsQ0FBQzt5QkFDcEM7d0JBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7d0JBQ3pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDL0IsQ0FBQztvQkFDRCxJQUFJLGFBQWE7d0JBQ2hCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztvQkFDNUIsQ0FBQztvQkFDRCxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVU7d0JBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUMxQixJQUFJLENBQUMsRUFBRSxFQUNQLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQzFDLFVBQVUsSUFBSSxZQUFZLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUMzRCxDQUFDO29CQUNILENBQUM7b0JBQ0QsSUFBSSxVQUFVO3dCQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDekIsQ0FBQztpQkFDRCxDQUFDO2dCQUVGLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ2xFO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVELGlCQUFpQixDQUFDLEtBQWM7WUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdkIsQ0FBQztRQUVELG9CQUFvQixDQUFDLEtBQTZCO1lBQ2pELElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzdCLENBQUM7UUFFRCxpQkFBaUIsQ0FBQyxVQUFrQztZQUNuRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUMvQixDQUFDO1FBRU8saUJBQWlCLENBQUMsS0FBNkI7WUFDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVELGlCQUFpQixDQUFDLEtBQW9DO1lBQ3JELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQzFCLENBQUM7O0lBMUZGLHNEQTJGQyJ9