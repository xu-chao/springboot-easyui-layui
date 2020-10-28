function openReport(row) {
    var sql;
    var title;
    var date;
    var flag;
    if(row.故障表名 == 'log_fault_report'){
        if(row.网络地址 != ' ' && typeof row.网络地址 != 'undefined' && row.网络地址 != ''){
            sql = "select 故障场次编号,故障设备编号,故障场次开始时间,故障场次结束时间,故障表名,故障场次运行时间 from "+ row.故障表名 +" where 公园名称 = '" + row.公园名称 + "' AND 项目名称 = '" + row.项目名称 + "' AND 设备类型 = '" + row.设备类型 + "' AND 日期 = '" + row.日期 + "' AND 故障设备编号 = '" + row.网络地址 + "' order by 故障场次开始时间 ASC";
        }else {
            sql = "select 故障场次编号,故障设备编号,故障场次开始时间,故障场次结束时间,故障表名,故障场次运行时间 from "+ row.故障表名 +" where 公园名称 = '" + row.公园名称 + "' AND 项目名称 = '" + row.项目名称 + "' AND 设备类型 = '" + row.设备类型 + "' AND 日期 = '" + row.日期 + "' order by 故障场次开始时间 ASC";
        }
        title = row.公园名称 + "-" + row.项目名称 + "-" + row.设备类型 + "-" + row.日期;
        date = row.日期;
        flag = row.故障表名;
        execute(sql, title, date, flag);
    } else {
        layer.msg("此视图暂无双击功能！");
    }
}

