/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, errors_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellStatusBarService = void 0;
    class NotebookCellStatusBarService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeProviders = this._register(new event_1.Emitter());
            this.onDidChangeProviders = this._onDidChangeProviders.event;
            this._onDidChangeItems = this._register(new event_1.Emitter());
            this.onDidChangeItems = this._onDidChangeItems.event;
            this._providers = [];
        }
        registerCellStatusBarItemProvider(provider) {
            this._providers.push(provider);
            let changeListener;
            if (provider.onDidChangeStatusBarItems) {
                changeListener = provider.onDidChangeStatusBarItems(() => this._onDidChangeItems.fire());
            }
            this._onDidChangeProviders.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                changeListener?.dispose();
                const idx = this._providers.findIndex(p => p === provider);
                this._providers.splice(idx, 1);
            });
        }
        async getStatusBarItemsForCell(docUri, cellIndex, viewType, token) {
            const providers = this._providers.filter(p => p.viewType === viewType || p.viewType === '*');
            return await Promise.all(providers.map(async (p) => {
                try {
                    return await p.provideCellStatusBarItems(docUri, cellIndex, token) ?? { items: [] };
                }
                catch (e) {
                    (0, errors_1.onUnexpectedExternalError)(e);
                    return { items: [] };
                }
            }));
        }
    }
    exports.NotebookCellStatusBarService = NotebookCellStatusBarService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsU3RhdHVzQmFyU2VydmljZUltcGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3NlcnZpY2VzL25vdGVib29rQ2VsbFN0YXR1c0JhclNlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFhLDRCQUE2QixTQUFRLHNCQUFVO1FBQTVEOztZQUlrQiwwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNwRSx5QkFBb0IsR0FBZ0IsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQUU3RCxzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNoRSxxQkFBZ0IsR0FBZ0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUVyRCxlQUFVLEdBQXlDLEVBQUUsQ0FBQztRQTZCeEUsQ0FBQztRQTNCQSxpQ0FBaUMsQ0FBQyxRQUE0QztZQUM3RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQixJQUFJLGNBQXVDLENBQUM7WUFDNUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLEVBQUU7Z0JBQ3ZDLGNBQWMsR0FBRyxRQUFRLENBQUMseUJBQXlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7YUFDekY7WUFFRCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFbEMsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLHdCQUF3QixDQUFDLE1BQVcsRUFBRSxTQUFpQixFQUFFLFFBQWdCLEVBQUUsS0FBd0I7WUFDeEcsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQzdGLE9BQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFFO2dCQUNoRCxJQUFJO29CQUNILE9BQU8sTUFBTSxDQUFDLENBQUMseUJBQXlCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQztpQkFDcEY7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1gsSUFBQSxrQ0FBeUIsRUFBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQztpQkFDckI7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNEO0lBdkNELG9FQXVDQyJ9