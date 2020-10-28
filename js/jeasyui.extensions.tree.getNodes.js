/**
* jQuery EasyUI 1.4.3
* Copyright (c) 2009-2015 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
* To use it on other terms please contact us at info@jeasyui.com
* http://www.jeasyui.com/license_commercial.php
*
* jQuery EasyUI tree 扩展
* jeasyui.extensions.tree.getNodes.js
* 开发 流云
* 由 落阳 整理
* 最近更新：2015-10-20
*
* 依赖项：
*   1、jquery.jdirk.js
*
* Copyright (c) 2015 ChenJianwei personal All rights reserved.
*/
(function ($) {

    $.util.namespace("$.fn.tree.extensions");

    var getNodes = function (target, cascade) {
        var t = $(target), roots = t.tree("getRoots"), opts = t.tree("options");
        roots = roots && roots.length ? roots : [];
        return cascade ? $.array.reduce(roots, function (prev, val, index) {
            prev.push(val);
            var cc = t.tree("getChildren", val.target);
            if (cc && cc.length) { $.array.merge(prev, cc); }
            return prev;
        }, []) : roots;
    };

    var defaults = {

    };

    var methods = {

        //  扩展 easyui-tree 的自定义方法；获取 easyui-tree 中的所有节点数据(包括根节点和子节点)所构成的一个集合；该方法的参数 cascade 定义为如下类型：
        //      Boolean 类型，默认为 false，表示是否连同子级节点数据一并返回；
        //  返回值：返回一个 Array 数组对象，数组中的每一个元素都表示一个 node；
        //      如果 cascade 为 true，则返回所有根节点以及子节点合并所构成的一个数组；
        //      如果 cascade 为 false，则仅返回所有根节点数据，同 getRoots 方法；
        //      如果 easyui-tree 中没有数据，则返回一个长度为 0 的数组。
        getNodes: function (jq, cascade) { return getNodes(jq[0], cascade); }
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