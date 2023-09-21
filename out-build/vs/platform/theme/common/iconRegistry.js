/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/platform/theme/common/iconRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform"], function (require, exports, async_1, codicons_1, themables_1, event_1, types_1, uri_1, nls_1, jsonContributionRegistry_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dv = exports.$cv = exports.$bv = exports.$av = exports.$_u = exports.$$u = exports.$0u = exports.$9u = exports.IconFontDefinition = exports.IconContribution = exports.$8u = void 0;
    //  ------ API types
    // icon registry
    exports.$8u = {
        IconContribution: 'base.contributions.icons'
    };
    var IconContribution;
    (function (IconContribution) {
        function getDefinition(contribution, registry) {
            let definition = contribution.defaults;
            while (themables_1.ThemeIcon.isThemeIcon(definition)) {
                const c = iconRegistry.getIcon(definition.id);
                if (!c) {
                    return undefined;
                }
                definition = c.defaults;
            }
            return definition;
        }
        IconContribution.getDefinition = getDefinition;
    })(IconContribution || (exports.IconContribution = IconContribution = {}));
    var IconFontDefinition;
    (function (IconFontDefinition) {
        function toJSONObject(iconFont) {
            return {
                weight: iconFont.weight,
                style: iconFont.style,
                src: iconFont.src.map(s => ({ format: s.format, location: s.location.toString() }))
            };
        }
        IconFontDefinition.toJSONObject = toJSONObject;
        function fromJSONObject(json) {
            const stringOrUndef = (s) => (0, types_1.$jf)(s) ? s : undefined;
            if (json && Array.isArray(json.src) && json.src.every((s) => (0, types_1.$jf)(s.format) && (0, types_1.$jf)(s.location))) {
                return {
                    weight: stringOrUndef(json.weight),
                    style: stringOrUndef(json.style),
                    src: json.src.map((s) => ({ format: s.format, location: uri_1.URI.parse(s.location) }))
                };
            }
            return undefined;
        }
        IconFontDefinition.fromJSONObject = fromJSONObject;
    })(IconFontDefinition || (exports.IconFontDefinition = IconFontDefinition = {}));
    class IconRegistry {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidChange = this.a.event;
            this.d = {
                definitions: {
                    icons: {
                        type: 'object',
                        properties: {
                            fontId: { type: 'string', description: (0, nls_1.localize)(0, null) },
                            fontCharacter: { type: 'string', description: (0, nls_1.localize)(1, null) }
                        },
                        additionalProperties: false,
                        defaultSnippets: [{ body: { fontCharacter: '\\\\e030' } }]
                    }
                },
                type: 'object',
                properties: {}
            };
            this.e = { type: 'string', pattern: `^${themables_1.ThemeIcon.iconNameExpression}$`, enum: [], enumDescriptions: [] };
            this.b = {};
            this.f = {};
        }
        registerIcon(id, defaults, description, deprecationMessage) {
            const existing = this.b[id];
            if (existing) {
                if (description && !existing.description) {
                    existing.description = description;
                    this.d.properties[id].markdownDescription = `${description} $(${id})`;
                    const enumIndex = this.e.enum.indexOf(id);
                    if (enumIndex !== -1) {
                        this.e.enumDescriptions[enumIndex] = description;
                    }
                    this.a.fire();
                }
                return existing;
            }
            const iconContribution = { id, description, defaults, deprecationMessage };
            this.b[id] = iconContribution;
            const propertySchema = { $ref: '#/definitions/icons' };
            if (deprecationMessage) {
                propertySchema.deprecationMessage = deprecationMessage;
            }
            if (description) {
                propertySchema.markdownDescription = `${description}: $(${id})`;
            }
            this.d.properties[id] = propertySchema;
            this.e.enum.push(id);
            this.e.enumDescriptions.push(description || '');
            this.a.fire();
            return { id };
        }
        deregisterIcon(id) {
            delete this.b[id];
            delete this.d.properties[id];
            const index = this.e.enum.indexOf(id);
            if (index !== -1) {
                this.e.enum.splice(index, 1);
                this.e.enumDescriptions.splice(index, 1);
            }
            this.a.fire();
        }
        getIcons() {
            return Object.keys(this.b).map(id => this.b[id]);
        }
        getIcon(id) {
            return this.b[id];
        }
        getIconSchema() {
            return this.d;
        }
        getIconReferenceSchema() {
            return this.e;
        }
        registerIconFont(id, definition) {
            const existing = this.f[id];
            if (existing) {
                return existing;
            }
            this.f[id] = definition;
            this.a.fire();
            return definition;
        }
        deregisterIconFont(id) {
            delete this.f[id];
        }
        getIconFont(id) {
            return this.f[id];
        }
        toString() {
            const sorter = (i1, i2) => {
                return i1.id.localeCompare(i2.id);
            };
            const classNames = (i) => {
                while (themables_1.ThemeIcon.isThemeIcon(i.defaults)) {
                    i = this.b[i.defaults.id];
                }
                return `codicon codicon-${i ? i.id : ''}`;
            };
            const reference = [];
            reference.push(`| preview     | identifier                        | default codicon ID                | description`);
            reference.push(`| ----------- | --------------------------------- | --------------------------------- | --------------------------------- |`);
            const contributions = Object.keys(this.b).map(key => this.b[key]);
            for (const i of contributions.filter(i => !!i.description).sort(sorter)) {
                reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|${themables_1.ThemeIcon.isThemeIcon(i.defaults) ? i.defaults.id : i.id}|${i.description || ''}|`);
            }
            reference.push(`| preview     | identifier                        `);
            reference.push(`| ----------- | --------------------------------- |`);
            for (const i of contributions.filter(i => !themables_1.ThemeIcon.isThemeIcon(i.defaults)).sort(sorter)) {
                reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|`);
            }
            return reference.join('\n');
        }
    }
    const iconRegistry = new IconRegistry();
    platform.$8m.add(exports.$8u.IconContribution, iconRegistry);
    function $9u(id, defaults, description, deprecationMessage) {
        return iconRegistry.registerIcon(id, defaults, description, deprecationMessage);
    }
    exports.$9u = $9u;
    function $0u() {
        return iconRegistry;
    }
    exports.$0u = $0u;
    function initialize() {
        const codiconFontCharacters = (0, codicons_1.$Nj)();
        for (const icon in codiconFontCharacters) {
            const fontCharacter = '\\' + codiconFontCharacters[icon].toString(16);
            iconRegistry.registerIcon(icon, { fontCharacter });
        }
    }
    initialize();
    exports.$$u = 'vscode://schemas/icons';
    const schemaRegistry = platform.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
    schemaRegistry.registerSchema(exports.$$u, iconRegistry.getIconSchema());
    const delayer = new async_1.$Sg(() => schemaRegistry.notifySchemaChanged(exports.$$u), 200);
    iconRegistry.onDidChange(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
    //setTimeout(_ => console.log(iconRegistry.toString()), 5000);
    // common icons
    exports.$_u = $9u('widget-close', codicons_1.$Pj.close, (0, nls_1.localize)(2, null));
    exports.$av = $9u('goto-previous-location', codicons_1.$Pj.arrowUp, (0, nls_1.localize)(3, null));
    exports.$bv = $9u('goto-next-location', codicons_1.$Pj.arrowDown, (0, nls_1.localize)(4, null));
    exports.$cv = themables_1.ThemeIcon.modify(codicons_1.$Pj.sync, 'spin');
    exports.$dv = themables_1.ThemeIcon.modify(codicons_1.$Pj.loading, 'spin');
});
//# sourceMappingURL=iconRegistry.js.map