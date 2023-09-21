/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/severity"], function (require, exports, event_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestDialogService = void 0;
    class TestDialogService {
        constructor(defaultConfirmResult = undefined) {
            this.defaultConfirmResult = defaultConfirmResult;
            this.onWillShowDialog = event_1.Event.None;
            this.onDidShowDialog = event_1.Event.None;
            this.confirmResult = undefined;
        }
        setConfirmResult(result) {
            this.confirmResult = result;
        }
        async confirm(confirmation) {
            if (this.confirmResult) {
                const confirmResult = this.confirmResult;
                this.confirmResult = undefined;
                return confirmResult;
            }
            return this.defaultConfirmResult ?? { confirmed: false };
        }
        async prompt(prompt) {
            const promptButtons = [...(prompt.buttons ?? [])];
            if (prompt.cancelButton && typeof prompt.cancelButton !== 'string' && typeof prompt.cancelButton !== 'boolean') {
                promptButtons.push(prompt.cancelButton);
            }
            return { result: await promptButtons[0]?.run({ checkboxChecked: false }) };
        }
        async info(message, detail) {
            await this.prompt({ type: severity_1.default.Info, message, detail });
        }
        async warn(message, detail) {
            await this.prompt({ type: severity_1.default.Warning, message, detail });
        }
        async error(message, detail) {
            await this.prompt({ type: severity_1.default.Error, message, detail });
        }
        async input() { {
            return { confirmed: true, values: [] };
        } }
        async about() { }
    }
    exports.TestDialogService = TestDialogService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdERpYWxvZ1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9kaWFsb2dzL3Rlc3QvY29tbW9uL3Rlc3REaWFsb2dTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLGlCQUFpQjtRQU83QixZQUFvQix1QkFBd0QsU0FBUztZQUFqRSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTZDO1lBSDVFLHFCQUFnQixHQUFHLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDOUIsb0JBQWUsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBSTlCLGtCQUFhLEdBQW9DLFNBQVMsQ0FBQztRQUZzQixDQUFDO1FBRzFGLGdCQUFnQixDQUFDLE1BQTJCO1lBQzNDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1FBQzdCLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQTJCO1lBQ3hDLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdkIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDekMsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7Z0JBRS9CLE9BQU8sYUFBYSxDQUFDO2FBQ3JCO1lBRUQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDMUQsQ0FBQztRQUtELEtBQUssQ0FBQyxNQUFNLENBQUksTUFBK0M7WUFDOUQsTUFBTSxhQUFhLEdBQTJCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRSxJQUFJLE1BQU0sQ0FBQyxZQUFZLElBQUksT0FBTyxNQUFNLENBQUMsWUFBWSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO2dCQUMvRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN4QztZQUVELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUM1RSxDQUFDO1FBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFlLEVBQUUsTUFBZTtZQUMxQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsa0JBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBZSxFQUFFLE1BQWU7WUFDMUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLGtCQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQWUsRUFBRSxNQUFlO1lBQzNDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxrQkFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBQ0QsS0FBSyxDQUFDLEtBQUssS0FBNEI7WUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUM7U0FBRSxDQUFDLENBQUM7UUFDcEYsS0FBSyxDQUFDLEtBQUssS0FBb0IsQ0FBQztLQUNoQztJQWpERCw4Q0FpREMifQ==