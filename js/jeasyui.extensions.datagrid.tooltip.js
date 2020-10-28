/**
* jQuery EasyUI 1.4.3
* Copyright (c) 2009-2015 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
* To use it on other terms please contact us at info@jeasyui.com
* http://www.jeasyui.com/license_commercial.php
*
* jQuery EasyUI datagrid 组件扩展
* jeasyui.extensions.datagrid.tooltip.js
* 开发 流云
* 由 落阳 整理
* 最近更新：2015-12-16
*
* 依赖项：
*   1、jquery.jdirk.js
*   2、jeasyui.extensions.datagrid.getDom.js
*   3、jeasyui.extensions.datagrid.getColumnInfo.js
*   4、jeasyui.extensions.datagrid.getRowData.js
*
* Copyright (c) 2015 ChenJianwei personal All rights reserved.
*/
(function () {

    $.util.namespace("$.fn.datagrid.extensions");

    var _originalMethod = {};

    $.extend(_originalMethod, {

        beginEdit: $.fn.datagrid.methods.beginEdit
    });

    function getTrIndex(tr) {
        if (!tr) {
            return -1;
        }
        tr = $.util.isJqueryObject(tr) ? tr : $(tr);
        var attr = tr.attr("datagrid-row-index");
        return (attr == null || attr == undefined || attr == "") ? -1 : window.parseInt(attr, 10);
    }



    function initializeExtensions(target) {
        var t = $(target),
            state = $.data(target, "datagrid"),
            opts = state.options;

        initRowMouseEvent(t, opts);
    }

    function initRowMouseEvent(t, opts) {
        var target = t[0];
        t.datagrid("getPanel").panel("body").delegate("tr.datagrid-row", {
            "mouseenter.datagrid-extensions": function (e) {
                var tr = $(this);
                if (tr.is(".datagrid-row-editing")) { return; }
                var index = getTrIndex(tr);
                if (index == -1) { return; }
                var row = t.datagrid("getRowData", index);
                showRowTooltip(target, index, t, opts, row, tr, e);
            },
            "mouseleave.datagrid-extensions": function () {
                var tr = $(this),
                    index = getTrIndex(tr);
                if (index == -1) { return; }
                hideRowTooltip(target, index, tr);
            }
        });
    }

    function showRowTooltip(target, index, t, opts, row, tr, e) {
        t = t || $(target);
        opts = opts || $.data(target, "datagrid").options;
        row = row || t.datagrid("getRowData", index);
        tr = tr || t.datagrid("getRowDom", index);
        if (opts.rowTooltip) {
            var content = $.isFunction(opts.rowTooltip) ? opts.rowTooltip.call(target, index, row) : getRowTooltipContent(target, index, row);
            tr.each(function () {
                if (!$.data(this, "tooltip")) {
                    $(this).tooltip({
                        content: content,
                        trackMouse: true,
                        showDelay: opts.tooltipDelay
                    }).tooltip("show");
                }
            });
        } else {
            tr.children("td[field]").each(function () {
                var td = $(this),
                    field = td.attr("field"),
                    copts = t.datagrid("getColumnOption", field);
                if (!copts || !copts.tooltip) { return; }
                if (!$.data(td[0], "tooltip")) {
                    var content = $.isFunction(copts.tooltip) ? copts.tooltip.call(target, row[field], index, row) : t.datagrid("getCellHtml", { field: field, index: index });
                    td.tooltip({
                        content: content,
                        trackMouse: true,
                        showDelay: opts.tooltipDelay
                    });
                }
                if (e && e.target) {
                    if (td[0] == e.target || $.contains(t[0], e.target)) {
                        td.tooltip("show");
                    }
                } else {
                    td.tooltip("show");
                }
            });
        }
    }

    function getRowTooltipContent(target, index, row) {
        var t = $(target), cols = t.datagrid("getColumnOptions", "all"),
            content = $("<table style='padding: 5px;'></table>");
        $.each(cols, function (i, copts) {
            if (!copts || !copts.field || !copts.title) { return; }
            var text = t.datagrid("getCellHtml", { field: copts.field, index: index });
            content.append("<tr style='height: 20px;'><td style='text-align: right; width: 150px;'>" + copts.title + ":</td><td style='width: 250px;'>" + text + "</td></tr>");
        });
        return content;
    }

    function hideRowTooltip(target, index, tr) {
        tr = tr || $(target).datagrid("getRowDom", index);
        tr.tooltip("destroy").children("td[field]").each(function () {
            $(this).tooltip("destroy");
        });
    }

    function beginEdit(target, index) {
        var t = $(target),
            ret = _originalMethod.beginEdit.call(t, t, index),
            editing = t.datagrid("isEditing", index);
        if (!editing) {
            return;
        }
        hideRowTooltip(target, index);
        return ret;
    }



    var _datagrid = $.fn.datagrid;
    $.fn.datagrid = function (options, param) {
        if (typeof options == "string") {
            return _datagrid.apply(this, arguments);
        }
        options = options || {};
        return this.each(function () {
            var jq = $(this),
                isInited = $.data(this, "datagrid") ? true : false,
                opts = isInited ? options : $.extend({},
                        $.fn.datagrid.parseOptions(this),
                        $.parser.parseOptions(this, [
                            {
                                tooltipDelay: "number"
                            },
                            {
                                rowTooltip: "boolean"
                            }
                        ]), options);
            _datagrid.call(jq, opts, param);
            if (!isInited) {
                initializeExtensions(this);
            }
        });
    };
    $.union($.fn.datagrid, _datagrid);


    var methods = {

        //  重写 easyui-datagrid 的原生方法 beginEdit ，以支持自定义属性 rowTooltip 和列属性 tooltip 的扩展功能；
        // 修改了底层源码
        // beginEdit: function (jq, index) { return jq.each(function () { beginEdit(this, index); }); }
    };

    var defaults = {

        //  扩展 easyui-datagrid 的自定义属性，该属性表示是否启用行数据的 tooltip 功能；
        //  该属性可以是一个 Boolean 类型值；也可以是一个签名为 function(rowIndex, rowData) 的回调函数；
        //  如果该参数是一个回调函数，则表示启用行数据的 tooltip 功能，并且该函数的返回值为 tooltip 的 content 值。
        //  默认为 Boolean 类型，值为 false。
        //  注意：当启用该配置属性后，所有列的 tooltip 属性就会自动失效。
        rowTooltip: false,

        // 扩展 easyui-datagrid 的自定义属性，该属性表示 rowTooltip 为 true 或 列的扩展属性 tooltip 为 true 时，显示 tooltip 时的延迟毫秒数；
        // 该属性的值是 Number 类型，默认为 300 。
        tooltipDelay: 300
    };



    //  增加了 easyui-datagrid 中列 columnOption 的部分自定义扩展属性
    var columnOptions = {

        // 表示是否启用该列的 tooptip 效果，其值可以是以下两种类型：
        //      Boolean 类型，表示是否启用该列的 tooltip；
        //      Function 类型，其函数签名为 function (value, rowIndex, rowData)，表示为该列启用 tooltip 的方式；
        //          该回调函数返回一个 String 类型值，表示 tooltip 的 content 内容。
        // 默认为 Boolean 类型，值为 false。
        tooltip: false
    };

    if ($.fn.datagrid.extensions.columnOptions) {
        $.extend($.fn.datagrid.extensions.columnOptions, columnOptions);
    }
    else {
        $.fn.datagrid.extensions.columnOptions = columnOptions;
    }

    if ($.fn.datagrid.extensions.defaults) {
        $.extend($.fn.datagrid.extensions.defaults, defaults);
    } else {
        $.fn.datagrid.extensions.defaults = defaults;
    }

    if ($.fn.datagrid.extensions.methods) {
        $.extend($.fn.datagrid.extensions.methods, methods);
    } else {
        $.fn.datagrid.extensions.methods = methods;
    }


    $.extend($.fn.datagrid.defaults, defaults);
    $.extend($.fn.datagrid.methods, methods);

})(jQuery);