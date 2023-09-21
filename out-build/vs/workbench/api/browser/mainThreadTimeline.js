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
define(["require", "exports", "vs/base/common/event", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/contrib/timeline/common/timeline", "vs/base/common/marshalling"], function (require, exports, event_1, log_1, extHost_protocol_1, extHostCustomers_1, timeline_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fsb = void 0;
    let $Fsb = class $Fsb {
        constructor(context, c, d) {
            this.c = c;
            this.d = d;
            this.b = new Map();
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostTimeline);
        }
        $registerTimelineProvider(provider) {
            this.c.trace(`MainThreadTimeline#registerTimelineProvider: id=${provider.id}`);
            const proxy = this.a;
            const emitters = this.b;
            let onDidChange = emitters.get(provider.id);
            if (onDidChange === undefined) {
                onDidChange = new event_1.$fd();
                emitters.set(provider.id, onDidChange);
            }
            this.d.registerTimelineProvider({
                ...provider,
                onDidChange: onDidChange.event,
                async provideTimeline(uri, options, token) {
                    return (0, marshalling_1.$$g)(await proxy.$getTimeline(provider.id, uri, options, token));
                },
                dispose() {
                    emitters.delete(provider.id);
                    onDidChange?.dispose();
                }
            });
        }
        $unregisterTimelineProvider(id) {
            this.c.trace(`MainThreadTimeline#unregisterTimelineProvider: id=${id}`);
            this.d.unregisterTimelineProvider(id);
        }
        $emitTimelineChangeEvent(e) {
            this.c.trace(`MainThreadTimeline#emitChangeEvent: id=${e.id}, uri=${e.uri?.toString(true)}`);
            const emitter = this.b.get(e.id);
            emitter?.fire(e);
        }
        dispose() {
            // noop
        }
    };
    exports.$Fsb = $Fsb;
    exports.$Fsb = $Fsb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadTimeline),
        __param(1, log_1.$5i),
        __param(2, timeline_1.$ZI)
    ], $Fsb);
});
//# sourceMappingURL=mainThreadTimeline.js.map