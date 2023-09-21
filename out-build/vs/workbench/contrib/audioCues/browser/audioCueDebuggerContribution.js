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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/platform/audioCues/browser/audioCueService", "vs/workbench/contrib/debug/common/debug"], function (require, exports, lifecycle_1, observable_1, audioCueService_1, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q1b = void 0;
    let $Q1b = class $Q1b extends lifecycle_1.$kc {
        constructor(debugService, a) {
            super();
            this.a = a;
            const isEnabled = (0, observable_1.observableFromEvent)(a.onEnabledChanged(audioCueService_1.$wZ.onDebugBreak), () => a.isEnabled(audioCueService_1.$wZ.onDebugBreak));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description subscribe to debug sessions */
                if (!isEnabled.read(reader)) {
                    return;
                }
                const sessionDisposables = new Map();
                store.add((0, lifecycle_1.$ic)(() => {
                    sessionDisposables.forEach(d => d.dispose());
                    sessionDisposables.clear();
                }));
                store.add(debugService.onDidNewSession((session) => sessionDisposables.set(session, this.b(session))));
                store.add(debugService.onDidEndSession(session => {
                    sessionDisposables.get(session)?.dispose();
                    sessionDisposables.delete(session);
                }));
                debugService
                    .getModel()
                    .getSessions()
                    .forEach((session) => sessionDisposables.set(session, this.b(session)));
            }));
        }
        b(session) {
            return session.onDidChangeState(e => {
                const stoppedDetails = session.getStoppedDetails();
                const BREAKPOINT_STOP_REASON = 'breakpoint';
                if (stoppedDetails && stoppedDetails.reason === BREAKPOINT_STOP_REASON) {
                    this.a.playAudioCue(audioCueService_1.$wZ.onDebugBreak);
                }
            });
        }
    };
    exports.$Q1b = $Q1b;
    exports.$Q1b = $Q1b = __decorate([
        __param(0, debug_1.$nH),
        __param(1, audioCueService_1.$sZ)
    ], $Q1b);
});
//# sourceMappingURL=audioCueDebuggerContribution.js.map