/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/editor/common/core/characterClassifier"], function (require, exports, arrays_1, lifecycle_1, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommitCharacterController = void 0;
    class CommitCharacterController {
        constructor(editor, widget, model, accept) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._disposables.add(model.onDidSuggest(e => {
                if (e.completionModel.items.length === 0) {
                    this.reset();
                }
            }));
            this._disposables.add(model.onDidCancel(e => {
                this.reset();
            }));
            this._disposables.add(widget.onDidShow(() => this._onItem(widget.getFocusedItem())));
            this._disposables.add(widget.onDidFocus(this._onItem, this));
            this._disposables.add(widget.onDidHide(this.reset, this));
            this._disposables.add(editor.onWillType(text => {
                if (this._active && !widget.isFrozen() && model.state !== 0 /* State.Idle */) {
                    const ch = text.charCodeAt(text.length - 1);
                    if (this._active.acceptCharacters.has(ch) && editor.getOption(0 /* EditorOption.acceptSuggestionOnCommitCharacter */)) {
                        accept(this._active.item);
                    }
                }
            }));
        }
        _onItem(selected) {
            if (!selected || !(0, arrays_1.isNonEmptyArray)(selected.item.completion.commitCharacters)) {
                // no item or no commit characters
                this.reset();
                return;
            }
            if (this._active && this._active.item.item === selected.item) {
                // still the same item
                return;
            }
            // keep item and its commit characters
            const acceptCharacters = new characterClassifier_1.CharacterSet();
            for (const ch of selected.item.completion.commitCharacters) {
                if (ch.length > 0) {
                    acceptCharacters.add(ch.charCodeAt(0));
                }
            }
            this._active = { acceptCharacters, item: selected };
        }
        reset() {
            this._active = undefined;
        }
        dispose() {
            this._disposables.dispose();
        }
    }
    exports.CommitCharacterController = CommitCharacterController;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdENvbW1pdENoYXJhY3RlcnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L2Jyb3dzZXIvc3VnZ2VzdENvbW1pdENoYXJhY3RlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEseUJBQXlCO1FBU3JDLFlBQVksTUFBbUIsRUFBRSxNQUFxQixFQUFFLEtBQW1CLEVBQUUsTUFBOEM7WUFQMUcsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQVNyRCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM1QyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3pDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDYjtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUUxRCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5QyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSyxDQUFDLEtBQUssdUJBQWUsRUFBRTtvQkFDckUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLHdEQUFnRCxFQUFFO3dCQUM5RyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0Q7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLE9BQU8sQ0FBQyxRQUF5QztZQUN4RCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBQSx3QkFBZSxFQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQzdFLGtDQUFrQztnQkFDbEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU87YUFDUDtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDN0Qsc0JBQXNCO2dCQUN0QixPQUFPO2FBQ1A7WUFFRCxzQ0FBc0M7WUFDdEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGtDQUFZLEVBQUUsQ0FBQztZQUM1QyxLQUFLLE1BQU0sRUFBRSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFO2dCQUMzRCxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNsQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN2QzthQUNEO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQztRQUNyRCxDQUFDO1FBRUQsS0FBSztZQUNKLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3QixDQUFDO0tBQ0Q7SUEvREQsOERBK0RDIn0=