function execute(sql, title, date, flag) {
    var exeSql = sql;
    var initPageSize = 50;
    if ($.trim(exeSql) === "") {
        layer.msg("暂时查询不到相关信息！");
        return false;
    }

    var chartMenu = switchChartMenu(flag);

    loadData(exeSql, 1, initPageSize, function (r) {
        if (!r) {
            layer.msg("执行中止");
            return false;
        }
        if (r.success) {
            if (r.rows && r.rows != null) {
                $('#reportData').datagrid({
                    title: title,
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
                    rowContextMenu: chartMenu,
                    enableHeaderClickMenu: false,
                    enableGroupSummary: {enable: true, mode: "local", ignoreFormatter: false},
                    rowTooltip: false,
                    cache: false,
                    onDblClickRow: function (rowIndex, rowData) {
                        onDblClickReport(rowIndex, rowData);
                    }
                });
                var p = $('#reportData').datagrid('getPager');
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
                                        var gridOpts = $('#reportData').datagrid('options');
                                        gridOpts.pageNumber = page;
                                        gridOpts.pageSize = pageSize;
                                        $('#reportData').datagrid('loadData', r2.rows);
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
                                        $('#reportData').datagrid('loadData', r2.rows);
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
                $('#report').dialog({
                    closed: false,//显示对话框
                    modal: true,
                    closable: true,
                    resizable: true,
                    onClose: function () {
                        datagrid_refresh(editor.getValue());
                    },
                }).dialog("center");
            }
        } else {
            layer.msg("暂时查询不到相关信息！");
        }
    });

    function onDblClickReport(rowIndex, rowData) {
        $('#reportChart').dialog({
            title: title,
            width: $(window).width() - 40,
            height: $(window).height() - 40,
            closed: true,//显示对话框
            modal: true,
            closable: true,
            resizable: true,
        }).dialog("center");
        var sqlChart = switchReport(rowData);
        if(sqlChart == ''){
            layer.msg("暂无图表详情！");
            return;
        }else if(rowData.故障表名 == 'log_cig_fault'){
            layer.msg("CIG报表暂无图表详情！");
            return;
        }else {
            loadData(sqlChart, 1, 200, function (r) {
                if(sqlChart == ''){
                    layer.msg('暂时查询不到详细故障信息！');
                    return;
                }else if(r.rows.length === 0){
                    layer.confirm('该场次超时，暂时无法查询到故障详细信息！', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                    });
                }else {
                    $('#reportChart').dialog({
                        closed: false,//显示对话框
                        onClose: function () {
                            r = [];
                            datagrid_refresh(editor.getValue());
                        },
                    }).dialog("center");
                    logline(title, rowData.故障设备编号, r.rows, date);
                }
            });
        }
    }

    var logline = function (title, name, r, date) {
        var logChart = echarts.init(document.getElementById('reportChartData'));
        var option = {
            title: {
                text: name,
                subtext: '依据故障信息时间生成',
                left:'center'
            },
            legend: {
                data: name
            },
            grid: {
                left: '15%'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (params, ticket, callback) {
                    var htmlStr = '';
                    var valMap = {};
                    for (var i = 0; i < params.length; i++) {
                        var param = params[i];
                        var xName = param.name; //x轴的名称
                        var seriesName = param.seriesName; //图例名称
                        var value = param.value; //y轴值
                        var color = param.color; //图例颜色
                        //过滤无效值
                        if (value == '') {
                            continue;
                        }
                        //过滤重叠值
                        if (valMap[seriesName] == value) {
                            continue;
                        }
                        htmlStr += '<font color="#fff143"><b>' + seriesName + '</b></font><br/>';
                        htmlStr += '<div>';
                        //为了保证和原来的效果一样，这里自己实现了一个点的效果
                        htmlStr += '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' + color + ';"></span>';
                        //圆点后面显示的文本
                        htmlStr += xName + '：<font color="#ef7a82"><b>' + value + '</b></font><br />';
                        htmlStr += '</div>';
                        valMap[seriesName] = value;
                    }
                    return htmlStr;
                }
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {
                        title: '保存',
                        name: 'LOG日志故障'
                    }
                }
            },
            xAxis: {
                type: 'time',
                boundaryGap: false,
                splitLine: {
                    show: false
                },
            },
            yAxis: {
                type: 'category',
                data: logy(r),
                axisLabel: {
                    formatter: function(value) {
                        if (value.length > 8) {
                            return value.substring(0, 8) + "...";
                        } else {
                            return value;
                        }
                    }

                },
                axisPointer: {
                    snap: true
                }
            },
            dataZoom: [
                {
                    type: 'inside', //鼠标滚轮
                    realtime: true,
                },
            ],
            series: [{
                name: name,
                type: 'line',
                smooth: false,
                symbol: 'circle', //折线点设置为实心点
                symbolSize: 4, //折线点的大小,
                itemStyle: {
                    normal: {
                        lineStyle: {
                            width: 3,
                            color:'#ff8b2b'
                        }
                    }
                },
                data: logSeries(r,date),
            }
            ]
        };
        logChart.setOption(option, true);
        window.addEventListener("resize", function () {
            logChart.resize();
        });

    }

    function logy(row) {
        var logy = [];
        $.each(row, function (key, values) {
            var obj = new Object();
            obj.value = values.故障信息;
            logy.push(obj);
        });
        return logy;
    }

    function logSeries(row) {
        var logSeries = [];
        $.each(row, function (key, values) {
            var obj = new Object();
            obj.value = date + ' ' + values.故障开始时间;
            logSeries.push(obj);
        });
        return logSeries;
    }

    function switchReport(rowData) {
        var sql = '';
        switch(rowData.故障表名) {
            case "log_device_fault" :
                sql = "SELECT * FROM " + rowData.故障表名 + " WHERE \"故障场次编号\" = '" + rowData.故障场次编号 + "' ORDER BY 故障开始时间 ASC";
                break;
            case "log_cig_fault" :
                sql = "SELECT * FROM " + rowData.故障表名 + " WHERE \"播放场次编号\" = '" + rowData.故障场次编号 + "' ORDER BY 故障时间 ASC";
                break;
            default:
                sql = '';
        }
        return sql;
    }

    function switchChartMenu(flag) {
        var menu = [];
        switch(flag) {
            case "log_fault_report" :
                menu.push({
                    iconCls: 'icon-more', text: "更多信息",
                    handler: function (e, item, menu, grid, rowIndex, row) {
                        $('#reportDetail').dialog({
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
                        var sqlMore = switchReport(row);
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
                                    $('#reportDetail').dialog("open");
                                    $('#reportDetailData').datagrid({
                                        title: title,
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
                                    var p = $('#reportDetailData').datagrid('getPager');
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
                                                            var gridOpts = $('#reportDetailData').datagrid('options');
                                                            gridOpts.pageNumber = page;
                                                            gridOpts.pageSize = pageSize;
                                                            $('#reportDetailData').datagrid('loadData', r2.rows);
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
                                                            $('#reportDetailData').datagrid('loadData', r2.rows);
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
            // default:
            //     chartMenu = '';
        }
        return menu;
    }

};

