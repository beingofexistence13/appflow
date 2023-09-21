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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/resources", "vs/editor/common/services/editorWorker", "vs/base/common/event", "vs/base/common/async", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/workbench/services/output/common/output", "vs/base/common/errors"], function (require, exports, instantiation_1, resources, editorWorker_1, event_1, async_1, files_1, model_1, lifecycle_1, types_1, editOperation_1, position_1, range_1, buffer_1, log_1, cancellation_1, output_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eVb = exports.$dVb = void 0;
    class OutputFileListener extends lifecycle_1.$kc {
        constructor(h, j, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = new event_1.$fd();
            this.onDidContentChange = this.a.event;
            this.b = false;
            this.f = new async_1.$Eg(500);
        }
        watch(eTag) {
            if (!this.b) {
                this.g = eTag;
                this.n();
                this.m.trace('Started polling', this.h.toString());
                this.b = true;
            }
        }
        n() {
            const loop = () => this.r().then(() => this.n());
            this.f.trigger(loop).catch(error => {
                if (!(0, errors_1.$2)(error)) {
                    throw error;
                }
            });
        }
        async r() {
            const stat = await this.j.stat(this.h);
            if (stat.etag !== this.g) {
                this.g = stat.etag;
                this.a.fire(stat.size);
            }
        }
        unwatch() {
            if (this.b) {
                this.f.cancel();
                this.b = false;
                this.m.trace('Stopped polling', this.h.toString());
            }
        }
        dispose() {
            this.unwatch();
            super.dispose();
        }
    }
    let $dVb = class $dVb extends lifecycle_1.$kc {
        constructor(u, w, y, z, C, logService, D) {
            super();
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.a = this.B(new event_1.$fd());
            this.onDispose = this.a.event;
            this.f = '';
            this.g = null;
            this.h = null;
            this.j = false;
            this.m = this.B(new lifecycle_1.$lc());
            this.n = this.B(new async_1.$Eg(300));
            this.s = 0;
            this.t = 0;
            this.b = this.B(new OutputFileListener(this.y, this.z, logService));
            this.B(this.b.onDidContentChange(size => this.P(size)));
            this.B((0, lifecycle_1.$ic)(() => this.b.unwatch()));
        }
        append(message) {
            throw new Error('Not supported');
        }
        replace(message) {
            throw new Error('Not supported');
        }
        clear() {
            this.update(output_1.OutputChannelUpdateMode.Clear, this.t, true);
        }
        update(mode, till, immediate) {
            const loadModelPromise = this.g ? this.g : Promise.resolve();
            loadModelPromise.then(() => this.G(mode, till, immediate));
        }
        loadModel() {
            this.g = async_1.Promises.withAsyncBody(async (c, e) => {
                try {
                    let content = '';
                    if (await this.z.exists(this.y)) {
                        const fileContent = await this.z.readFile(this.y, { position: this.s });
                        this.t = this.s + fileContent.value.byteLength;
                        this.f = fileContent.etag;
                        content = fileContent.value.toString();
                    }
                    else {
                        this.s = 0;
                        this.t = 0;
                    }
                    c(this.F(content));
                }
                catch (error) {
                    e(error);
                }
            });
            return this.g;
        }
        F(content) {
            if (this.h) {
                this.h.setValue(content);
            }
            else {
                this.h = this.C.createModel(content, this.w, this.u);
                this.b.watch(this.f);
                const disposable = this.h.onWillDispose(() => {
                    this.N();
                    this.b.unwatch();
                    this.h = null;
                    (0, lifecycle_1.$fc)(disposable);
                });
            }
            return this.h;
        }
        G(mode, till, immediate) {
            if (mode === output_1.OutputChannelUpdateMode.Clear || mode === output_1.OutputChannelUpdateMode.Replace) {
                this.s = this.t = (0, types_1.$nf)(till) ? till : this.t;
                this.N();
            }
            if (!this.h) {
                return;
            }
            this.j = true;
            if (!this.m.value) {
                this.m.value = new cancellation_1.$pd();
            }
            const token = this.m.value.token;
            if (mode === output_1.OutputChannelUpdateMode.Clear) {
                this.H(this.h);
            }
            else if (mode === output_1.OutputChannelUpdateMode.Replace) {
                this.r = this.J(this.h, token).finally(() => this.r = undefined);
            }
            else {
                this.I(this.h, immediate, token);
            }
        }
        H(model) {
            this.M(model, [editOperation_1.$ls.delete(model.getFullModelRange())], buffer_1.$Fd.fromString(''));
        }
        I(model, immediate, token) {
            this.n.trigger(async () => {
                /* Abort if operation is cancelled */
                if (token.isCancellationRequested) {
                    return;
                }
                /* Wait for replace to finish */
                if (this.r) {
                    try {
                        await this.r;
                    }
                    catch (e) { /* Ignore */ }
                    /* Abort if operation is cancelled */
                    if (token.isCancellationRequested) {
                        return;
                    }
                }
                /* Get content to append */
                const contentToAppend = await this.O();
                /* Abort if operation is cancelled */
                if (token.isCancellationRequested) {
                    return;
                }
                /* Appned Content */
                const lastLine = model.getLineCount();
                const lastLineMaxColumn = model.getLineMaxColumn(lastLine);
                const edits = [editOperation_1.$ls.insert(new position_1.$js(lastLine, lastLineMaxColumn), contentToAppend.toString())];
                this.M(model, edits, contentToAppend);
            }, immediate ? 0 : undefined).catch(error => {
                if (!(0, errors_1.$2)(error)) {
                    throw error;
                }
            });
        }
        async J(model, token) {
            /* Get content to replace */
            const contentToReplace = await this.O();
            /* Abort if operation is cancelled */
            if (token.isCancellationRequested) {
                return;
            }
            /* Compute Edits */
            const edits = await this.L(model, contentToReplace.toString());
            /* Abort if operation is cancelled */
            if (token.isCancellationRequested) {
                return;
            }
            /* Apply Edits */
            this.M(model, edits, contentToReplace);
        }
        async L(model, contentToReplace) {
            if (!contentToReplace) {
                return [editOperation_1.$ls.delete(model.getFullModelRange())];
            }
            if (contentToReplace !== model.getValue()) {
                const edits = await this.D.computeMoreMinimalEdits(model.uri, [{ text: contentToReplace.toString(), range: model.getFullModelRange() }]);
                if (edits?.length) {
                    return edits.map(edit => editOperation_1.$ls.replace(range_1.$ks.lift(edit.range), edit.text));
                }
            }
            return [];
        }
        M(model, edits, content) {
            if (edits.length) {
                model.applyEdits(edits);
            }
            this.t = this.t + content.byteLength;
            this.j = false;
        }
        N() {
            this.m.value?.cancel();
            this.m.value = undefined;
            this.n.cancel();
            this.r = undefined;
            this.j = false;
        }
        async O() {
            const content = await this.z.readFile(this.y, { position: this.t });
            this.f = content.etag;
            return content.value;
        }
        P(size) {
            if (this.h) {
                if (!this.j) {
                    if ((0, types_1.$nf)(size) && this.t > size) {
                        // Reset - Content is removed
                        this.update(output_1.OutputChannelUpdateMode.Clear, 0, true);
                    }
                }
                this.update(output_1.OutputChannelUpdateMode.Append, undefined, false /* Not needed to update immediately. Wait to collect more changes and update. */);
            }
        }
        Q() {
            return !!this.h;
        }
        dispose() {
            this.a.fire();
            super.dispose();
        }
    };
    exports.$dVb = $dVb;
    exports.$dVb = $dVb = __decorate([
        __param(3, files_1.$6j),
        __param(4, model_1.$yA),
        __param(5, log_1.$5i),
        __param(6, editorWorker_1.$4Y)
    ], $dVb);
    let OutputChannelBackedByFile = class OutputChannelBackedByFile extends $dVb {
        constructor(id, modelUri, language, file, fileService, modelService, loggerService, logService, editorWorkerService) {
            super(modelUri, language, file, fileService, modelService, logService, editorWorkerService);
            // Donot rotate to check for the file reset
            this.R = loggerService.createLogger(file, { logLevel: 'always', donotRotate: true, donotUseFormatters: true, hidden: true });
            this.S = 0;
        }
        append(message) {
            this.U(message);
            this.update(output_1.OutputChannelUpdateMode.Append, undefined, this.Q());
        }
        replace(message) {
            const till = this.S;
            this.U(message);
            this.update(output_1.OutputChannelUpdateMode.Replace, till, true);
        }
        U(content) {
            this.S += buffer_1.$Fd.fromString(content).byteLength;
            this.R.info(content);
            if (this.Q()) {
                this.R.flush();
            }
        }
    };
    OutputChannelBackedByFile = __decorate([
        __param(4, files_1.$6j),
        __param(5, model_1.$yA),
        __param(6, log_1.$6i),
        __param(7, log_1.$5i),
        __param(8, editorWorker_1.$4Y)
    ], OutputChannelBackedByFile);
    let $eVb = class $eVb extends lifecycle_1.$kc {
        constructor(id, modelUri, language, outputDir, f, g) {
            super();
            this.f = f;
            this.g = g;
            this.a = this.B(new event_1.$fd());
            this.onDispose = this.a.event;
            this.b = this.h(id, modelUri, language, outputDir);
        }
        async h(id, modelUri, language, outputDirPromise) {
            const outputDir = await outputDirPromise;
            const file = resources.$ig(outputDir, `${id.replace(/[\\/:\*\?"<>\|]/g, '')}.log`);
            await this.g.createFile(file);
            const outputChannelModel = this.B(this.f.createInstance(OutputChannelBackedByFile, id, modelUri, language, file));
            this.B(outputChannelModel.onDispose(() => this.a.fire()));
            return outputChannelModel;
        }
        append(output) {
            this.b.then(outputChannelModel => outputChannelModel.append(output));
        }
        update(mode, till, immediate) {
            this.b.then(outputChannelModel => outputChannelModel.update(mode, till, immediate));
        }
        loadModel() {
            return this.b.then(outputChannelModel => outputChannelModel.loadModel());
        }
        clear() {
            this.b.then(outputChannelModel => outputChannelModel.clear());
        }
        replace(value) {
            this.b.then(outputChannelModel => outputChannelModel.replace(value));
        }
    };
    exports.$eVb = $eVb;
    exports.$eVb = $eVb = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, files_1.$6j)
    ], $eVb);
});
//# sourceMappingURL=outputChannelModel.js.map