/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/json", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, json_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SmartSnippetInserter = void 0;
    class SmartSnippetInserter {
        static hasOpenBrace(scanner) {
            while (scanner.scan() !== 17 /* JSONSyntaxKind.EOF */) {
                const kind = scanner.getToken();
                if (kind === 1 /* JSONSyntaxKind.OpenBraceToken */) {
                    return true;
                }
            }
            return false;
        }
        static offsetToPosition(model, offset) {
            let offsetBeforeLine = 0;
            const eolLength = model.getEOL().length;
            const lineCount = model.getLineCount();
            for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
                const lineTotalLength = model.getLineContent(lineNumber).length + eolLength;
                const offsetAfterLine = offsetBeforeLine + lineTotalLength;
                if (offsetAfterLine > offset) {
                    return new position_1.Position(lineNumber, offset - offsetBeforeLine + 1);
                }
                offsetBeforeLine = offsetAfterLine;
            }
            return new position_1.Position(lineCount, model.getLineMaxColumn(lineCount));
        }
        static insertSnippet(model, _position) {
            const desiredPosition = model.getValueLengthInRange(new range_1.Range(1, 1, _position.lineNumber, _position.column));
            // <INVALID> [ <BEFORE_OBJECT> { <INVALID> } <AFTER_OBJECT>, <BEFORE_OBJECT> { <INVALID> } <AFTER_OBJECT> ] <INVALID>
            let State;
            (function (State) {
                State[State["INVALID"] = 0] = "INVALID";
                State[State["AFTER_OBJECT"] = 1] = "AFTER_OBJECT";
                State[State["BEFORE_OBJECT"] = 2] = "BEFORE_OBJECT";
            })(State || (State = {}));
            let currentState = State.INVALID;
            let lastValidPos = -1;
            let lastValidState = State.INVALID;
            const scanner = (0, json_1.createScanner)(model.getValue());
            let arrayLevel = 0;
            let objLevel = 0;
            const checkRangeStatus = (pos, state) => {
                if (state !== State.INVALID && arrayLevel === 1 && objLevel === 0) {
                    currentState = state;
                    lastValidPos = pos;
                    lastValidState = state;
                }
                else {
                    if (currentState !== State.INVALID) {
                        currentState = State.INVALID;
                        lastValidPos = scanner.getTokenOffset();
                    }
                }
            };
            while (scanner.scan() !== 17 /* JSONSyntaxKind.EOF */) {
                const currentPos = scanner.getPosition();
                const kind = scanner.getToken();
                let goodKind = false;
                switch (kind) {
                    case 3 /* JSONSyntaxKind.OpenBracketToken */:
                        goodKind = true;
                        arrayLevel++;
                        checkRangeStatus(currentPos, State.BEFORE_OBJECT);
                        break;
                    case 4 /* JSONSyntaxKind.CloseBracketToken */:
                        goodKind = true;
                        arrayLevel--;
                        checkRangeStatus(currentPos, State.INVALID);
                        break;
                    case 5 /* JSONSyntaxKind.CommaToken */:
                        goodKind = true;
                        checkRangeStatus(currentPos, State.BEFORE_OBJECT);
                        break;
                    case 1 /* JSONSyntaxKind.OpenBraceToken */:
                        goodKind = true;
                        objLevel++;
                        checkRangeStatus(currentPos, State.INVALID);
                        break;
                    case 2 /* JSONSyntaxKind.CloseBraceToken */:
                        goodKind = true;
                        objLevel--;
                        checkRangeStatus(currentPos, State.AFTER_OBJECT);
                        break;
                    case 15 /* JSONSyntaxKind.Trivia */:
                    case 14 /* JSONSyntaxKind.LineBreakTrivia */:
                        goodKind = true;
                }
                if (currentPos >= desiredPosition && (currentState !== State.INVALID || lastValidPos !== -1)) {
                    let acceptPosition;
                    let acceptState;
                    if (currentState !== State.INVALID) {
                        acceptPosition = (goodKind ? currentPos : scanner.getTokenOffset());
                        acceptState = currentState;
                    }
                    else {
                        acceptPosition = lastValidPos;
                        acceptState = lastValidState;
                    }
                    if (acceptState === State.AFTER_OBJECT) {
                        return {
                            position: this.offsetToPosition(model, acceptPosition),
                            prepend: ',',
                            append: ''
                        };
                    }
                    else {
                        scanner.setPosition(acceptPosition);
                        return {
                            position: this.offsetToPosition(model, acceptPosition),
                            prepend: '',
                            append: this.hasOpenBrace(scanner) ? ',' : ''
                        };
                    }
                }
            }
            // no valid position found!
            const modelLineCount = model.getLineCount();
            return {
                position: new position_1.Position(modelLineCount, model.getLineMaxColumn(modelLineCount)),
                prepend: '\n[',
                append: ']'
            };
        }
    }
    exports.SmartSnippetInserter = SmartSnippetInserter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21hcnRTbmlwcGV0SW5zZXJ0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy9jb21tb24vc21hcnRTbmlwcGV0SW5zZXJ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsb0JBQW9CO1FBRXhCLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBb0I7WUFFL0MsT0FBTyxPQUFPLENBQUMsSUFBSSxFQUFFLGdDQUF1QixFQUFFO2dCQUM3QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRWhDLElBQUksSUFBSSwwQ0FBa0MsRUFBRTtvQkFDM0MsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFpQixFQUFFLE1BQWM7WUFDaEUsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7WUFDekIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUN4QyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdkMsS0FBSyxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsVUFBVSxJQUFJLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFDL0QsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO2dCQUM1RSxNQUFNLGVBQWUsR0FBRyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7Z0JBRTNELElBQUksZUFBZSxHQUFHLE1BQU0sRUFBRTtvQkFDN0IsT0FBTyxJQUFJLG1CQUFRLENBQ2xCLFVBQVUsRUFDVixNQUFNLEdBQUcsZ0JBQWdC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