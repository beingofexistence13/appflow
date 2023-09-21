define(["require", "exports", "vs/platform/theme/common/colorRegistry", "vs/base/common/color"], function (require, exports, colorRegistry_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$E2 = exports.$D2 = exports.$C2 = exports.$B2 = exports.$A2 = exports.$z2 = exports.$y2 = exports.$x2 = exports.$w2 = exports.$v2 = exports.$u2 = exports.$t2 = exports.$s2 = exports.$r2 = exports.$q2 = exports.$p2 = exports.$o2 = exports.$n2 = exports.$m2 = exports.$l2 = exports.$k2 = exports.$j2 = exports.$i2 = exports.$h2 = exports.$g2 = void 0;
    function overrideStyles(override, styles) {
        const result = { ...styles };
        for (const key in override) {
            const val = override[key];
            result[key] = val !== undefined ? (0, colorRegistry_1.$pv)(val) : undefined;
        }
        return result;
    }
    exports.$g2 = {
        keybindingLabelBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Jw),
        keybindingLabelForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Kw),
        keybindingLabelBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Lw),
        keybindingLabelBottomBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Mw),
        keybindingLabelShadow: (0, colorRegistry_1.$pv)(colorRegistry_1.$Kv)
    };
    function $h2(override) {
        return overrideStyles(override, exports.$g2);
    }
    exports.$h2 = $h2;
    exports.$i2 = {
        buttonForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$8v),
        buttonSeparator: (0, colorRegistry_1.$pv)(colorRegistry_1.$9v),
        buttonBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$0v),
        buttonHoverBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$$v),
        buttonSecondaryForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$aw),
        buttonSecondaryBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$bw),
        buttonSecondaryHoverBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$cw),
        buttonBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$_v),
    };
    function $j2(override) {
        return overrideStyles(override, exports.$i2);
    }
    exports.$j2 = $j2;
    exports.$k2 = {
        progressBarBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$jw)
    };
    function $l2(override) {
        return overrideStyles(override, exports.$k2);
    }
    exports.$l2 = $l2;
    exports.$m2 = {
        inputActiveOptionBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Pv),
        inputActiveOptionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Sv),
        inputActiveOptionBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Rv)
    };
    function $n2(override) {
        return overrideStyles(override, exports.$m2);
    }
    exports.$n2 = $n2;
    exports.$o2 = {
        checkboxBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Zx),
        checkboxBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$3x),
        checkboxForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$2x)
    };
    function $p2(override) {
        return overrideStyles(override, exports.$o2);
    }
    exports.$p2 = $p2;
    exports.$q2 = {
        dialogBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Aw),
        dialogForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Bw),
        dialogShadow: (0, colorRegistry_1.$pv)(colorRegistry_1.$Kv),
        dialogBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Av),
        errorIconForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$My),
        warningIconForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ny),
        infoIconForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Oy),
        textLinkForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ev)
    };
    function $r2(override) {
        return overrideStyles(override, exports.$q2);
    }
    exports.$r2 = $r2;
    exports.$s2 = {
        inputBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Mv),
        inputForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Nv),
        inputBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ov),
        inputValidationInfoBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Wv),
        inputValidationInfoBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Uv),
        inputValidationInfoForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Vv),
        inputValidationWarningBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Zv),
        inputValidationWarningBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Xv),
        inputValidationWarningForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Yv),
        inputValidationErrorBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$3v),
        inputValidationErrorBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$1v),
        inputValidationErrorForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$2v)
    };
    function $t2(override) {
        return overrideStyles(override, exports.$s2);
    }
    exports.$t2 = $t2;
    exports.$u2 = {
        listFilterWidgetBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ox),
        listFilterWidgetOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$Px),
        listFilterWidgetNoMatchesOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$Qx),
        listFilterWidgetShadow: (0, colorRegistry_1.$pv)(colorRegistry_1.$Rx),
        inputBoxStyles: exports.$s2,
        toggleStyles: exports.$m2
    };
    exports.$v2 = {
        badgeBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$dw),
        badgeForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$ew),
        badgeBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Av)
    };
    function $w2(override) {
        return overrideStyles(override, exports.$v2);
    }
    exports.$w2 = $w2;
    exports.$x2 = {
        breadcrumbsBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$ly),
        breadcrumbsForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$ky),
        breadcrumbsHoverForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$my),
        breadcrumbsFocusForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$my),
        breadcrumbsFocusAndSelectionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$ny)
    };
    function $y2(override) {
        return overrideStyles(override, exports.$x2);
    }
    exports.$y2 = $y2;
    exports.$z2 = {
        listBackground: undefined,
        listInactiveFocusForeground: undefined,
        listFocusBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$ux),
        listFocusForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$vx),
        listFocusOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$wx),
        listActiveSelectionBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$yx),
        listActiveSelectionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$zx),
        listActiveSelectionIconForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ax),
        listFocusAndSelectionOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$xx),
        listFocusAndSelectionBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$yx),
        listFocusAndSelectionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$zx),
        listInactiveSelectionBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Bx),
        listInactiveSelectionIconForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Dx),
        listInactiveSelectionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Cx),
        listInactiveFocusBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ex),
        listInactiveFocusOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$Fx),
        listHoverBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Gx),
        listHoverForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Hx),
        listDropBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ix),
        listSelectionOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$Bv),
        listHoverOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$Bv),
        treeIndentGuidesStroke: (0, colorRegistry_1.$pv)(colorRegistry_1.$Ux),
        treeInactiveIndentGuidesStroke: (0, colorRegistry_1.$pv)(colorRegistry_1.$Vx),
        tableColumnsBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Wx),
        tableOddRowsBackgroundColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$Xx),
    };
    function $A2(override) {
        return overrideStyles(override, exports.$z2);
    }
    exports.$A2 = $A2;
    exports.$B2 = {
        selectBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$4v),
        selectListBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$5v),
        selectForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$6v),
        decoratorRightForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Hw),
        selectBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$7v),
        focusBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$zv),
        listFocusBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$8x),
        listInactiveSelectionIconForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$7x),
        listFocusForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$6x),
        listFocusOutline: (0, colorRegistry_1.$qv)(colorRegistry_1.$Bv, color_1.$Os.transparent.toString()),
        listHoverBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Gx),
        listHoverForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Hx),
        listHoverOutline: (0, colorRegistry_1.$pv)(colorRegistry_1.$Bv),
        selectListBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Cw),
        listBackground: undefined,
        listActiveSelectionBackground: undefined,
        listActiveSelectionForeground: undefined,
        listActiveSelectionIconForeground: undefined,
        listFocusAndSelectionBackground: undefined,
        listDropBackground: undefined,
        listInactiveSelectionBackground: undefined,
        listInactiveSelectionForeground: undefined,
        listInactiveFocusBackground: undefined,
        listInactiveFocusOutline: undefined,
        listSelectionOutline: undefined,
        listFocusAndSelectionForeground: undefined,
        listFocusAndSelectionOutline: undefined,
        listInactiveFocusForeground: undefined,
        tableColumnsBorder: undefined,
        tableOddRowsBackgroundColor: undefined,
        treeIndentGuidesStroke: undefined,
        treeInactiveIndentGuidesStroke: undefined,
    };
    function $C2(override) {
        return overrideStyles(override, exports.$B2);
    }
    exports.$C2 = $C2;
    exports.$D2 = {
        shadowColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$Kv),
        borderColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$9x),
        foregroundColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$0x),
        backgroundColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$$x),
        selectionForegroundColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$_x),
        selectionBackgroundColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$ay),
        selectionBorderColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$by),
        separatorColor: (0, colorRegistry_1.$pv)(colorRegistry_1.$cy),
        scrollbarShadow: (0, colorRegistry_1.$pv)(colorRegistry_1.$fw),
        scrollbarSliderBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$gw),
        scrollbarSliderHoverBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$hw),
        scrollbarSliderActiveBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$iw)
    };
    function $E2(override) {
        return overrideStyles(override, exports.$D2);
    }
    exports.$E2 = $E2;
});
//# sourceMappingURL=defaultStyles.js.map