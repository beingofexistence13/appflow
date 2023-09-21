/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/browser/editorExtensions", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/editor/common/core/position", "vs/editor/common/services/model", "vs/editor/common/services/resolverService", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/base/common/types", "vs/platform/log/common/log", "vs/base/browser/dom"], function (require, exports, nls, uri_1, codeEditorService_1, position_1, model_1, resolverService_1, actions_1, commands_1, contextkey_1, instantiation_1, keybindingsRegistry_1, platform_1, telemetry_1, types_1, log_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EV = exports.$DV = exports.$CV = exports.EditorExtensionsRegistry = exports.$BV = exports.$AV = exports.$zV = exports.$yV = exports.$xV = exports.$wV = exports.$vV = exports.$uV = exports.$tV = exports.$sV = exports.$rV = exports.$qV = exports.$pV = exports.$oV = exports.EditorContributionInstantiation = void 0;
    var EditorContributionInstantiation;
    (function (EditorContributionInstantiation) {
        /**
         * The contribution is created eagerly when the {@linkcode ICodeEditor} is instantiated.
         * Only Eager contributions can participate in saving or restoring of view state.
         */
        EditorContributionInstantiation[EditorContributionInstantiation["Eager"] = 0] = "Eager";
        /**
         * The contribution is created at the latest 50ms after the first render after attaching a text model.
         * If the contribution is explicitly requested via `getContribution`, it will be instantiated sooner.
         * If there is idle time available, it will be instantiated sooner.
         */
        EditorContributionInstantiation[EditorContributionInstantiation["AfterFirstRender"] = 1] = "AfterFirstRender";
        /**
         * The contribution is created before the editor emits events produced by user interaction (mouse events, keyboard events).
         * If the contribution is explicitly requested via `getContribution`, it will be instantiated sooner.
         * If there is idle time available, it will be instantiated sooner.
         */
        EditorContributionInstantiation[EditorContributionInstantiation["BeforeFirstInteraction"] = 2] = "BeforeFirstInteraction";
        /**
         * The contribution is created when there is idle time available, at the latest 5000ms after the editor creation.
         * If the contribution is explicitly requested via `getContribution`, it will be instantiated sooner.
         */
        EditorContributionInstantiation[EditorContributionInstantiation["Eventually"] = 3] = "Eventually";
        /**
         * The contribution is created only when explicitly requested via `getContribution`.
         */
        EditorContributionInstantiation[EditorContributionInstantiation["Lazy"] = 4] = "Lazy";
    })(EditorContributionInstantiation || (exports.EditorContributionInstantiation = EditorContributionInstantiation = {}));
    class $oV {
        constructor(opts) {
            this.id = opts.id;
            this.precondition = opts.precondition;
            this.f = opts.kbOpts;
            this.g = opts.menuOpts;
            this.k = opts.description;
        }
        register() {
            if (Array.isArray(this.g)) {
                this.g.forEach(this.o, this);
            }
            else if (this.g) {
                this.o(this.g);
            }
            if (this.f) {
                const kbOptsArr = Array.isArray(this.f) ? this.f : [this.f];
                for (const kbOpts of kbOptsArr) {
                    let kbWhen = kbOpts.kbExpr;
                    if (this.precondition) {
                        if (kbWhen) {
                            kbWhen = contextkey_1.$Ii.and(kbWhen, this.precondition);
                        }
                        else {
                            kbWhen = this.precondition;
                        }
                    }
                    const desc = {
                        id: this.id,
                        weight: kbOpts.weight,
                        args: kbOpts.args,
                        when: kbWhen,
                        primary: kbOpts.primary,
                        secondary: kbOpts.secondary,
                        win: kbOpts.win,
                        linux: kbOpts.linux,
                        mac: kbOpts.mac,
                    };
                    keybindingsRegistry_1.$Nu.registerKeybindingRule(desc);
                }
            }
            commands_1.$Gr.registerCommand({
                id: this.id,
                handler: (accessor, args) => this.runCommand(accessor, args),
                description: this.k
            });
        }
        o(item) {
            actions_1.$Tu.appendMenuItem(item.menuId, {
                group: item.group,
                command: {
                    id: this.id,
                    title: item.title,
                    icon: item.icon,
                    precondition: this.precondition
                },
                when: item.when,
                order: item.order
            });
        }
    }
    exports.$oV = $oV;
    class $pV extends $oV {
        constructor() {
            super(...arguments);
            this.d = [];
        }
        /**
         * A higher priority gets to be looked at first
         */
        addImplementation(priority, name, implementation, when) {
            this.d.push({ priority, name, implementation, when });
            this.d.sort((a, b) => b.priority - a.priority);
            return {
                dispose: () => {
                    for (let i = 0; i < this.d.length; i++) {
                        if (this.d[i].implementation === implementation) {
                            this.d.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        runCommand(accessor, args) {
            const logService = accessor.get(log_1.$5i);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            logService.trace(`Executing Command '${this.id}' which has ${this.d.length} bound.`);
            for (const impl of this.d) {
                if (impl.when) {
                    const context = contextKeyService.getContext((0, dom_1.$VO)());
                    const value = impl.when.evaluate(context);
                    if (!value) {
                        continue;
                    }
                }
                const result = impl.implementation(accessor, args);
                if (result) {
                    logService.trace(`Command '${this.id}' was handled by '${impl.name}'.`);
                    if (typeof result === 'boolean') {
                        return;
                    }
                    return result;
                }
            }
            logService.trace(`The Command '${this.id}' was not handled by any implementation.`);
        }
    }
    exports.$pV = $pV;
    //#endregion
    /**
     * A command that delegates to another command's implementation.
     *
     * This lets different commands be registered but share the same implementation
     */
    class $qV extends $oV {
        constructor(d, opts) {
            super(opts);
            this.d = d;
        }
        runCommand(accessor, args) {
            return this.d.runCommand(accessor, args);
        }
    }
    exports.$qV = $qV;
    class $rV extends $oV {
        /**
         * Create a command class that is bound to a certain editor contribution.
         */
        static bindToContribution(controllerGetter) {
            return class EditorControllerCommandImpl extends $rV {
                constructor(opts) {
                    super(opts);
                    this.d = opts.handler;
                }
                runEditorCommand(accessor, editor, args) {
                    const controller = controllerGetter(editor);
                    if (controller) {
                        this.d(controller, args);
                    }
                }
            };
        }
        static runEditorCommand(accessor, args, precondition, runner) {
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            // Find the editor with text focus or active
            const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
            if (!editor) {
                // well, at least we tried...
                return;
            }
            return editor.invokeWithinContext((editorAccessor) => {
                const kbService = editorAccessor.get(contextkey_1.$3i);
                if (!kbService.contextMatchesRules(precondition ?? undefined)) {
                    // precondition does not hold
                    return;
                }
                return runner(editorAccessor, editor, args);
            });
        }
        runCommand(accessor, args) {
            return $rV.runEditorCommand(accessor, args, this.precondition, (accessor, editor, args) => this.runEditorCommand(accessor, editor, args));
        }
    }
    exports.$rV = $rV;
    class $sV extends $rV {
        static p(opts) {
            let menuOpts;
            if (Array.isArray(opts.menuOpts)) {
                menuOpts = opts.menuOpts;
            }
            else if (opts.menuOpts) {
                menuOpts = [opts.menuOpts];
            }
            else {
                menuOpts = [];
            }
            function withDefaults(item) {
                if (!item.menuId) {
                    item.menuId = actions_1.$Ru.EditorContext;
                }
                if (!item.title) {
                    item.title = opts.label;
                }
                item.when = contextkey_1.$Ii.and(opts.precondition, item.when);
                return item;
            }
            if (Array.isArray(opts.contextMenuOpts)) {
                menuOpts.push(...opts.contextMenuOpts.map(withDefaults));
            }
            else if (opts.contextMenuOpts) {
                menuOpts.push(withDefaults(opts.contextMenuOpts));
            }
            opts.menuOpts = menuOpts;
            return opts;
        }
        constructor(opts) {
            super($sV.p(opts));
            this.label = opts.label;
            this.alias = opts.alias;
        }
        runEditorCommand(accessor, editor, args) {
            this.q(accessor, editor);
            return this.run(accessor, editor, args || {});
        }
        q(accessor, editor) {
            accessor.get(telemetry_1.$9k).publicLog2('editorActionInvoked', { name: this.label, id: this.id });
        }
    }
    exports.$sV = $sV;
    class $tV extends $sV {
        constructor() {
            super(...arguments);
            this.d = [];
        }
        /**
         * A higher priority gets to be looked at first
         */
        addImplementation(priority, implementation) {
            this.d.push([priority, implementation]);
            this.d.sort((a, b) => b[0] - a[0]);
            return {
                dispose: () => {
                    for (let i = 0; i < this.d.length; i++) {
                        if (this.d[i][1] === implementation) {
                            this.d.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        run(accessor, editor, args) {
            for (const impl of this.d) {
                const result = impl[1](accessor, editor, args);
                if (result) {
                    if (typeof result === 'boolean') {
                        return;
                    }
                    return result;
                }
            }
        }
    }
    exports.$tV = $tV;
    //#endregion EditorAction
    //#region EditorAction2
    class $uV extends actions_1.$Wu {
        run(accessor, ...args) {
            // Find the editor with text focus or active
            const codeEditorService = accessor.get(codeEditorService_1.$nV);
            const editor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
            if (!editor) {
                // well, at least we tried...
                return;
            }
            // precondition does hold
            return editor.invokeWithinContext((editorAccessor) => {
                const kbService = editorAccessor.get(contextkey_1.$3i);
                const logService = editorAccessor.get(log_1.$5i);
                const enabled = kbService.contextMatchesRules(this.desc.precondition ?? undefined);
                if (!enabled) {
                    logService.debug(`[EditorAction2] NOT running command because its precondition is FALSE`, this.desc.id, this.desc.precondition?.serialize());
                    return;
                }
                return this.runEditorCommand(editorAccessor, editor, ...args);
            });
        }
    }
    exports.$uV = $uV;
    //#endregion
    // --- Registration of commands and actions
    function $vV(id, handler) {
        commands_1.$Gr.registerCommand(id, function (accessor, ...args) {
            const instaService = accessor.get(instantiation_1.$Ah);
            const [resource, position] = args;
            (0, types_1.$tf)(uri_1.URI.isUri(resource));
            (0, types_1.$tf)(position_1.$js.isIPosition(position));
            const model = accessor.get(model_1.$yA).getModel(resource);
            if (model) {
                const editorPosition = position_1.$js.lift(position);
                return instaService.invokeFunction(handler, model, editorPosition, ...args.slice(2));
            }
            return accessor.get(resolverService_1.$uA).createModelReference(resource).then(reference => {
                return new Promise((resolve, reject) => {
                    try {
                        const result = instaService.invokeFunction(handler, reference.object.textEditorModel, position_1.$js.lift(position), args.slice(2));
                        resolve(result);
                    }
                    catch (err) {
                        reject(err);
                    }
                }).finally(() => {
                    reference.dispose();
                });
            });
        });
    }
    exports.$vV = $vV;
    function $wV(editorCommand) {
        EditorContributionRegistry.INSTANCE.registerEditorCommand(editorCommand);
        return editorCommand;
    }
    exports.$wV = $wV;
    function $xV(ctor) {
        const action = new ctor();
        EditorContributionRegistry.INSTANCE.registerEditorAction(action);
        return action;
    }
    exports.$xV = $xV;
    function $yV(action) {
        EditorContributionRegistry.INSTANCE.registerEditorAction(action);
        return action;
    }
    exports.$yV = $yV;
    function $zV(editorAction) {
        EditorContributionRegistry.INSTANCE.registerEditorAction(editorAction);
    }
    exports.$zV = $zV;
    /**
     * Registers an editor contribution. Editor contributions have a lifecycle which is bound
     * to a specific code editor instance.
     */
    function $AV(id, ctor, instantiation) {
        EditorContributionRegistry.INSTANCE.registerEditorContribution(id, ctor, instantiation);
    }
    exports.$AV = $AV;
    /**
     * Registers a diff editor contribution. Diff editor contributions have a lifecycle which
     * is bound to a specific diff editor instance.
     */
    function $BV(id, ctor) {
        EditorContributionRegistry.INSTANCE.registerDiffEditorContribution(id, ctor);
    }
    exports.$BV = $BV;
    var EditorExtensionsRegistry;
    (function (EditorExtensionsRegistry) {
        function getEditorCommand(commandId) {
            return EditorContributionRegistry.INSTANCE.getEditorCommand(commandId);
        }
        EditorExtensionsRegistry.getEditorCommand = getEditorCommand;
        function getEditorActions() {
            return EditorContributionRegistry.INSTANCE.getEditorActions();
        }
        EditorExtensionsRegistry.getEditorActions = getEditorActions;
        function getEditorContributions() {
            return EditorContributionRegistry.INSTANCE.getEditorContributions();
        }
        EditorExtensionsRegistry.getEditorContributions = getEditorContributions;
        function getSomeEditorContributions(ids) {
            return EditorContributionRegistry.INSTANCE.getEditorContributions().filter(c => ids.indexOf(c.id) >= 0);
        }
        EditorExtensionsRegistry.getSomeEditorContributions = getSomeEditorContributions;
        function getDiffEditorContributions() {
            return EditorContributionRegistry.INSTANCE.getDiffEditorContributions();
        }
        EditorExtensionsRegistry.getDiffEditorContributions = getDiffEditorContributions;
    })(EditorExtensionsRegistry || (exports.EditorExtensionsRegistry = EditorExtensionsRegistry = {}));
    // Editor extension points
    const Extensions = {
        EditorCommonContributions: 'editor.contributions'
    };
    class EditorContributionRegistry {
        static { this.INSTANCE = new EditorContributionRegistry(); }
        constructor() {
            this.d = [];
            this.e = [];
            this.f = [];
            this.g = Object.create(null);
        }
        registerEditorContribution(id, ctor, instantiation) {
            this.d.push({ id, ctor: ctor, instantiation });
        }
        getEditorContributions() {
            return this.d.slice(0);
        }
        registerDiffEditorContribution(id, ctor) {
            this.e.push({ id, ctor: ctor });
        }
        getDiffEditorContributions() {
            return this.e.slice(0);
        }
        registerEditorAction(action) {
            action.register();
            this.f.push(action);
        }
        getEditorActions() {
            return this.f;
        }
        registerEditorCommand(editorCommand) {
            editorCommand.register();
            this.g[editorCommand.id] = editorCommand;
        }
        getEditorCommand(commandId) {
            return (this.g[commandId] || null);
        }
    }
    platform_1.$8m.add(Extensions.EditorCommonContributions, EditorContributionRegistry.INSTANCE);
    function registerCommand(command) {
        command.register();
        return command;
    }
    exports.$CV = registerCommand(new $pV({
        id: 'undo',
        precondition: undefined,
        kbOpts: {
            weight: 0 /* KeybindingWeight.EditorCore */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */
        },
        menuOpts: [{
                menuId: actions_1.$Ru.MenubarEditMenu,
                group: '1_do',
                title: nls.localize(0, null),
                order: 1
            }, {
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: nls.localize(1, null),
                order: 1
            }]
    }));
    registerCommand(new $qV(exports.$CV, { id: 'default:undo', precondition: undefined }));
    exports.$DV = registerCommand(new $pV({
        id: 'redo',
        precondition: undefined,
        kbOpts: {
            weight: 0 /* KeybindingWeight.EditorCore */,
            primary: 2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */,
            secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */],
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 56 /* KeyCode.KeyZ */ }
        },
        menuOpts: [{
                menuId: actions_1.$Ru.MenubarEditMenu,
                group: '1_do',
                title: nls.localize(2, null),
                order: 2
            }, {
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: nls.localize(3, null),
                order: 1
            }]
    }));
    registerCommand(new $qV(exports.$DV, { id: 'default:redo', precondition: undefined }));
    exports.$EV = registerCommand(new $pV({
        id: 'editor.action.selectAll',
        precondition: undefined,
        kbOpts: {
            weight: 0 /* KeybindingWeight.EditorCore */,
            kbExpr: null,
            primary: 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */
        },
        menuOpts: [{
                menuId: actions_1.$Ru.MenubarSelectionMenu,
                group: '1_basic',
                title: nls.localize(4, null),
                order: 1
            }, {
                menuId: actions_1.$Ru.CommandPalette,
                group: '',
                title: nls.localize(5, null),
                order: 1
            }]
    }));
});
//# sourceMappingURL=editorExtensions.js.map