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
    exports.$Qyb = void 0;
    let ViewContainerActivityByView = class ViewContainerActivityByView extends lifecycle_1.$kc {
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = undefined;
            this.b = lifecycle_1.$kc.None;
            this.B(event_1.Event.filter(this.f.onDidChangeContainer, e => e.views.some(view => view.id === c))(() => this.h()));
            this.B(event_1.Event.filter(this.f.onDidChangeLocation, e => e.views.some(view => view.id === c))(() => this.h()));
        }
        setActivity(activity) {
            this.a = activity;
            this.h();
        }
        clearActivity() {
            this.a = undefined;
            this.h();
        }
        h() {
            this.b.dispose();
            const container = this.f.getViewContainerByViewId(this.c);
            if (container && this.a) {
                this.b = this.g.showViewContainerActivity(container.id, this.a);
            }
        }
        dispose() {
            this.b.dispose();
        }
    };
    ViewContainerActivityByView = __decorate([
        __param(1, views_1.$_E),
        __param(2, activity_1.$HV)
    ], ViewContainerActivityByView);
    let $Qyb = class $Qyb {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = new Map();
        }
        showViewContainerActivity(viewContainerId, { badge, clazz, priority }) {
            const viewContainer = this.c.getViewContainerById(viewContainerId);
            if (viewContainer) {
                const location = this.c.getViewContainerLocation(viewContainer);
                if (location !== null) {
                    return this.b.showActivity(viewContainer.id, location, badge, clazz, priority);
                }
            }
            return lifecycle_1.$kc.None;
        }
        showViewActivity(viewId, activity) {
            let maybeItem = this.a.get(viewId);
            if (maybeItem) {
                maybeItem.id++;
            }
            else {
                maybeItem = {
                    id: 1,
                    activity: this.d.createInstance(ViewContainerActivityByView, viewId)
                };
                this.a.set(viewId, maybeItem);
            }
            const id = maybeItem.id;
            maybeItem.activity.setActivity(activity);
            const item = maybeItem;
            return (0, lifecycle_1.$ic)(() => {
                if (item.id === id) {
                    item.activity.dispose();
                    this.a.delete(viewId);
                }
            });
        }
        showAccountsActivity({ badge, clazz, priority }) {
            return this.b.showActivity(activity_2.$Btb, 0 /* ViewContainerLocation.Sidebar */, badge, clazz, priority);
        }
        showGlobalActivity({ badge, clazz, priority }) {
            return this.b.showActivity(activity_2.$Atb, 0 /* ViewContainerLocation.Sidebar */, badge, clazz, priority);
        }
    };
    exports.$Qyb = $Qyb;
    exports.$Qyb = $Qyb = __decorate([
        __param(0, panecomposite_1.$Yeb),
        __param(1, views_1.$_E),
        __param(2, instantiation_1.$Ah)
    ], $Qyb);
    (0, extensions_1.$mr)(activity_1.$HV, $Qyb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=activityService.js.map