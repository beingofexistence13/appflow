/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/editor/browser/services/abstractCodeEditorService", "vs/platform/commands/common/commands"], function (require, exports, event_1, abstractCodeEditorService_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestCommandService = exports.TestGlobalStyleSheet = exports.TestCodeEditorService = void 0;
    class TestCodeEditorService extends abstractCodeEditorService_1.AbstractCodeEditorService {
        constructor() {
            super(...arguments);
            this.globalStyleSheet = new TestGlobalStyleSheet();
        }
        _createGlobalStyleSheet() {
            return this.globalStyleSheet;
        }
        getActiveCodeEditor() {
            return null;
        }
        openCodeEditor(input, source, sideBySide) {
            this.lastInput = input;
            return Promise.resolve(null);
        }
    }
    exports.TestCodeEditorService = TestCodeEditorService;
    class TestGlobalStyleSheet extends abstractCodeEditorService_1.GlobalStyleSheet {
        constructor() {
            super(null);
            this.rules = [];
        }
        insertRule(rule, index) {
            this.rules.unshift(rule);
        }
        removeRulesContainingSelector(ruleName) {
            for (let i = 0; i < this.rules.length; i++) {
                if (this.rules[i].indexOf(ruleName) >= 0) {
                    this.rules.splice(i, 1);
                    i--;
                }
            }
        }
        read() {
            return this.rules.join('\n');
        }
    }
    exports.TestGlobalStyleSheet = TestGlobalStyleSheet;
    class TestCommandService {
        constructor(instantiationService) {
            this._onWillExecuteCommand = new event_1.Emitter();
            this.onWillExecuteCommand = this._onWillExecuteCommand.event;
            this._onDidExecuteCommand = new event_1.Emitter();
            this.onDidExecuteCommand = this._onDidExecuteCommand.event;
            this._instantiationService = instantiationService;
        }
        executeCommand(id, ...args) {
            const command = commands_1.CommandsRegistry.getCommand(id);
            if (!command) {
                return Promise.reject(new Error(`command '${id}' not found`));
            }
            try {
                this._onWillExecuteCommand.fire({ commandId: id, args });
                const result = this._instantiationService.invokeFunction.apply(this._instantiationService, [command.handler, ...args]);
                this._onDidExecuteCommand.fire({ commandId: id, args });
                return Promise.resolve(result);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
    }
    exports.TestCommandService = TestCommandService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yVGVzdFNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvYnJvd3Nlci9lZGl0b3JUZXN0U2VydmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQWEscUJBQXNCLFNBQVEscURBQXlCO1FBQXBFOztZQUVpQixxQkFBZ0IsR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7UUFjL0QsQ0FBQztRQVptQix1QkFBdUI7WUFDekMsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsQ0FBQztRQUVELG1CQUFtQjtZQUNsQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFUSxjQUFjLENBQUMsS0FBMkIsRUFBRSxNQUEwQixFQUFFLFVBQW9CO1lBQ3BHLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO0tBQ0Q7SUFoQkQsc0RBZ0JDO0lBRUQsTUFBYSxvQkFBcUIsU0FBUSw0Q0FBZ0I7UUFJekQ7WUFDQyxLQUFLLENBQUMsSUFBSyxDQUFDLENBQUM7WUFIUCxVQUFLLEdBQWEsRUFBRSxDQUFDO1FBSTVCLENBQUM7UUFFZSxVQUFVLENBQUMsSUFBWSxFQUFFLEtBQWM7WUFDdEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVlLDZCQUE2QixDQUFDLFFBQWdCO1lBQzdELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0MsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDeEIsQ0FBQyxFQUFFLENBQUM7aUJBQ0o7YUFDRDtRQUNGLENBQUM7UUFFTSxJQUFJO1lBQ1YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO0tBQ0Q7SUF4QkQsb0RBd0JDO0lBRUQsTUFBYSxrQkFBa0I7UUFXOUIsWUFBWSxvQkFBMkM7WUFOdEMsMEJBQXFCLEdBQUcsSUFBSSxlQUFPLEVBQWlCLENBQUM7WUFDdEQseUJBQW9CLEdBQXlCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7WUFFN0UseUJBQW9CLEdBQUcsSUFBSSxlQUFPLEVBQWlCLENBQUM7WUFDckQsd0JBQW1CLEdBQXlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUM7WUFHM0YsSUFBSSxDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDO1FBQ25ELENBQUM7UUFFTSxjQUFjLENBQUksRUFBVSxFQUFFLEdBQUcsSUFBVztZQUNsRCxNQUFNLE9BQU8sR0FBRywyQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDYixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7YUFDOUQ7WUFFRCxJQUFJO2dCQUNILElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBTSxDQUFDO2dCQUM1SCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDL0I7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDM0I7UUFDRixDQUFDO0tBQ0Q7SUE5QkQsZ0RBOEJDIn0=