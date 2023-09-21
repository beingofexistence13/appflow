/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/instantiation/common/extensions"], function (require, exports, nls, tasks_1, abstractTaskService_1, taskService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskService = void 0;
    class TaskService extends abstractTaskService_1.AbstractTaskService {
        static { this.ProcessTaskSystemSupportMessage = nls.localize('taskService.processTaskSystem', 'Process task system is not support in the web.'); }
        _getTaskSystem() {
            if (this._taskSystem) {
                return this._taskSystem;
            }
            if (this.executionEngine !== tasks_1.ExecutionEngine.Terminal) {
                throw new Error(TaskService.ProcessTaskSystemSupportMessage);
            }
            this._taskSystem = this._createTerminalTaskSystem();
            this._taskSystemListeners =
                [
                    this._taskSystem.onDidStateChange((event) => {
                        this._taskRunningState.set(this._taskSystem.isActiveSync());
                        this._onDidStateChange.fire(event);
                    }),
                ];
            return this._taskSystem;
        }
        _computeLegacyConfiguration(workspaceFolder) {
            throw new Error(TaskService.ProcessTaskSystemSupportMessage);
        }
        _versionAndEngineCompatible(filter) {
            return this.executionEngine === tasks_1.ExecutionEngine.Terminal;
        }
    }
    exports.TaskService = TaskService;
    (0, extensions_1.registerSingleton)(taskService_1.ITaskService, TaskService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy9icm93c2VyL3Rhc2tTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFhLFdBQVksU0FBUSx5Q0FBbUI7aUJBQzNCLG9DQUErQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztRQUVoSixjQUFjO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDckIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQ3hCO1lBQ0QsSUFBSSxJQUFJLENBQUMsZUFBZSxLQUFLLHVCQUFlLENBQUMsUUFBUSxFQUFFO2dCQUN0RCxNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2FBQzdEO1lBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsb0JBQW9CO2dCQUN4QjtvQkFDQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7d0JBQzNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO3dCQUM3RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNwQyxDQUFDLENBQUM7aUJBQ0YsQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBRVMsMkJBQTJCLENBQUMsZUFBaUM7WUFDdEUsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRVMsMkJBQTJCLENBQUMsTUFBb0I7WUFDekQsT0FBTyxJQUFJLENBQUMsZUFBZSxLQUFLLHVCQUFlLENBQUMsUUFBUSxDQUFDO1FBQzFELENBQUM7O0lBM0JGLGtDQTRCQztJQUVELElBQUEsOEJBQWlCLEVBQUMsMEJBQVksRUFBRSxXQUFXLG9DQUE0QixDQUFDIn0=