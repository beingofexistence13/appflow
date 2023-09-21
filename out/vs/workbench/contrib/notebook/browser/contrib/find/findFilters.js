/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookFindFilters = void 0;
    class NotebookFindFilters extends lifecycle_1.Disposable {
        get markupInput() {
            return this._markupInput;
        }
        set markupInput(value) {
            if (this._markupInput !== value) {
                this._markupInput = value;
                this._onDidChange.fire({ markupInput: value });
            }
        }
        get markupPreview() {
            return this._markupPreview;
        }
        set markupPreview(value) {
            if (this._markupPreview !== value) {
                this._markupPreview = value;
                this._onDidChange.fire({ markupPreview: value });
            }
        }
        get codeInput() {
            return this._codeInput;
        }
        set codeInput(value) {
            if (this._codeInput !== value) {
                this._codeInput = value;
                this._onDidChange.fire({ codeInput: value });
            }
        }
        get codeOutput() {
            return this._codeOutput;
        }
        set codeOutput(value) {
            if (this._codeOutput !== value) {
                this._codeOutput = value;
                this._onDidChange.fire({ codeOutput: value });
            }
        }
        constructor(markupInput, markupPreview, codeInput, codeOutput) {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._markupInput = true;
            this._markupPreview = true;
            this._codeInput = true;
            this._codeOutput = true;
            this._markupInput = markupInput;
            this._markupPreview = markupPreview;
            this._codeInput = codeInput;
            this._codeOutput = codeOutput;
            this._initialMarkupInput = markupInput;
            this._initialMarkupPreview = markupPreview;
            this._initialCodeInput = codeInput;
            this._initialCodeOutput = codeOutput;
        }
        isModified() {
            return (this._markupInput !== this._initialMarkupInput
                || this._markupPreview !== this._initialMarkupPreview
                || this._codeInput !== this._initialCodeInput
                || this._codeOutput !== this._initialCodeOutput);
        }
        update(v) {
            this._markupInput = v.markupInput;
            this._markupPreview = v.markupPreview;
            this._codeInput = v.codeInput;
            this._codeOutput = v.codeOutput;
        }
    }
    exports.NotebookFindFilters = NotebookFindFilters;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZEZpbHRlcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvZmluZC9maW5kRmlsdGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBYSxtQkFBb0IsU0FBUSxzQkFBVTtRQU1sRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksV0FBVyxDQUFDLEtBQWM7WUFDN0IsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLEtBQUssRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDL0M7UUFDRixDQUFDO1FBSUQsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM1QixDQUFDO1FBRUQsSUFBSSxhQUFhLENBQUMsS0FBYztZQUMvQixJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssS0FBSyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUNqRDtRQUNGLENBQUM7UUFHRCxJQUFJLFNBQVM7WUFDWixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksU0FBUyxDQUFDLEtBQWM7WUFDM0IsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtnQkFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDN0M7UUFDRixDQUFDO1FBSUQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxJQUFJLFVBQVUsQ0FBQyxLQUFjO1lBQzVCLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUN6QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQzlDO1FBQ0YsQ0FBQztRQVFELFlBQ0MsV0FBb0IsRUFDcEIsYUFBc0IsRUFDdEIsU0FBa0IsRUFDbEIsVUFBbUI7WUFFbkIsS0FBSyxFQUFFLENBQUM7WUFsRVEsaUJBQVksR0FBNkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBbUMsQ0FBQyxDQUFDO1lBQ2hJLGdCQUFXLEdBQTJDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRS9FLGlCQUFZLEdBQVksSUFBSSxDQUFDO1lBYTdCLG1CQUFjLEdBQVksSUFBSSxDQUFDO1lBWS9CLGVBQVUsR0FBWSxJQUFJLENBQUM7WUFhM0IsZ0JBQVcsR0FBWSxJQUFJLENBQUM7WUEyQm5DLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBRTlCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxXQUFXLENBQUM7WUFDdkMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGFBQWEsQ0FBQztZQUMzQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO1lBQ25DLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLENBQUM7UUFDdEMsQ0FBQztRQUVELFVBQVU7WUFDVCxPQUFPLENBQ04sSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsbUJBQW1CO21CQUMzQyxJQUFJLENBQUMsY0FBYyxLQUFLLElBQUksQ0FBQyxxQkFBcUI7bUJBQ2xELElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxDQUFDLGlCQUFpQjttQkFDMUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsa0JBQWtCLENBQy9DLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxDQUFDLENBQXNCO1lBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUNsQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUEvRkQsa0RBK0ZDIn0=