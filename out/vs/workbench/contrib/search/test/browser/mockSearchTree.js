/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockObjectTree = void 0;
    const someEvent = new event_1.Emitter().event;
    /**
     * Add stub methods as needed
     */
    class MockObjectTree {
        get onDidChangeFocus() { return someEvent; }
        get onDidChangeSelection() { return someEvent; }
        get onDidOpen() { return someEvent; }
        get onMouseClick() { return someEvent; }
        get onMouseDblClick() { return someEvent; }
        get onContextMenu() { return someEvent; }
        get onKeyDown() { return someEvent; }
        get onKeyUp() { return someEvent; }
        get onKeyPress() { return someEvent; }
        get onDidFocus() { return someEvent; }
        get onDidBlur() { return someEvent; }
        get onDidChangeCollapseState() { return someEvent; }
        get onDidChangeRenderNodeCount() { return someEvent; }
        get onDidDispose() { return someEvent; }
        get lastVisibleElement() { return this.elements[this.elements.length - 1]; }
        constructor(elements) {
            this.elements = elements;
        }
        domFocus() { }
        collapse(location, recursive = false) {
            return true;
        }
        expand(location, recursive = false) {
            return true;
        }
        navigate(start) {
            const startIdx = start ? this.elements.indexOf(start) :
                undefined;
            return new ArrayNavigator(this.elements, startIdx);
        }
        getParentElement(elem) {
            return elem.parent();
        }
        dispose() {
        }
    }
    exports.MockObjectTree = MockObjectTree;
    class ArrayNavigator {
        constructor(elements, index = 0) {
            this.elements = elements;
            this.index = index;
        }
        current() {
            return this.elements[this.index];
        }
        previous() {
            return this.elements[--this.index];
        }
        first() {
            this.index = 0;
            return this.elements[this.index];
        }
        last() {
            this.index = this.elements.length - 1;
            return this.elements[this.index];
        }
        next() {
            return this.elements[++this.index];
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja1NlYXJjaFRyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zZWFyY2gvdGVzdC9icm93c2VyL21vY2tTZWFyY2hUcmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxNQUFNLFNBQVMsR0FBRyxJQUFJLGVBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztJQUV0Qzs7T0FFRztJQUNILE1BQWEsY0FBYztRQUUxQixJQUFJLGdCQUFnQixLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM1QyxJQUFJLG9CQUFvQixLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFJLFNBQVMsS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFckMsSUFBSSxZQUFZLEtBQUssT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLElBQUksZUFBZSxLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFJLGFBQWEsS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFekMsSUFBSSxTQUFTLEtBQUssT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksT0FBTyxLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLFVBQVUsS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFFdEMsSUFBSSxVQUFVLEtBQUssT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksU0FBUyxLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUVyQyxJQUFJLHdCQUF3QixLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLDBCQUEwQixLQUFLLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQztRQUV0RCxJQUFJLFlBQVksS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsSUFBSSxrQkFBa0IsS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVFLFlBQW9CLFFBQWU7WUFBZixhQUFRLEdBQVIsUUFBUSxDQUFPO1FBQUksQ0FBQztRQUV4QyxRQUFRLEtBQVcsQ0FBQztRQUVwQixRQUFRLENBQUMsUUFBYyxFQUFFLFlBQXFCLEtBQUs7WUFDbEQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsTUFBTSxDQUFDLFFBQWMsRUFBRSxZQUFxQixLQUFLO1lBQ2hELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELFFBQVEsQ0FBQyxLQUFZO1lBQ3BCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsU0FBUyxDQUFDO1lBRVgsT0FBTyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxJQUFxQjtZQUNyQyxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRUQsT0FBTztRQUNQLENBQUM7S0FDRDtJQWhERCx3Q0FnREM7SUFFRCxNQUFNLGNBQWM7UUFDbkIsWUFBb0IsUUFBYSxFQUFVLFFBQVEsQ0FBQztZQUFoQyxhQUFRLEdBQVIsUUFBUSxDQUFLO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBSTtRQUFJLENBQUM7UUFFekQsT0FBTztZQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELFFBQVE7WUFDUCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELEtBQUs7WUFDSixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN0QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJO1lBQ0gsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLENBQUM7S0FDRCJ9