/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom"], function (require, exports, DOM) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createElement = exports.renderFormattedText = exports.renderText = void 0;
    function renderText(text, options = {}) {
        const element = createElement(options);
        element.textContent = text;
        return element;
    }
    exports.renderText = renderText;
    function renderFormattedText(formattedText, options = {}) {
        const element = createElement(options);
        _renderFormattedText(element, parseFormattedText(formattedText, !!options.renderCodeSegments), options.actionHandler, options.renderCodeSegments);
        return element;
    }
    exports.renderFormattedText = renderFormattedText;
    function createElement(options) {
        const tagName = options.inline ? 'span' : 'div';
        const element = document.createElement(tagName);
        if (options.className) {
            element.className = options.className;
        }
        return element;
    }
    exports.createElement = createElement;
    class StringStream {
        constructor(source) {
            this.source = source;
            this.index = 0;
        }
        eos() {
            return this.index >= this.source.length;
        }
        next() {
            const next = this.peek();
            this.advance();
            return next;
        }
        peek() {
            return this.source[this.index];
        }
        advance() {
            this.index++;
        }
    }
    var FormatType;
    (function (FormatType) {
        FormatType[FormatType["Invalid"] = 0] = "Invalid";
        FormatType[FormatType["Root"] = 1] = "Root";
        FormatType[FormatType["Text"] = 2] = "Text";
        FormatType[FormatType["Bold"] = 3] = "Bold";
        FormatType[FormatType["Italics"] = 4] = "Italics";
        FormatType[FormatType["Action"] = 5] = "Action";
        FormatType[FormatType["ActionClose"] = 6] = "ActionClose";
        FormatType[FormatType["Code"] = 7] = "Code";
        FormatType[FormatType["NewLine"] = 8] = "NewLine";
    })(FormatType || (FormatType = {}));
    function _renderFormattedText(element, treeNode, actionHandler, renderCodeSegments) {
        let child;
        if (treeNode.type === 2 /* FormatType.Text */) {
            child = document.createTextNode(treeNode.content || '');
        }
        else if (treeNode.type === 3 /* FormatType.Bold */) {
            child = document.createElement('b');
        }
        else if (treeNode.type === 4 /* FormatType.Italics */) {
            child = document.createElement('i');
        }
        else if (treeNode.type === 7 /* FormatType.Code */ && renderCodeSegments) {
            child = document.createElement('code');
        }
        else if (treeNode.type === 5 /* FormatType.Action */ && actionHandler) {
            const a = document.createElement('a');
            actionHandler.disposables.add(DOM.addStandardDisposableListener(a, 'click', (event) => {
                actionHandler.callback(String(treeNode.index), event);
            }));
            child = a;
        }
        else if (treeNode.type === 8 /* FormatType.NewLine */) {
            child = document.createElement('br');
        }
        else if (treeNode.type === 1 /* FormatType.Root */) {
            child = element;
        }
        if (child && element !== child) {
            element.appendChild(child);
        }
        if (child && Array.isArray(treeNode.children)) {
            treeNode.children.forEach((nodeChild) => {
                _renderFormattedText(child, nodeChild, actionHandler, renderCodeSegments);
            });
        }
    }
    function parseFormattedText(content, parseCodeSegments) {
        const root = {
            type: 1 /* FormatType.Root */,
            children: []
        };
        let actionViewItemIndex = 0;
        let current = root;
        const stack = [];
        const stream = new StringStream(content);
        while (!stream.eos()) {
            let next = stream.next();
            const isEscapedFormatType = (next === '\\' && formatTagType(stream.peek(), parseCodeSegments) !== 0 /* FormatType.Invalid */);
            if (isEscapedFormatType) {
                next = stream.next(); // unread the backslash if it escapes a format tag type
            }
            if (!isEscapedFormatType && isFormatTag(next, parseCodeSegments) && next === stream.peek()) {
                stream.advance();
                if (current.type === 2 /* FormatType.Text */) {
                    current = stack.pop();
                }
                const type = formatTagType(next, parseCodeSegments);
                if (current.type === type || (current.type === 5 /* FormatType.Action */ && type === 6 /* FormatType.ActionClose */)) {
                    current = stack.pop();
                }
                else {
                    const newCurrent = {
                        type: type,
                        children: []
                    };
                    if (type === 5 /* FormatType.Action */) {
                        newCurrent.index = actionViewItemIndex;
                        actionViewItemIndex++;
                    }
                    current.children.push(newCurrent);
                    stack.push(current);
                    current = newCurrent;
                }
            }
            else if (next === '\n') {
                if (current.type === 2 /* FormatType.Text */) {
                    current = stack.pop();
                }
                current.children.push({
                    type: 8 /* FormatType.NewLine */
                });
            }
            else {
                if (current.type !== 2 /* FormatType.Text */) {
                    const textCurrent = {
                        type: 2 /* FormatType.Text */,
                        content: next
                    };
                    current.children.push(textCurrent);
                    stack.push(current);
                    current = textCurrent;
                }
                else {
                    current.content += next;
                }
            }
        }
        if (current.type === 2 /* FormatType.Text */) {
            current = stack.pop();
        }
        if (stack.length) {
            // incorrectly formatted string literal
        }
        return root;
    }
    function isFormatTag(char, supportCodeSegments) {
        return formatTagType(char, supportCodeSegments) !== 0 /* FormatType.Invalid */;
    }
    function formatTagType(char, supportCodeSegments) {
        switch (char) {
            case '*':
                return 3 /* FormatType.Bold */;
            case '_':
                return 4 /* FormatType.Italics */;
            case '[':
                return 5 /* FormatType.Action */;
            case ']':
                return 6 /* FormatType.ActionClose */;
            case '`':
                return supportCodeSegments ? 7 /* FormatType.Code */ : 0 /* FormatType.Invalid */;
            default:
                return 0 /* FormatType.Invalid */;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGVkVGV4dFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2Zvcm1hdHRlZFRleHRSZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLFNBQWdCLFVBQVUsQ0FBQyxJQUFZLEVBQUUsVUFBc0MsRUFBRTtRQUNoRixNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDM0IsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUpELGdDQUlDO0lBRUQsU0FBZ0IsbUJBQW1CLENBQUMsYUFBcUIsRUFBRSxVQUFzQyxFQUFFO1FBQ2xHLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRSxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xKLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFKRCxrREFJQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxPQUFtQztRQUNoRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNoRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUN0QixPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7U0FDdEM7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBUEQsc0NBT0M7SUFFRCxNQUFNLFlBQVk7UUFJakIsWUFBWSxNQUFjO1lBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7UUFFTSxHQUFHO1lBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxJQUFJO1lBQ1YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLElBQUk7WUFDVixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2QsQ0FBQztLQUNEO0lBRUQsSUFBVyxVQVVWO0lBVkQsV0FBVyxVQUFVO1FBQ3BCLGlEQUFPLENBQUE7UUFDUCwyQ0FBSSxDQUFBO1FBQ0osMkNBQUksQ0FBQTtRQUNKLDJDQUFJLENBQUE7UUFDSixpREFBTyxDQUFBO1FBQ1AsK0NBQU0sQ0FBQTtRQUNOLHlEQUFXLENBQUE7UUFDWCwyQ0FBSSxDQUFBO1FBQ0osaURBQU8sQ0FBQTtJQUNSLENBQUMsRUFWVSxVQUFVLEtBQVYsVUFBVSxRQVVwQjtJQVNELFNBQVMsb0JBQW9CLENBQUMsT0FBYSxFQUFFLFFBQTBCLEVBQUUsYUFBcUMsRUFBRSxrQkFBNEI7UUFDM0ksSUFBSSxLQUF1QixDQUFDO1FBRTVCLElBQUksUUFBUSxDQUFDLElBQUksNEJBQW9CLEVBQUU7WUFDdEMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN4RDthQUFNLElBQUksUUFBUSxDQUFDLElBQUksNEJBQW9CLEVBQUU7WUFDN0MsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLCtCQUF1QixFQUFFO1lBQ2hELEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO2FBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSw0QkFBb0IsSUFBSSxrQkFBa0IsRUFBRTtZQUNuRSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN2QzthQUFNLElBQUksUUFBUSxDQUFDLElBQUksOEJBQXNCLElBQUksYUFBYSxFQUFFO1lBQ2hFLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDckYsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ1Y7YUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLCtCQUF1QixFQUFFO1lBQ2hELEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JDO2FBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSw0QkFBb0IsRUFBRTtZQUM3QyxLQUFLLEdBQUcsT0FBTyxDQUFDO1NBQ2hCO1FBRUQsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssRUFBRTtZQUMvQixPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDOUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtnQkFDdkMsb0JBQW9CLENBQUMsS0FBTSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUM1RSxDQUFDLENBQUMsQ0FBQztTQUNIO0lBQ0YsQ0FBQztJQUVELFNBQVMsa0JBQWtCLENBQUMsT0FBZSxFQUFFLGlCQUEwQjtRQUV0RSxNQUFNLElBQUksR0FBcUI7WUFDOUIsSUFBSSx5QkFBaUI7WUFDckIsUUFBUSxFQUFFLEVBQUU7U0FDWixDQUFDO1FBRUYsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sS0FBSyxHQUF1QixFQUFFLENBQUM7UUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFekMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNyQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFekIsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQywrQkFBdUIsQ0FBQyxDQUFDO1lBQ3RILElBQUksbUJBQW1CLEVBQUU7Z0JBQ3hCLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyx1REFBdUQ7YUFDN0U7WUFFRCxJQUFJLENBQUMsbUJBQW1CLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQzNGLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFakIsSUFBSSxPQUFPLENBQUMsSUFBSSw0QkFBb0IsRUFBRTtvQkFDckMsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUcsQ0FBQztpQkFDdkI7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksOEJBQXNCLElBQUksSUFBSSxtQ0FBMkIsQ0FBQyxFQUFFO29CQUNyRyxPQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDTixNQUFNLFVBQVUsR0FBcUI7d0JBQ3BDLElBQUksRUFBRSxJQUFJO3dCQUNWLFFBQVEsRUFBRSxFQUFFO3FCQUNaLENBQUM7b0JBRUYsSUFBSSxJQUFJLDhCQUFzQixFQUFFO3dCQUMvQixVQUFVLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDO3dCQUN2QyxtQkFBbUIsRUFBRSxDQUFDO3FCQUN0QjtvQkFFRCxPQUFPLENBQUMsUUFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDcEIsT0FBTyxHQUFHLFVBQVUsQ0FBQztpQkFDckI7YUFDRDtpQkFBTSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ3pCLElBQUksT0FBTyxDQUFDLElBQUksNEJBQW9CLEVBQUU7b0JBQ3JDLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFHLENBQUM7aUJBQ3ZCO2dCQUVELE9BQU8sQ0FBQyxRQUFTLENBQUMsSUFBSSxDQUFDO29CQUN0QixJQUFJLDRCQUFvQjtpQkFDeEIsQ0FBQyxDQUFDO2FBRUg7aUJBQU07Z0JBQ04sSUFBSSxPQUFPLENBQUMsSUFBSSw0QkFBb0IsRUFBRTtvQkFDckMsTUFBTSxXQUFXLEdBQXFCO3dCQUNyQyxJQUFJLHlCQUFpQjt3QkFDckIsT0FBTyxFQUFFLElBQUk7cUJBQ2IsQ0FBQztvQkFDRixPQUFPLENBQUMsUUFBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDcEIsT0FBTyxHQUFHLFdBQVcsQ0FBQztpQkFFdEI7cUJBQU07b0JBQ04sT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7aUJBQ3hCO2FBQ0Q7U0FDRDtRQUVELElBQUksT0FBTyxDQUFDLElBQUksNEJBQW9CLEVBQUU7WUFDckMsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUcsQ0FBQztTQUN2QjtRQUVELElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNqQix1Q0FBdUM7U0FDdkM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFZLEVBQUUsbUJBQTRCO1FBQzlELE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQywrQkFBdUIsQ0FBQztJQUN4RSxDQUFDO0lBRUQsU0FBUyxhQUFhLENBQUMsSUFBWSxFQUFFLG1CQUE0QjtRQUNoRSxRQUFRLElBQUksRUFBRTtZQUNiLEtBQUssR0FBRztnQkFDUCwrQkFBdUI7WUFDeEIsS0FBSyxHQUFHO2dCQUNQLGtDQUEwQjtZQUMzQixLQUFLLEdBQUc7Z0JBQ1AsaUNBQXlCO1lBQzFCLEtBQUssR0FBRztnQkFDUCxzQ0FBOEI7WUFDL0IsS0FBSyxHQUFHO2dCQUNQLE9BQU8sbUJBQW1CLENBQUMsQ0FBQyx5QkFBaUIsQ0FBQywyQkFBbUIsQ0FBQztZQUNuRTtnQkFDQyxrQ0FBMEI7U0FDM0I7SUFDRixDQUFDIn0=