/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/services/activity/common/activity", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/workbench/common/views", "vs/workbench/common/activity", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, activity_1, lifecycle_1, extensions_1, views_1, activity_2, event_1, instantiation_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActivityService = void 0;
    let ViewContainerActivityByView = class ViewContainerActivityByView extends lifecycle_1.Disposable {
        constructor(viewId, viewDescriptorService, activityService) {
            super();
            this.viewId = viewId;
            this.viewDescriptorService = viewDescriptorService;
            this.activityService = activityService;
            this.activity = undefined;
            this.activityDisposable = lifecycle_1.Disposable.None;
            this._register(event_1.Event.filter(this.viewDescriptorService.onDidChangeContainer, e => e.views.some(view => view.id === viewId))(() => this.update()));
            this._register(event_1.Event.filter(this.viewDescriptorService.onDidChangeLocation, e => e.views.some(view => view.id === viewId))(() => this.update()));
        }
        setActivity(activity) {
            this.activity = activity;
            this.update();
        }
        clearActivity() {
            this.activity = undefined;
            this.update();
        }
        update() {
            this.activityDisposable.dispose();
            const container = this.viewDescriptorService.getViewContainerByViewId(this.viewId);
            if (container && this.activity) {
                this.activityDisposable = this.activityService.showViewContainerActivity(container.id, this.activity);
            }
        }
        dispose() {
            this.activityDisposable.dispose();
        }
    };
    ViewContainerActivityByView = __decorate([
        __param(1, views_1.IViewDescriptorService),
        __param(2, activity_1.IActivityService)
    ], ViewContainerActivityByView);
    let ActivityService = class ActivityService {
        constructor(paneCompositeService, viewDescriptorService, instantiationService) {
            this.paneCompositeService = paneCompositeService;
            this.viewDescriptorService = viewDescriptorService;
            this.instantiationService = instantiationService;
            this.viewActivities = new Map();
        }
        showViewContainerActivity(viewContainerId, { badge, clazz, priority }) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
            if (viewContainer) {
                const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                if (location !== null) {
                    return this.paneCompositeService.showActivity(viewContainer.id, location, badge, clazz, priority);
                }
            }
            return lifecycle_1.Disposable.None;
        }
        showViewActivity(viewId, activity) {
            let maybeItem = this.viewActivities.get(viewId);
            if (maybeItem) {
                maybeItem.id++;
            }
            else {
                maybeItem = {
                    id: 1,
                    activity: this.instantiationService.createInstance(ViewContainerActivityByView, viewId)
                };
                this.viewActivities.set(viewId, maybeItem);
            }
            const id = maybeItem.id;
            maybeItem.activity.setActivity(activity);
            const item = maybeItem;
            return (0, lifecycle_1.toDisposable)(() => {
                if (item.id === id) {
                    item.activity.dispose();
                    this.viewActivities.delete(viewId);
                }
            });
        }
        showAccountsActivity({ badge, clazz, priority }) {
            return this.paneCompositeService.showActivity(activity_2.ACCOUNTS_ACTIVITY_ID, 0 /* ViewContainerLocation.Sidebar */, badge, clazz, priority);
        }
        showGlobalActivity({ badge, clazz, priority }) {
            return this.paneCompositeService.showActivity(activity_2.GLOBAL_ACTIVITY_ID, 0 /* ViewContainerLocation.Sidebar */, badge, clazz, priority);
        }
    };
    exports.ActivityService = ActivityService;
    exports.ActivityService = ActivityService = __decorate([
        __param(0, panecomposite_1.IPaneCompositePartService),
        __param(1, views_1.IViewDescriptorService),
        __param(2, instantiation_1.IInstantiationService)
    ], ActivityService);
    (0, extensions_1.registerSingleton)(activity_1.IActivityService, ActivityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2FjdGl2aXR5L2Jyb3dzZXIvYWN0aXZpdHlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVdoRyxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBS25ELFlBQ2tCLE1BQWMsRUFDUCxxQkFBOEQsRUFDcEUsZUFBa0Q7WUFFcEUsS0FBSyxFQUFFLENBQUM7WUFKUyxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ1UsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUNuRCxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFON0QsYUFBUSxHQUEwQixTQUFTLENBQUM7WUFDNUMsdUJBQWtCLEdBQWdCLHNCQUFVLENBQUMsSUFBSSxDQUFDO1lBUXpELElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xKLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxH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