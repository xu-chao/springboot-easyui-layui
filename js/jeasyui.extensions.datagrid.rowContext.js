/**
* jQuery EasyUI 1.4.3
* Copyright (c) 2009-2015 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
* To use it on other terms please contact us at info@jeasyui.com
* http://www.jeasyui.com/license_commercial.php
*
* jQuery EasyUI datagrid 扩展
* jeasyui.extensions.datagrid.rowContext.js
* 开发 流云
* 由 落阳 整理
* 最近更新：2017-12-27
*
* 依赖项：
*   1、jquery.jdirk.js
*   2、jeasyui.extensions.menu.js
*
* Copyright (c) 2015 ChenJianwei personal All rights reserved.
*/
(function ($) {

    $.util.namespace("$.fn.datagrid.extensions");

    var defaultMenus = {};
    defaultMenus.refreshMenus = [
        {
            text: "刷新当前页", iconCls: "pagination-load",
            disabled: function (e, menuItem, menu, target, index, row) {
                var t = $(target),
                    state = $.data(target, "datagrid"),
                    opts = state.options;
                return !opts.refreshMenu ? true : false;
            },
            handler: function (e, menuItem, menu, target, index, row) {
                $(target).datagrid("reload");
            }
        }
    ];
    // defaultMenus.pagingMenus = [
    //     {
    //         text: "首页", iconCls: "pagination-first",
    //         disabled: function (e, menuItem, menu, target, index, row) {
    //             return disabledPrevPage(target);
    //         },
    //         handler: function (e, menuItem, menu, target, index, row) {
    //             selectFirstPage(target);
    //         }
    //     },
    //     {
    //         text: "上一页", iconCls: "pagination-prev",
    //         disabled: function (e, menuItem, menu, target, index, row) {
    //             return disabledPrevPage(target);
    //         },
    //         handler: function (e, menuItem, menu, target, index, row) {
    //             selectPrevPage(target);
    //         }
    //     },
    //     {
    //         text: "下一页", iconCls: "pagination-next",
    //         disabled: function (e, menuItem, menu, target, index, row) {
    //             return disabledNextPage(target);
    //         },
    //         handler: function (e, menuItem, menu, target, index, row) {
    //             selectNextPage(target);
    //         }
    //     },
    //     {
    //         text: "末页", iconCls: "pagination-last",
    //         disabled: function (e, menuItem, menu, target, index, row) {
    //             return disabledNextPage(target);
    //         },
    //         handler: function (e, menuItem, menu, target, index, row) {
    //             selectLastPage(target);
    //         }
    //     }
    // ];
    // defaultMenus.pagingRootMenus = [
    //     {
    //         text: "翻页", iconCls: "",
    //         disabled: function (e, menuItem, menu, target, index, row) {
    //             var state = $.data(target, "datagrid"),
    //                 opts = state.options;
    //             return opts.pagingMenu == true || !opts.pagingMenu.disabled ? false : true;
    //         },
    //         children: defaultMenus.pagingMenus
    //     }
    // ];

    function getTrIndex(tr) {
        if (!tr) {
            return -1;
        }
        tr = $.util.isJqueryObject(tr) ? tr : $(tr);
        var attr = tr.attr("datagrid-row-index");
        return (attr == null || attr == undefined || attr == "") ? -1 : window.parseInt(attr, 10);
    }

    function getRow(target, index) {
        var t = $(target),
            rows = t.datagrid("getRows");
        return rows ? rows[index] : undefined;
    }

    function getRowMenuItems(t, opts, e, index, row) {
        var menuItems = [],
            defaultMenuItems = [],
            args = [t[0], index, row];

        if (opts.refreshMenu) {
            $.array.merge(defaultMenuItems, defaultMenus.refreshMenus);
        }
        // if (opts.pagingMenu != null && opts.pagingMenu != undefined && (opts.pagingMenu == true || !opts.pagingMenu.disabled)) {
        //     $.array.merge(defaultMenuItems,
        //         defaultMenuItems.length ? "-" : [],
        //         opts.pagingMenu.submenu ? defaultMenus.pagingRootMenus : defaultMenus.pagingMenus);
        // }

        if ($.array.likeArrayNotString(opts.rowContextMenu)) {
            $.array.merge(menuItems, menuItems.length ? "-" : [], opts.rowContextMenu);
        }
        if (defaultMenuItems.length) {
            $.array.merge(menuItems, menuItems.length ? "-" : [], defaultMenuItems);
        }

        return $.easyui.parseMenuItems(menuItems, args);
    }

    function initRowContextMenu(t, opts) {
        t.datagrid("getPanel").panel("body").delegate("tr.datagrid-row", "contextmenu.datagrid-extensions", function (e) {
            var index = getTrIndex(this);
            if (index == -1) {
                return;
            }
            if (opts.selectOnRowContextMenu) {
                t.datagrid("selectRow", index);
            }
            if (opts.enableRowContextMenu) {
                e.preventDefault();
                if ($.type(opts.pagingMenu) == "object") {
                    opts.pagingMenu = $.union(opts.pagingMenu, { disabled: false, submenu: true });
                }
                var row = getRow(t[0], index),
                    menuItems = getRowMenuItems(t, opts, e, index, row);
                $.easyui.showMenu({ items: menuItems, left: e.pageX, top: e.pageY, event: e });
            }
        });
    }

    function initializeExtensions(target) {
        var t = $(target),
            state = $.data(target, "datagrid"),
            opts = state.options;

        initRowContextMenu(t, opts);
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
                                selectOnRowContextMenu: "boolean",
                                enableRowContextMenu: "boolean",
                                refreshMenu: "boolean",
                            }
                        ]), options);
            _datagrid.call(jq, opts, param);
            if (!isInited) {
                initializeExtensions(this);
            }
        });
    };
    $.union($.fn.datagrid, _datagrid);

    function disabledPrevPage(target) {
        var t = $(target),
            state = $.data(target, "datagrid"),
            opts = state.options,
            pager = t.datagrid("getPager");
        if (!opts.pagination || !pager || !pager.length) {
            return true;
        }
        var popts = pager.pagination("options");
        return popts.pageNumber <= 1;
    }

    function disabledNextPage(target) {
        var t = $(target),
            state = $.data(target, "datagrid"),
            opts = state.options,
            pager = t.datagrid("getPager");
        if (!opts.pagination || !pager || !pager.length) {
            return true;
        }
        var popts = pager.pagination("options"),
            pageCount = Math.ceil(parseFloat(popts.total) / parseFloat(popts.pageSize));
        return popts.pageNumber >= pageCount;
    }

    function selectFirstPage(target) {
        var disabled = disabledPrevPage(target);
        if (disabled) {
            return;
        }
        $(target).datagrid("getPager").pagination("select", 1);
    }

    function selectPrevPage(target) {
        var disabled = disabledPrevPage(target);
        if (disabled) {
            return;
        }
        var pager = $(target).datagrid("getPager"),
            popts = pager.pagination("options");
        pager.pagination("select", popts.pageNumber - 1);
    }

    function selectNextPage(target) {
        var disabled = disabledNextPage(target);
        if (disabled) {
            return;
        }
        var pager = $(target).datagrid("getPager"),
            popts = pager.pagination("options");
        pager.pagination("select", popts.pageNumber + 1);
    }

    function selectLastPage(target) {
        var disabled = disabledNextPage(target);
        if (disabled) {
            return;
        }
        var pager = $(target).datagrid("getPager"),
            popts = pager.pagination("options"),
            pageCount = Math.ceil(parseFloat(popts.total) / parseFloat(popts.pageSize));
        pager.pagination("select", pageCount);
    }

    var defaults = {

        //  扩展 easyui-datagrid 的自定义属性，该属性表示在打开数据行右键菜单时是否触发数据行的 Select 动作；
        //  Boolean 类型值，默认为 false。
        selectOnRowContextMenu: false,

        //  扩展 easyui-datagrid 的自定义属性，该属性表示是否启用 easyui-datagrid 的数据行右键菜单；
        //  Boolean 类型值，默认为 true。
        enableRowContextMenu: true,

        //  扩展 easyui-datagrid 的自定义属性，该属性表示数据行右键菜单，为一个 Array 对象；数组中的每一个元素都具有如下属性:
        //      id:         表示菜单项的 id；
        //      text:       表示菜单项的显示文本；
        //      iconCls:    表示菜单项的左侧显示图标；
        //      disabled:   表示菜单项是否被禁用(禁用的菜单项点击无效)；
        //      hideOnClick:    表示该菜单项点击后整个右键菜单是否立即自动隐藏；
        //      bold:           Boolean 类型值，默认为 false；表示该菜单项是否字体加粗；
        //      style:          JSON-Object 类型值，默认为 null；表示要附加到该菜单项的样式；
        //      handler:    表示菜单项的点击事件，该事件函数格式为 function(e, item, menu, grid, rowIndex, row)，其中 this 指向菜单项本身
        //  备注：具体格式参考 easyui-datagrid 的 toolbar 属性为 Array 对象类型的格式；
        rowContextMenu: null,

        //  扩展 easyui-datagrid 的自定义属性，该属性表示是否启用数据行右键菜单中的“翻页”菜单项的功能；
        //  该属性可以定义为以下类型：
        //      Boolean 类型值，表示是否启用右键菜单中的“翻页”菜单项功能，默认为 true。
        //      JSON-Object 类型，该 JSON-Object 可以包含如下属性：
        //          disabled:   Boolean 类型值，表示是否禁用右键菜单中的“翻页”菜单项功能，默认为 false；
        //          submenu:    表示这四个菜单项是否以子菜单方式呈现，默认为 true；
        //  备注：当 enableRowContextMenu 属性设置为 true 时，该属性才有效。
        pagingMenu: { submenu: false },

        //  扩展 easyui-datagrid 的自定义属性，该属性表示是否启用数据行右键菜单中的“刷新当前页”菜单项的功能；
        //  Boolean 类型值，默认为 true。
        //  备注：当 enableRowContextMenu 属性设置为 true 时，该属性才有效。
        refreshMenu: true
    };

    var methods = {


    };

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