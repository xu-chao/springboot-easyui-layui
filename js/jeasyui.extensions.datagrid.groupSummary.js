/**
* jQuery EasyUI 1.4.3
* Copyright (c) 2009-2015 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
* To use it on other terms please contact us at info@jeasyui.com
* http://www.jeasyui.com/license_commercial.php
*
* jQuery EasyUI datagrid 扩展
* jeasyui.extensions.datagrid.groupSummary.js
* 开发 真真
* 由 落阳 整理及完善
* 最近更新：2016-05-30
*
* 依赖项：
*   1、jquery.jdirk.js
*   2、jeasyui.extensions.datagrid.getColumnInfo.js
*   3、jeasyui.extensions.datagrid.columnToggle.js
*
* Copyright (c) 2015 ChenJianwei personal All rights reserved.
*/
(function ($) {

    var x = [];
    var y = [];
    var temp;
    var flag = 1;
    var total;
    var last_level;
    var last_2_level;
    var g_title;
    var zoom_length;
    var timeline_x = [];
    var timeline_series = [];
    var timeline_temp;
    var timeline_series_temp = [];
    var timeline_series_temp_2 = [];

    $.util.namespace("$.fn.datagrid.extensions");

    function getTrIndex(tr) {
        if (!tr) {
            return -1;
        }
        tr = $.util.isJqueryObject(tr) ? tr : $(tr);
        var attr = tr.attr("datagrid-row-index");
        return (attr == null || attr == undefined || attr == "") ? -1 : window.parseInt(attr, 10);
    }

    function getVisibleRows(target) {
        var t = $(target),
            rows = t.datagrid("getRows"),
            p = t.datagrid("getPanel"),
            indexes = [];
        p.find("div.datagrid-view div.datagrid-body table.datagrid-btable:first tr.datagrid-row:not(.datagrid-row-hidden)").each(function () {
            var index = getTrIndex(this);
            if (index != -1) {
                indexes.push(index);
            }
        });
        return (!rows || !rows.length || !indexes.length)
            ? []
            : $.array.map(indexes, function (i) {
                return rows[i];
            });
    }

    var defaultMenus = {};
    // 分组汇总菜单
    defaultMenus.groupSummaryMenus = [
        {
            text: "分组汇总", iconCls: "icon-standard-application-side-tree",
            handler: function (e, menuItem, menu, target, field) {
                showGroupSummaryDialog(target, field);
            }
        }
    ];
    //可分组汇总的字段显示窗口
    function showGroupSummaryDialog(target, field) {
        var t = $(target), opts = t.datagrid("options"),
            oriCols = $.extend(true, [], t.datagrid("getColumnOptions", "all"));
        g_title = t.datagrid("getPanel").panel('options').title;
        var data = [], count = 0;
        //可选择的列数据初始化
        $.each(oriCols, function (index, item) {
            // 修改了源码
            // if (!item.groupable || !item.field || !item.title) { return; }
            if (!item.field || !item.title) { return; }
            data.push({ id: index, field: item.field, title: item.title, width: item.width });
        });
        //弹框
        var d = $("<div />").appendTo($("body")).dialog({
            title: g_title + "--Group BY配置",
            iconCls: "icon-standard-application-view-detail",
            height: 360,
            width: 520,
            modal: true,
            resizable: true,
            content:
            '<div id="groupSummaryLayout">' +
                '<div region="west" border="false" style="width:260px;padding:4px 2px 4px 4px;">' +
                    '<table id="groupSummaryAllColumnsGrid" />' +
                '</div>' +
                '<div region="center" border="false" style="padding:4px 4px 4px 2px;">' +
                    '<table id="groupSummarySelectColumnsGrid" />' +
                '</div>' +
            '</div>',
            buttons: [
                {
                    text: "确定", iconCls: "icon-ok", handler: function () {
                        var rows = $("#groupSummarySelectColumnsGrid").datagrid("getRows");
                        if (rows.length > 0) {
                            total = rows.length;
                            last_level = rows[total-1].title;
                            if(total > 1){
                                last_2_level = rows[total-2].title;
                            }else {
                                last_2_level = last_level;
                            }
                            setTimeout(function () {
                                parseGroupSummaryInvoke(t, opts, rows, oriCols);
                            }, 10);
                        }
                        else { $.messager.alert("操作提醒", "缺少分组字段!"); }
                    }
                },
                {
                    text: "关闭", iconCls: "icon-cancel", handler: function () {
                        d.dialog("destroy");
                    }
                }
            ]
        });
        //重写dialog的x按钮事件，以确保关闭dialog时会销毁dialog
        var toolbutton = d.dialog("header").find(".panel-tool a.panel-tool-close");
        toolbutton.click(function () { d.dialog("destroy"); });
        //布局初始化
        $("#groupSummaryLayout").layout({ fit: true });
        //待选表格
        $("#groupSummaryAllColumnsGrid").datagrid({
            title: "字段列表(单击添加)",
            nowrap: false, rownumbers: true,
            fit: true, singleSelect: true, idField: "id",
            data: data,
            columns: [[
                { title: '字段名称', field: 'title', width: 200, align: "center" }
            ]],
            onClickRow: function (rowIndex, rowData) {
                var rows = $("#groupSummarySelectColumnsGrid").datagrid("getRows");
                if (!$.array.contains(rows, rowData, function (a, b) { return a.id == b.id; })) {
                    $("#groupSummarySelectColumnsGrid").datagrid("appendRow", rowData);
                }
            },
            enableHeaderContextMenu: false,
            enableHeaderClickMenu: false,
            enableGroupSummary: false
        });
        //已选表格
        $("#groupSummarySelectColumnsGrid").datagrid({
            title: "已选字段(单击移除)",
            nowrap: false, rownumbers: true,
            fit: true, singleSelect: true, idField: "id",
            columns: [[
                { title: '字段名称', field: 'title', width: 200, align: "center" }
            ]],
            onClickRow: function (rowIndex, rowData) {
                $("#groupSummarySelectColumnsGrid").datagrid("deleteRow", rowIndex);
            },
            enableHeaderContextMenu: false,
            enableHeaderClickMenu: false,
            enableGroupSummary: false
        });
    }
    function parseGroupSummaryInvoke(t, opts, selfCols, oriCols) {
        oriCols = $.extend(true, [], oriCols);
        var values = [], level = 0;
        var mode = $.util.isBoolean(opts.enableGroupSummary) ? "local" : opts.enableGroupSummary.mode;
        if (mode == "local") {
            var rows = $.extend(true, [], getVisibleRows(t[0]));
            var data = parseGroupSummaryInitRows(t, opts, values, rows, oriCols, selfCols, level);
            parseGroupSummaryLoadData(oriCols, selfCols, data);
        } else {
            if ($.string.isNullOrWhiteSpace(opts.url)) {
                $.messager.alert("操作提醒", "远程数据地址未设置，无法进行分组汇总。"); return;
            }
            //组装参数
            var queryParams = $.extend({}, opts.queryParams);
            if (opts.pagination) {
                //页码为0表示查询所有数据，这需要与后台协定好
                $.extend(queryParams, { page: 0, rows: opts.pageSize });
            }
            if (opts.sortName) {
                $.extend(queryParams, { sort: opts.sortName, order: opts.sortOrder });
            }
            opts.loader.call(t[0], queryParams, function (rows) {
                if ($.isPlainObject(rows)) { rows = rows.rows; }
                var data = parseGroupSummaryInitRows(t, opts, values, rows, oriCols, selfCols, level);
                parseGroupSummaryLoadData(oriCols, selfCols, data);
            }, function () {
                //发生异常时
            });
        }
    }
    //数据组装
    function parseGroupSummaryInitRows(t, opts, pValues, rows, oriCols, selfCols, level) {
        if (selfCols.length <= level) {
            //如果超出层级范围则添加明细数据
            return parseGroupSummaryInitData(pValues, rows, selfCols, level);
        }
        var data = [], selfCol = selfCols[level], len = rows.length;
        var ignoreFormatter = true;
        if ($.isPlainObject(opts.enableGroupSummary)) {
            ignoreFormatter = opts.enableGroupSummary.ignoreFormatter;
        }
        for (var i = 0; i < len; i++) {
            var bit = true, value = rows[i][selfCol.field] || "空白";
            //判断是否满足向上逐级条件
            for (var v = 0; v < pValues.length && bit; v++) {
                var stepValue = rows[i][pValues[v].field] || "空白";
                if (stepValue != pValues[v].value) {
                    bit = false;
                }
            }
            if (bit) {
                //判断是否存在分组
                for (var d = 0; d < data.length && bit; d++) {
                    if (data[d]["groupSummaryName"] == value) {
                        bit = false;
                    }
                }
            }

            if (bit) {
                //写入分组数据
                var row = {};
                var values = $.extend(true, [], pValues);
                values.push({ field: selfCol.field, value: value });
                //递归遍历Rows
                row["children"] = parseGroupSummaryInitRows(t, opts, values, rows, oriCols, selfCols, level + 1);
                parseGroupSummaryInvokeSum(t, row, ignoreFormatter, oriCols, selfCols);
                row["groupSummaryID"] = "g_" + level + "_" + i;
                row["groupSummaryName"] = value;
                row["groupSummaryCount"] = row.children.length;
                // row["groupSummaryName"] = value + row.children.length;
                row["state"] = "closed";
                data.push(row);
                if(level == 0){
                    if(value != timeline_temp){
                        var sumCompare = 0;
                        var legeng_series = [];
                        timeline_x.push(value);
                        timeline_temp = value;
                        $.each(row.children, function (key, values){
                            var timeline_obj = new Object();
                            timeline_obj.name = values.groupSummaryName;
                            if(total == 1 || values.children == '' || typeof values.children == 'undefined'){
                                timeline_obj.value = 1;
                                sumCompare += 1;
                            }else {
                                timeline_obj.value = values.children.length;
                                sumCompare += values.children.length;
                            }
                            timeline_series_temp.push(timeline_obj);
                            legeng_series.push(values.groupSummaryName);
                        });
                    }
                    var timeline_obj_2 = new Object();
                    var timeline_obj_3 = new Object();
                    var timeline_obj_4 = new Object();
                    timeline_obj_2.data = timeline_series_temp;
                    timeline_obj_3.series = timeline_obj_2;
                    timeline_obj_4.text = last_2_level + ':' + value;
                    timeline_obj_4.subtext = '共' + sumCompare + '条记录';
                    timeline_obj_3.title = timeline_obj_4;
                    timeline_series.push(timeline_obj_3);
                    timeline_obj_4.data = legeng_series;
                    timeline_obj_3.legend = timeline_obj_4;
                    timeline_series_temp = [];
                }
                if((level + 1) == total){
                    var str = '';
                    $.each(pValues, function (key, values){
                        str += values.value + "--";
                    });
                    str = str.substr(0,str.length-2);
                    var obj = new Object();
                    obj.name = str;
                    obj.value = row["children"].length;
                    obj.id = row["groupSummaryID"];
                    if(temp != str && i != 0){
                        obj.flag = flag+1;
                        flag++;
                    }else {
                        obj.flag = flag;
                    }
                    temp = str;
                    x.push(value);
                    y.push(obj);
                }else {
                    console.log("心累...");
                }
            }
        }
        timeline_series_temp_2 = timeline_series;
        return data;
    }
    //装载明细
    function parseGroupSummaryInitData(pValues, rows, selfCols, level) {
        var data = [];
        for (var i = 0; i < rows.length; i++) {
            var count = i+1;
            var bit = true;
            //向上逐级条件判断
            for (var v = 0; v < pValues.length && bit; v++) {
                var stepValue = rows[i][pValues[v].field] || "空白";
                if (stepValue != pValues[v].value) {
                    bit = false; break;
                }
            }
            if (bit) {
                var row = $.extend(true, {}, rows[i]);
                row["groupSummaryID"] = "g_" + level + "_" + i;
                row["groupSummaryName"] = "第"+ count + "条记录";
                data.push(row);
            }
        }
        return data;
    };
    //分组汇总计算
    function parseGroupSummaryInvokeSum(t, row, ignoreFormatter, oriCols, selfCols) {
        var rowIndex = t.datagrid("getRowIndex", row);
        $.each(oriCols, function (i, c) {
            var bit = true;
            //分组列不做汇总
            for (var s = 0; s < selfCols.length && bit; s++) {
                if (selfCols[s].field == c.field) {
                    bit = false;
                }
            }
            if (bit) {
                var temp = 0;
                //汇总计算
                var len = row["children"].length;
                for (var n = 0; n < len; n++) {
                    if (!c.calcable) {
                        temp = ""; break;
                    }
                    var value = row["children"][n][c.field],
                        realValue = ignoreFormatter ? value : (((n != (len - 1)) && c.formatter && $.isFunction(c.formatter)) ? c.formatter.call(t[0], value, row, rowIndex) : value);
                    if ($.type(realValue) == "number") {
                        temp += realValue;
                    }
                    else if ($.type(value) == "number") {
                        temp += value;
                    }
                    else { temp = ""; break; }
                }
                row[c.field] = temp;
            }
        });
    };
    //分组汇总载入数据
    function parseGroupSummaryLoadData(oriCols, selfCols, rows) {
        //弹窗
        var d = $("<div />").appendTo($("body")).dialog({
            title: "HQFT（" + g_title + "）数据分析-生成报表",
            modal: true,
            width: $(window).width() - 20,
            height: $(window).height() - 20,
            content: '<table id="groupSummaryGrid" />',
            onClose: function () {
                x = [];
                y = [];
                timeline_x = [];
                timeline_series = [];
                timeline_temp = [];
                timeline_series_temp = [];
                timeline_series_temp_2 = [];
            },
            buttons: [
                {
                    text: "多维图表", iconCls: "icon-large-chart", handler: function () {
                        if(x.length > 20){
                            zoom_length = 15;
                        }else {
                            zoom_length = 100;
                        }
                        $('#zzt').dialog({
                            title: g_title,
                            width: $(window).width() - 40,
                            height: $(window).height() - 40,
                            closed: false,//显示对话框
                            modal: true,
                            closable: true,
                            resizable: true
                        }).dialog("center");

                        var DChart = echarts.init(document.getElementById('chart_zzt'));
                        var option = {
                            textStyle:{
                                color: '#A23400'
                            },
                            title:{
                                text: '数据报表分析',
                                left: '10%'
                            },
                            grid: {
                                left: '10%',
                                bottom:'20%'
                            },
                            color: ['#3bcec6'],
                            toolbox: {
                                show: true,
                                itemSize: 32,
                                feature: {
                                    // dataZoom: {
                                    //   yAxisIndex: 'none'
                                    // },
                                    dataView: {readOnly: false},
                                    // magicType: {type: ['line', 'bar', 'stack', 'tiled']},
                                    restore: {},
                                    saveAsImage: {icon:'image://./image/download.png'}
                                },
                                right:'10%'
                            },
                            tooltip: {
                                type: 'line',
                                show: true
                            },
                            dataZoom: [
                                {
                                    show: true,
                                    realtime: true,
                                    start: 0,
                                    end: zoom_length
                                },
                                {
                                    type: 'inside',
                                    realtime: true,
                                    start: 0,
                                    end: zoom_length
                                }
                            ],
                            legend: {
                                data:['柱状图','折线图'],
                                selected: {
                                    '折线图' : false
                                }
                            },
                            xAxis : [
                                {
                                    triggerEvent : true,
                                    type : 'category',
                                    name : last_level,
                                    data : x,
                                    axisLabel: {
                                        interval:0,
                                        rotate:0,
                                        fontSize:12,
                                        formatter : function(params,index){
                                            if (index % 2 != 0) {
                                                return '\n\n' + params;
                                            }
                                            else {
                                                return params;
                                            }
                                        }
                                    },
                                }
                            ],
                            yAxis : [
                                {
                                    type : 'value',
                                    name : '总计'
                                }
                            ],
                            series : [
                                {
                                    "name":"柱状图",
                                    "type":"bar",
                                    "data": y,
                                    itemStyle: {
                                        normal: {
                                            // 随机颜色
                                            color: function (value){
                                                if (value.data.flag % 2 != 0) {
                                                    return "#60C0DD";
                                                }
                                                else {
                                                    return "#9cc5b2";
                                                }
                                                // return "#60C0DD";
                                                // return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6);
                                            },
                                            label: {
                                                show: true,
                                                position: 'top',
                                                formatter: '{c}'
                                            }
                                        }
                                    },
                                    barWidth: 12
                                },
                                {
                                    name: "折线图",
                                    data: y,
                                    itemStyle : {  /*设置折线颜色*/
                                        normal : {
                                            color:'#A23400'
                                        }
                                    },
                                    type: 'line',
                                    smooth: true,
                                    barWidth:40
                                }
                            ]
                        };
                        DChart.setOption(option,true);
                        DChart.off();
                        DChart.on('click', function (params) {
                            var root = $("#groupSummaryGrid").treegrid("find", params.data.id);
                            var title_t = root.groupSummaryName;
                            var data = root.children;

                            $('#zzt_detail').dialog({
                                title: g_title + "--" + title_t + "--详细信息",
                                width: $(window).width() - 40,
                                height: $(window).height() - 40,
                                closed: false,//显示对话框
                                modal: true,
                                closable: true,
                                resizable: true
                            }).dialog("center");

                            var czd = $("#chart_zzt_detail").treegrid({
                                nowrap: false, border: false,
                                fit: true, singleSelect: true,
                                remoteSort: false,
                                idField: "groupSummaryID",
                                treeField: "groupSummaryName",
                                columns: [oriCols], data: data,
                                enableHeaderContextMenu: true,
                                enableHeaderClickMenu: true,
                                enableGroupSummary: false
                            });
                        });
                    }
                },
                {
                    text: "联动图表", iconCls: "icon-lpie", handler: function () {

                        $('#lbin').dialog({
                            title: g_title,
                            width: $(window).width() - 40,
                            height: $(window).height() - 40,
                            closed: false,//显示对话框
                            modal: true,
                            closable: true,
                            resizable: true,
                        }).dialog("center");

                        var LChart = echarts.init(document.getElementById('chart_lbin'));

                        option = {
                            baseOption: {
                                timeline: {
                                    axisType: 'category',
                                    autoPlay: true,
                                    playInterval: 2000,
                                    padding: 5,
                                    data: timeline_x,
                                    label: {
                                        interval:0,
                                        rotate:0,
                                        fontSize:12,
                                        formatter : function(params,index){
                                            if(timeline_x.length > 5){
                                                if (index % 2 != 0) {
                                                    if (params.length > 5) {
                                                        return '\n' + params.substring(0, 5) + "...";
                                                    } else {
                                                        return '\n' + params;
                                                    }
                                                }
                                                else {
                                                    if (params.length > 5) {
                                                        return params.substring(0, 5) + "...";
                                                    } else {
                                                        return params;
                                                    }
                                                }
                                            }else {
                                                return params;
                                            }
                                        }
                                    },
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: '{b}'
                                    },
                                },
                                title: {
                                    textStyle: {
                                        color: '#235894'
                                    },
                                    subtextStyle:{
                                        fontSize:16,
                                        color: "#8a2be2"
                                    }
                                },
                                tooltip: {
                                    trigger: 'item',
                                    formatter: '{a} <br/>{b}: <font color="#90ee90">共计{c}</font> ({d}%)'
                                },
                                grid: {
                                    left: '10%',
                                    bottom:'20%'
                                },
                                legend: {
                                    type: 'scroll',
                                    orient: 'vertical',
                                    right: 10,
                                    top: 20,
                                    bottom: 20,
                                    // data: timeline_x,
                                },
                                series: [
                                    {
                                        name: last_2_level,
                                        type: 'pie',
                                        radius: ['50%', '70%'],
                                        avoidLabelOverlap: false,
                                        label: {
                                            formatter: '{b}: 共计{c}',
                                            show: true,
                                            // position: 'center'
                                        },
                                        emphasis: {
                                            label: {
                                                show: true,
                                                fontSize: '16',
                                                // fontWeight: 'bold',
                                                position: 'center'
                                            }
                                        },
                                        labelLine: {
                                            show: true
                                        },
                                    },
                                ]
                            },
                            options: timeline_series_temp_2
                        };

                        LChart.setOption(option,true);
                        LChart.off();
                        // LChart.on('click', function (params) {
                        //     var data = [];
                        //     var root = $("#groupSummaryGrid").treegrid("find", params.data.name);
                        //     var title_t = root.groupSummaryName;
                        //     if(typeof (root.children) === 'undefined'){
                        //         data.push(root);
                        //     }else {
                        //         data = root.children;
                        //     }
                        //
                        //     $('#zzt_detail').dialog({
                        //         title: g_title + "--" + title_t + "--详细信息(" + title_lpie + ")",
                        //         width: $(window).width() - 40,
                        //         height: $(window).height() - 40,
                        //         closed: false,//显示对话框
                        //         modal: true,
                        //         closable: true,
                        //         resizable: true
                        //     }).dialog("center");
                        //
                        //     var czd = $("#chart_zzt_detail").treegrid({
                        //         nowrap: false, border: false,
                        //         fit: true, singleSelect: true,
                        //         remoteSort: false,
                        //         idField: "groupSummaryID",
                        //         treeField: "groupSummaryName",
                        //         columns: [oriCols], data: data,
                        //         enableHeaderContextMenu: true,
                        //         enableHeaderClickMenu: true,
                        //         enableGroupSummary: false
                        //     });
                        // });
                    }
                },
                {
                    text: "一维图表", iconCls: "icon-large-pie", handler: function () {
                        var option = $("#groupSummaryGrid").treegrid('getSelected');
                        var size = total;
                        var arr = [];
                        if(total == 1){
                            size++;
                        }
                        if(option === null || typeof option === 'undefined'){
                            layer.msg("请先选中表格里的某一项内容！");
                        }else if(option.groupSummaryID.substr(2,1) != size-2){
                            layer.msg("请选中最底层级的上一级目录进行分组查看！");
                        } else {
                            if(total == 1){
                                arr.push(option);
                            }else {
                                arr = option.children;
                            }
                            var data = [];
                            var countPie = 0;
                            $.each(arr, function (key, values){
                                var obj_pie = new Object();
                                obj_pie.id = values.groupSummaryID;
                                obj_pie.name = values.groupSummaryName;
                                if(typeof (values.children) === 'undefined'){
                                    obj_pie.value = 1;
                                }else {
                                    obj_pie.value = values.children.length;
                                    countPie += values.children.length;
                                }
                                data.push(obj_pie);
                            });
                            var title_pie = last_2_level + " : "+ option.groupSummaryName;

                            $('#bin').dialog({
                                title: g_title,
                                width: $(window).width() - 40,
                                height: $(window).height() - 40,
                                closed: false,//显示对话框
                                modal: true,
                                closable: true,
                                resizable: true
                            }).dialog("center");

                            var PChart = echarts.init(document.getElementById('chart_bin'));

                            option = {
                                title: {
                                    text: title_pie,
                                    subtext: '共' + countPie + '条记录',
                                    textStyle: {
                                        color: '#235894'
                                    },
                                    subtextStyle:{
                                        fontSize:16,
                                        color: "#8a2be2"
                                    }
                                },
                                tooltip: {
                                    trigger: 'item',
                                    formatter: '{a} <br/>{b}: <font color="#90ee90">共计{c}</font> ({d}%)'
                                },
                                legend: {
                                    type: 'scroll',
                                    orient: 'vertical',
                                    right: 10,
                                    top: 20,
                                    bottom: 20,
                                    data: data,
                                },
                                series: [
                                    {
                                        name: title_pie,
                                        type: 'pie',
                                        // radius: ['50%', '70%'],
                                        radius: '70%',
                                        avoidLabelOverlap: false,
                                        label: {
                                            show: true,
                                            formatter: '{b}: 共计{c}'
                                            // position: 'center'
                                        },
                                        emphasis: {
                                            label: {
                                                show: true,
                                                fontSize: '18',
                                                itemStyle: {
                                                    shadowBlur: 10,
                                                    shadowOffsetX: 0,
                                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                                }
                                            }
                                        },
                                        labelLine: {
                                            show: true
                                        },
                                        data:data,
                                    }
                                ]
                            };

                            PChart.setOption(option,true);
                            PChart.off();
                            PChart.on('click', function (params) {
                                var data = [];
                                var root = $("#groupSummaryGrid").treegrid("find", params.data.id);
                                var title_t = root.groupSummaryName;
                                if(typeof (root.children) === 'undefined'){
                                    data.push(root);
                                }else {
                                    data = root.children;
                                }

                                $('#zzt_detail').dialog({
                                    title: g_title + "--" + title_t + "--详细信息(" + title_pie + ")",
                                    width: $(window).width() - 40,
                                    height: $(window).height() - 40,
                                    closed: false,//显示对话框
                                    modal: true,
                                    closable: true,
                                    resizable: true
                                }).dialog("center");

                                var czd = $("#chart_zzt_detail").treegrid({
                                    nowrap: false, border: false,
                                    fit: true, singleSelect: true,
                                    remoteSort: false,
                                    idField: "groupSummaryID",
                                    treeField: "groupSummaryName",
                                    columns: [oriCols], data: data,
                                    enableHeaderContextMenu: true,
                                    enableHeaderClickMenu: true,
                                    enableGroupSummary: false
                                });
                            });
                        }
                    }
                },
                {
                    text: "关闭", iconCls: "icon-cancel", handler: function () {
                        d.dialog("destroy");
                        x = [];
                        y = [];
                        timeline_x = [];
                        timeline_series = [];
                        timeline_temp = [];
                        timeline_series_temp = [];
                        timeline_series_temp_2 = [];
                    }
                }
            ]
        });
        //重写dialog的x按钮事件，以确保关闭dialog时会销毁dialog
        var toolbutton = d.dialog("header").find(".panel-tool a.panel-tool-close");
        toolbutton.click(function () { d.dialog("destroy"); });

        var title = "层级：", width = 40, rowspan = 1;
        for (var i = 0; i < selfCols.length; i++) {
            if (i > 0) { title += " > "; }
            title += selfCols[i].title;
            width = selfCols[i].width > width ? selfCols[i].width : width;
            $.each(oriCols, function (index, c) {
                //隐藏分组列
                if (c.field == selfCols[i].field) {
                    c.hidden = true;
                }
                //跨行表头支持
                if (c.rowspan) {
                    rowspan = c.rowspan > rowspan ? c.rowspan : rowspan;
                }
            });
        }
        //树形列添加
        $.array.insert(oriCols, 0, {
            width: width + (selfCols.length * 50), align: "left",
            title: title, rowspan: rowspan,
            field: "groupSummaryName",
            formatter: function (value, row, index) {
                if (value != '' && typeof value != 'undefined') {
                    if (row.groupSummaryCount != '' && typeof row.groupSummaryCount != 'undefined'){
                        return row.groupSummaryName + "--<font color='#a52a2a'>(" + row.groupSummaryCount + ")</font>";
                    }else {
                        return row.groupSummaryName;
                    }
                } else {
                    return "无";
                }
            }
        });
        var tg = $("#groupSummaryGrid").treegrid({
            nowrap: false, border: false,
            fit: true, singleSelect: true,
            remoteSort: false,
            idField: "groupSummaryID",
            treeField: "groupSummaryName",
            columns: [oriCols], data: rows,
            enableHeaderContextMenu: true,
            enableHeaderClickMenu: true,
            enableGroupSummary: false,
            navigatingWithKey: true,
            navigateHandler: {
                up: function (targetIndex) {
                    console.log("功能待开发");
                },
                down: function (targetIndex) {
                    console.log("功能待开发");
                },
                enter: function (selectedData) {
                    var g_level = selectedData[0].groupSummaryID.substr(2,1);
                    if (g_level == total){
                        cloumnDetail(selectedData[0]);
                    }else {
                        layer.msg("该列回车功能待开发！");
                        return;
                    }
                }
            }
        });
    };




    function initializeExtensions(target) {
        var t = $(target),
            state = $.data(target, "datagrid"),
            opts = state.options;

    }

    function beforeInitialize(opts) {
        if (opts.enableGroupSummary == undefined) {
            opts.enableGroupSummary = { enable: true, mode: "local", ignoreFormatter: true };
        }
        else if ($.isPlainObject(opts.enableGroupSummary)) {
            opts.enableGroupSummary.enable = opts.enableGroupSummary.enable == undefined ? true : opts.enableGroupSummary.enable;
            opts.enableGroupSummary.mode = opts.enableGroupSummary.mode == undefined ? "local" : ($.array.contains(["local", "remote"], opts.enableGroupSummary.mode) ? opts.enableGroupSummary.mode : "local");
            opts.enableGroupSummary.ignoreFormatter = opts.enableGroupSummary.ignoreFormatter == undefined ? true : opts.enableGroupSummary.ignoreFormatter;
        }

        if (($.util.isBoolean(opts.enableGroupSummary) && opts.enableGroupSummary) || ($.isPlainObject(opts.enableGroupSummary) && opts.enableGroupSummary.enable)) {
            if (!$.isArray(opts.headerContextMenu)) {
                opts.headerContextMenu = [];
            }
            $.array.merge(opts.headerContextMenu, defaultMenus.groupSummaryMenus);
        }
        //合并columnOptions
        if (opts.frozenColumns) {
            $.each(opts.frozenColumns, function (ii, cc) {
                $.each(cc, function (i, c) {
                    $.union(c, $.fn.datagrid.extensions.columnOptions);
                });
            });
        }
        if (opts.columns) {
            $.each(opts.columns, function (ii, cc) {
                $.each(cc, function (i, c) {
                    $.union(c, $.fn.datagrid.extensions.columnOptions);
                });
            });
        }
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
                        $.parser.parseOptions(this), options);
            if (!isInited) { beforeInitialize(opts); }
            _datagrid.call(jq, opts, param);
            if (!isInited) {
                initializeExtensions(this);
            }
        });
    };
    $.union($.fn.datagrid, _datagrid);


    var columnOptions = {

        // 表示该列是否可分组，其值可以是 Boolean 类型；
        // 默认为 true。
        // 该属性用于在“列分组”时判定
        groupable: true,

        // 表示该列是否可计算，其值可以是 Boolean 类型；
        // 默认为 false。
        // 该属性用于在“汇总计算”时使用。
        calcable: false
    };
    if ($.fn.datagrid.extensions.columnOptions) {
        $.extend($.fn.datagrid.extensions.columnOptions, columnOptions);
    }
    else {
        $.fn.datagrid.extensions.columnOptions = columnOptions;
    }


    var defaults = {

        //  扩展 easyui-datagrid 的自定义属性，该属性表示是否启用分组汇总按钮菜单功能；该属性可以是以下两种数据类型：
        //      1、JSON-Object 类型值，表示分组汇总的参数，该对象类型参数包含如下属性：
        //              enable:      表示是否启用分组汇总按钮菜单功能，默认为 true ；
        //              mode:        表示要分组汇总的数据是本地数据还是远程数据，其值可以是 local、remote，默认为 local ；
        //              ignoreFormatter:     表示在统计时是否忽略 columns 中设置的 formatter 回调函数，默认为 true ；
        //                  注意，如果可计算的列（calcable:true）通过 formatter 后返回的值不是 number 类型，即使 ignoreFormatter 设置为 true，也将忽略该 formatter 效果。
        //      2、Boolean 类型值，表示是否启用分组汇总按钮菜单功能，默认为 false。 
        enableGroupSummary: true
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