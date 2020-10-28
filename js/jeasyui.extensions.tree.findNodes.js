/**
* jQuery EasyUI 1.4.3
* Copyright (c) 2009-2015 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
* To use it on other terms please contact us at info@jeasyui.com
* http://www.jeasyui.com/license_commercial.php
*
* jQuery EasyUI tree 扩展
* jeasyui.extensions.tree.findNodes.js
* 开发 流云
* 由 落阳 整理
* 最近更新：2015-10-20
*
* 依赖项：
*   1、jquery.jdirk.js
*   2、jeasyui.extensions.tree.getNodes.js
*
* Copyright (c) 2015 ChenJianwei personal All rights reserved.
*/
(function ($) {

    $.util.namespace("$.fn.tree.extensions");

    var findNodes = function (target, param) {
        var t = $(target), ret;
        if ($.isFunction(param)) {
            ret = $.array.filter(t.tree("getNodes", true), param);
        } else if ($.array.likeArray(param) && !$.util.isString(param)) {
            ret = $.array.map(param, function (val) { return t.tree("find", val); });
            ret = $.array.filter(ret, function (val) { return val != undefined && val != null; });
        } else {
            ret = [];
        }
        return ret;
    };

    var defaults = {

    };

    var methods = {

        //  扩展 easyui-tree 的自定义方法；获取当前 easyui-tree 中的指定节点数据集合并返回；该方法的参数 param 可以定义为如下两种类型：
        //      Function 类型，该回调函数签名为 function(node, index, nodes)，其中 node 表示节点数据对象、index 表示行索引号、nodes 表示当前 easyui-tree 所有节点对象集合；
        //          如果 param 参数为 Function 类型，则 findNodes 方法会对当前 easyui-tree 中的每一个节点数据调用该回调函数；
        //          当回调函数返回 true 时，则返回的结果集中将会包含该行数据；
        //          如果该回调函数始终未返回 true，则该方法最终返回一个长度为 0 的数组对象。
        //      Array 类型，数组中的每一项都可以定义为如下类型：
        //          待查找的行数据的 idField(主键) 字段值；
        //          当 param 参数定义为 Array 类型时，则 findNodes 方法会对数组中的每一项循环调用 find 方法，并过滤掉 find 方法返回 null 的结果行；
        //  返回值：返回一个 Array 数组对象；数组中的每一项都是 JSON-Object 类型，表示一个节点数据对象；如果未找到相应数据，则返回一个长度为 0 的数组对象。
        findNodes: function (jq, param) { return findNodes(jq[0], param); }
    };

    var compent = $.fn.tree;
    if (compent.extensions.defaults) {
        $.extend(compent.extensions.defaults, defaults);
    } else {
        compent.extensions.defaults = defaults;
    }

    if (compent.extensions.methods) {
        $.extend(compent.extensions.methods, methods);
    } else {
        compent.extensions.methods = methods;
    }

    $.extend(compent.defaults, defaults);
    $.extend(compent.methods, methods);

})(jQuery);