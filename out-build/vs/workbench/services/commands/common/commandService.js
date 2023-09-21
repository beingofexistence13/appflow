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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/services/extensions/common/extensions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/instantiation/common/extensions", "vs/base/common/async"], function (require, exports, instantiation_1, commands_1, extensions_1, event_1, lifecycle_1, log_1, extensions_2, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6yb = void 0;
    let $6yb = class $6yb extends lifecycle_1.$kc {
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = false;
            this.c = this.B(new event_1.$fd());
            this.onWillExecuteCommand = this.c.event;
            this.f = new event_1.$fd();
            this.onDidExecuteCommand = this.f.event;
            this.h.whenInstalledExtensionsRegistered().then(value => this.a = value);
            this.b = null;
        }
        m() {
            if (!this.b) {
                // wait for * activation, limited to at most 30s
                this.b = Promise.race([
                    this.h.activateByEvent(`*`),
                    (0, async_1.$Hg)(30000)
                ]);
            }
            return this.b;
        }
        async executeCommand(id, ...args) {
            this.j.trace('CommandService#executeCommand', id);
            const activationEvent = `onCommand:${id}`;
            const commandIsRegistered = !!commands_1.$Gr.getCommand(id);
            if (commandIsRegistered) {
                // if the activation event has already resolved (i.e. subsequent call),
                // we will execute the registered command immediately
                if (this.h.activationEventIsDone(activationEvent)) {
                    return this.n(id, args);
                }
                // if the extension host didn't start yet, we will execute the registered
                // command immediately and send an activation event, but not wait for it
                if (!this.a) {
                    this.h.activateByEvent(activationEvent); // intentionally not awaited
                    return this.n(id, args);
                }
                // we will wait for a simple activation event (e.g. in case an extension wants to overwrite it)
                await this.h.activateByEvent(activationEvent);
                return this.n(id, args);
            }
            // finally, if the command is not registered we will send a simple activation event
            // as well as a * activation event raced against registration and against 30s
            await Promise.all([
                this.h.activateByEvent(activationEvent),
                Promise.race([
                    // race * activation against command registration
                    this.m(),
                    event_1.Event.toPromise(event_1.Event.filter(commands_1.$Gr.onDidRegisterCommand, e => e === id))
                ]),
            ]);
            return this.n(id, args);
        }
        n(id, args) {
            const command = commands_1.$Gr.getCommand(id);
            if (!command) {
                return Promise.reject(new Error(`command '${id}' not found`));
            }
            try {
                this.c.fire({ commandId: id, args });
                const result = this.g.invokeFunction(command.handler, ...args);
                this.f.fire({ commandId: id, args });
                return Promise.resolve(result);
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
    };
    exports.$6yb = $6yb;
    exports.$6yb = $6yb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, extensions_1.$MF),
        __param(2, log_1.$5i)
    ], $6yb);
    (0, extensions_2.$mr)(commands_1.$Fr, $6yb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=commandService.js.map