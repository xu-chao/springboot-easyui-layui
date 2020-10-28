function openReportProjector(row) {
    var sql;
    var title;
    var park;
    var project;
    var date;
    var flag;
    if(row.故障表名 == 'log_projector_fault'){
        sql = "select 网络地址,灯泡使用时间,风扇报警,灯泡报警,温度报警,盖板报警,过滤网报警,其他报警,故障表名 from "+ row.故障表名 +" where 公园名称 = '" + row.公园名称 + "' AND 项目名称 = '" + row.项目名称 + "' AND 日期 = '" + row.日期 + "'";
        title = row.公园名称 + "-" + row.项目名称 + "-" + row.日期 + "-" + row.品牌;
        park = row.公园名称;
        project = row.项目名称;
        date = row.日期;
        flag = row.故障表名;
        executeProjector(sql, title, park, project, date, flag);
    }else {
        layer.msg("此视图暂无双击功能！");
    }
}

function executeProjector(sql, title, park, project, date, flag) {
    var exeSql = sql;
    var initPageSize = 50;
    if ($.trim(exeSql) === "") {
        layer.msg("暂时查询不到相关信息！");
        return false;
    }

    var chartProjectorMenu = switchChartProjectorMenu(flag, park, project, date);

    loadData(exeSql, 1, initPageSize, function (r) {
        if (!r) {
            layer.msg("执行中止");
            return false;
        }
        if (r.success) {
            if (r.rows && r.rows != null) {
                $('#reportProjectorData').datagrid({
                    title: title + "-全部投影IP",
                    rownumbers: true,
                    fit: true,
                    fitColumns: false,
                    singleSelect: true,
                    striped: true,
                    pagination: true,
                    pageList: [10, 20, 50, 100, 200],
                    loadMsg: "查询中，请稍后...",
                    pageNumber: 1,// 在设置分页属性的时候初始化页码。
                    pageSize: 50,// 在设置分页属性的时候初始化页面大小。
                    remoteSort: false,// 关闭服务器排序
                    columns: r.column,
                    data: r,
                    enableRowContextMenu: true,
                    selectOnRowContextMenu: true,
                    refreshMenu: false,
                    pagingMenu: false,
                    rowContextMenu: chartProjectorMenu,
                    enableHeaderClickMenu: false,
                    enableGroupSummary: {enable: true, mode: "local", ignoreFormatter: false},
                    rowTooltip: false,
                    cache: false,
                    // onDblClickRow: function (rowIndex, rowData) {
                    //     onDblClickProjectorReport(rowIndex, rowData);
                    // }
                });
                var p = $('#reportProjectorData').datagrid('getPager');
                if (p) {
                    $(p).pagination({
                        beforePageText: '第',
                        afterPageText: '页 共 {pages}页',
                        total: r.total,
                        displayMsg: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 显示 {from}到{to} ,共 {total}条记录',
                        onSelectPage: function (page, pageSize) {
                            loadData(exeSql, page, pageSize, function (r2) {
                                if (r2.success) {
                                    if (r2.rows && r2.rows != null) {
                                        var gridOpts = $('#reportProjectorData').datagrid('options');
                                        gridOpts.pageNumber = page;
                                        gridOpts.pageSize = pageSize;
                                        $('#reportProjectorData').datagrid('loadData', r2.rows);
                                        $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                            total: r2.total,
                                            pageNumber: page
                                        });
                                    }
                                }
                            });
                        },
                        onChangePageSize: function (pageSize) {
                            loadData(exeSql, 1, pageSize, function (r2) {
                                if (r2.success) {
                                    if (r2.rows && r2.rows != null) {
                                        $('#reportProjectorData').datagrid('loadData', r2.rows);
                                        $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                            total: r2.total,
                                            pageNumber: 1
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
                $('#reportProjector').dialog({
                    title: "投影故障详细信息",
                    width: $(window).width() - 40,
                    height: $(window).height() - 40,
                    closed: true,//显示对话框
                    modal: true,
                    closable: true,
                    resizable: true,
                    onClose: function () {
                        datagrid_refresh(editor.getValue());
                    },
                }).dialog("center");
                $("#reportProjector").dialog("open");
            }
        } else {
            layer.msg("暂时查询不到相关信息！");
        }
    });

    // function onDblClickProjectorReport(rowIndex, rowData) {
    //     $('#reportProjectorChart').dialog({
    //         title: title,
    //         width: $(window).width() - 40,
    //         height: $(window).height() - 40,
    //         closed: true,//显示对话框
    //         modal: true,
    //         closable: true,
    //         resizable: true
    //     }).dialog("center");
    //     var sqlChart = switchReport(rowData);
    //     if(sqlChart == ''){
    //         layer.msg("暂无图表详情！");
    //         return;
    //     }else {
    //         loadData(sqlChart, 1, 200, function (r) {
    //             if(sqlChart == ''){
    //                 layer.msg('暂时查询不到详细故障信息！');
    //                 return;
    //             }else if(r.rows.length === 0){
    //                 layer.confirm('该场次超时，暂时无法查询到故障详细信息！', {
    //                     closeBtn: 0,//不显示关闭按钮
    //                     btn: ['确认'] //按钮
    //                 }, function () {
    //                     layer.close(layer.index);
    //                 });
    //             }else {
    //                 $('#reportProjectorChart').dialog({
    //                     closed: false,//显示对话框
    //                     onClose: function () {
    //                         r = [];
    //                     },
    //                 }).dialog("center");
    //                 logline(title, rowData.故障设备编号, r.rows, date);
    //             }
    //         });
    //     }
    // }
    //
    // var logline = function (title, name, r, date) {
    //     var logChart = echarts.init(document.getElementById('reportProjectorChartData'));
    //     var option = {
    //         title: {
    //             text: name,
    //             subtext: '依据故障信息时间生成',
    //             left:'center'
    //         },
    //         legend: {
    //             data: name
    //         },
    //         grid: {
    //             left: '15%'
    //         },
    //         tooltip: {
    //             trigger: 'axis',
    //             axisPointer: {
    //                 type: 'cross'
    //             },
    //             formatter: function (params, ticket, callback) {
    //                 var htmlStr = '';
    //                 var valMap = {};
    //                 for (var i = 0; i < params.length; i++) {
    //                     var param = params[i];
    //                     var xName = param.name; //x轴的名称
    //                     var seriesName = param.seriesName; //图例名称
    //                     var value = param.value; //y轴值
    //                     var color = param.color; //图例颜色
    //                     //过滤无效值
    //                     if (value == '') {
    //                         continue;
    //                     }
    //                     //过滤重叠值
    //                     if (valMap[seriesName] == value) {
    //                         continue;
    //                     }
    //                     htmlStr += '<font color="#fff143"><b>' + seriesName + '</b></font><br/>';
    //                     htmlStr += '<div>';
    //                     //为了保证和原来的效果一样，这里自己实现了一个点的效果
    //                     htmlStr += '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' + color + ';"></span>';
    //                     //圆点后面显示的文本
    //                     htmlStr += xName + '：<font color="#ef7a82"><b>' + value + '</b></font><br />';
    //                     htmlStr += '</div>';
    //                     valMap[seriesName] = value;
    //                 }
    //                 return htmlStr;
    //             }
    //         },
    //         toolbox: {
    //             show: true,
    //             feature: {
    //                 saveAsImage: {
    //                     title: '保存',
    //                     name: 'LOG日志故障'
    //                 }
    //             }
    //         },
    //         xAxis: {
    //             type: 'time',
    //             boundaryGap: false,
    //             splitLine: {
    //                 show: false
    //             },
    //         },
    //         yAxis: {
    //             type: 'category',
    //             data: logy(r),
    //             axisLabel: {
    //                 formatter: function(value) {
    //                     if (value.length > 8) {
    //                         return value.substring(0, 8) + "...";
    //                     } else {
    //                         return value;
    //                     }
    //                 }
    //
    //             },
    //             axisPointer: {
    //                 snap: true
    //             }
    //         },
    //         dataZoom: [
    //             {
    //                 type: 'inside', //鼠标滚轮
    //                 realtime: true,
    //             },
    //         ],
    //         series: [{
    //             name: name,
    //             type: 'line',
    //             smooth: false,
    //             symbol: 'circle', //折线点设置为实心点
    //             symbolSize: 4, //折线点的大小,
    //             itemStyle: {
    //                 normal: {
    //                     lineStyle: {
    //                         width: 3,
    //                         color:'#ff8b2b'
    //                     }
    //                 }
    //             },
    //             data: logSeries(r,date),
    //         }
    //         ]
    //     };
    //     logChart.setOption(option, true);
    //     window.addEventListener("resize", function () {
    //         logChart.resize();
    //     });
    //
    // }
    //
    // function logy(row) {
    //     var logy = [];
    //     $.each(row, function (key, values) {
    //         var obj = new Object();
    //         obj.value = values.故障信息;
    //         logy.push(obj);
    //     });
    //     return logy;
    // }
    //
    // function logSeries(row) {
    //     var logSeries = [];
    //     $.each(row, function (key, values) {
    //         var obj = new Object();
    //         obj.value = date + ' ' + values.故障开始时间;
    //         logSeries.push(obj);
    //     });
    //     return logSeries;
    // }

    function switchProjectorReport(rowData, park, project, date) {
        var sql = '';
        switch(rowData.故障表名) {
            case "log_projector_fault_info" :
                sql = "SELECT * FROM " + rowData.故障表名 + " WHERE 公园名称 = '" + park + "' AND 项目名称 = '" + project + "' AND 日期 = '" + date + "' AND 网络地址 = '" + rowData.网络地址 + "' AND 分类 = 'WARNING' ORDER BY 时间 ASC";
                break;
            default:
                sql = "";
        }
        return sql;
    }

    function switchChartProjectorMenu(flag, park, project) {
        var menu = [];
        switch(flag) {
            case "log_projector_fault" :
                menu.push({
                    iconCls: 'icon-more', text: "更多信息",
                    handler: function (e, item, menu, grid, rowIndex, row) {
                        $('#reportProjectorDetail').dialog({
                            title: "原始故障详细信息",
                            width: $(window).width() - 40,
                            height: $(window).height() - 40,
                            closed: true,//显示对话框
                            modal: true,
                            closable: true,
                            resizable: true,
                            onClose: function () {
                                datagrid_refresh(editor.getValue());
                            },
                        }).dialog("center");
                        var sqlMore = switchProjectorReport(row, park, project, date);
                        loadData(sqlMore, 1, initPageSize, function (r) {
                            if (!r) {
                                layer.msg("执行中止");
                                return false;
                            }
                            if (r.success) {
                                if(r.rows.length === 0){
                                    layer.confirm('该场次超时，暂时无法查询到故障详细信息！', {
                                        closeBtn: 0,//不显示关闭按钮
                                        btn: ['确认'] //按钮
                                    }, function () {
                                        layer.close(layer.index);
                                    });
                                    return;
                                }else if (r.rows && r.rows != null) {
                                    $('#reportProjectorDetail').dialog("open");
                                    $('#reportProjectorDetailData').datagrid({
                                        title: title + "-" + row.网络地址,
                                        rownumbers: true,
                                        fit: true,
                                        fitColumns: false,
                                        singleSelect: true,
                                        striped: true,
                                        pagination: true,
                                        pageList: [10, 20, 50, 100, 200],
                                        loadMsg: "查询中，请稍后...",
                                        pageNumber: 1,// 在设置分页属性的时候初始化页码。
                                        pageSize: 50,// 在设置分页属性的时候初始化页面大小。
                                        remoteSort: false,// 关闭服务器排序
                                        columns: r.column,
                                        data: r,
                                        enableRowContextMenu: true,
                                        selectOnRowContextMenu: true,
                                        refreshMenu: false,
                                        pagingMenu: false,
                                        enableHeaderClickMenu: false,
                                        enableGroupSummary: {enable: true, mode: "local", ignoreFormatter: false},
                                        rowTooltip: false,
                                        cache: false,
                                    });
                                    var p = $('#reportProjectorDetailData').datagrid('getPager');
                                    if (p) {
                                        $(p).pagination({
                                            beforePageText: '第',
                                            afterPageText: '页 共 {pages}页',
                                            total: r.total,
                                            displayMsg: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 显示 {from}到{to} ,共 {total}条记录',
                                            onSelectPage: function (page, pageSize) {
                                                loadData(exeSql, page, pageSize, function (r2) {
                                                    if (r2.success) {
                                                        if (r2.rows && r2.rows != null) {
                                                            var gridOpts = $('#reportProjectorDetailData').datagrid('options');
                                                            gridOpts.pageNumber = page;
                                                            gridOpts.pageSize = pageSize;
                                                            $('#reportProjectorDetailData').datagrid('loadData', r2.rows);
                                                            $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                                                total: r2.total,
                                                                pageNumber: page
                                                            });
                                                        }
                                                    }
                                                });
                                            },
                                            onChangePageSize: function (pageSize) {
                                                loadData(exeSql, 1, pageSize, function (r2) {
                                                    if (r2.success) {
                                                        if (r2.rows && r2.rows != null) {
                                                            $('#reportProjectorDetailData').datagrid('loadData', r2.rows);
                                                            $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                                                total: r2.total,
                                                                pageNumber: 1
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            } else {
                                layer.msg("暂时查询不到相关信息！");
                            }
                        });
                    }
                });
                break;
        }
        return menu;
    }
};
