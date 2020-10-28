var qrjduuid;
var contentjdId;
var didjd;

$(function () {
    $("#detailJD").textbox({
        onChange: function (newValue, oldValue) {
            if (event.ctrlKey == true && event.keyCode == 13) {
                if(newValue != null && newValue != '' && typeof newValue != 'undefined' ){
                    saveJDQR();
                }else {
                   layer.msg('情况说明为空！');
                   return;
                }
            }
        }
    });
    $("#detailJDHistory").textbox({
        onChange: function (newValue, oldValue) {
            var detail = $("#detailJD").textbox("getValue");
            if(detail != null && detail != '' && typeof detail != 'undefined'){
                layer.msg("修改时请先不要填写情况说明！");
                return;
            }
            if (event.ctrlKey == true && event.keyCode == 13) {
                if(newValue != null && newValue != '' && typeof newValue != 'undefined'){
                    saveJDQR();
                }else {
                    layer.msg('无法进行修改！');
                    return;
                }
            }
        }
    })
});

function editJDQR() {
    $('#detailJDHistory').textbox('textbox').attr('readonly', false);
    $("#detailJDHistory").textbox('textbox').css("color", "#000000");
    layer.msg('已打开编辑修改模式！');
    return;
}

function openJDQR(row) {
    qrjduuid = row.流水号id;
    var title = "流水号(" + row.流水号id + ")" + "-" + row.编码 + "-" + row.质量记录 + "-" + row.检查人 + "-" + row.工程名称 + "-" + row.项目名称 + "-" + row.日期;
    $("#operJDQRDialog").dialog({
        closed: false,
        modal: true,
        draggable: true,
        resizable: false,
        title: "质量记录明细-" + title,
        shadow: false,
        onClose: function () {
            datagrid_refresh(editor.getValue());
        },
    });
    $("#operJDQRDialog").parent().css("padding", "2");

    $("#JDQRAccordion").accordion({
        selected: 1
    });

    $('#JDQRTable').datagrid({
        method: "get",
        url: g_url_head + '/jdqrTable?hid=' + row.id + '&mid=' + row.流水号id,
        queryParams: {QRType: '', QRNumber: ''},
        idField: 'ccid',
        columns: [[
            {field: 'cid', title: 'cid', width: 50, align: 'center', hidden: true},
            {field: 'ccid', title: '序号', width: 50, align: 'center'},
            {
                field: 'content', title: '检查内容及要求', width: 180, align: 'left',
                formatter: function (value, row, index) {
                    return "<div class='textEllipsis_cloumnQRdetail'>" + value + "</div>";
                }
            },
            {field: 'ways', title: '检验方法', width: 90, align: 'center', hidden: true},
            {field: 'did', title: '详细内容Id', width: 90, align: 'center', hidden: true},
            {field: 'info', title: '是否合格', width: 90, align: 'center', hidden: true}
        ]],
        rowStyler: function (index, row) {
            if (typeof (row.info) == "undefined" || row.info == '') {
                return 'color:#2E8B57;';
            }
        },
        toolbar: "#QRJDTableSearch",
        singleSelect: true,
        fit: true,
        fitColumns: true,
        rownumbers: true,
        iconCls: 'icon-tip',
        pagination: true,// 如果为true，则在DataGrid控件底部显示分页工具栏。
        striped: true,// 是否显示斑马线效果。
        loading: true,//显示载入状态。
        loadMsg: '数据加载中...',// 在从远程站点加载数据的时候显示提示消息。
        pageNumber: 1,// 在设置分页属性的时候初始化页码。
        pageSize: 50,// 在设置分页属性的时候初始化页面大小。
        pageList: [20, 30, 50, 100, 150],//在设置分页属性的时候 初始化页面大小选择列表。
        onClickRow: function (index, row) {
            JDQRTableInfo(index, row);
        }
    });

    // 搜索按钮
    $("#standardJDQueryBtn").click(function () {
        $('#JDQRTable').datagrid('load', {
            QRContent: $("#JDQRContent").val(),
            QRWays: $("#JDQRWays").val(),
        });
    });

    // 重置按钮
    $('#btnJDReset').bind('click', function () {
        $("#JDQRContent").textbox('clear');
        $("#JDQRWays").textbox('clear');
        $("#standardJDQueryBtn").click();
    });

    // 按检查项目选择
    $('#JDQRTree1').tree({
        valueField: 'id',
        textField: 'text',
        loadMsg: '加载中，请稍后...',
        lines: true,
        url: g_url_head + '/qrTree?hid=' + row.id,
        animate: true,
        onClick: function (node) {
            $('#JDQRTable').datagrid('load', {
                QRType: node.text,
            });
        }
    });

    // 按序号选择
    $('#JDQRTree2').tree({
        valueField: 'id',
        textField: 'text',
        loadMsg: '加载中，请稍后...',
        lines: true,
        url: g_url_head + '/qrTreeNum?hid=' + row.id,
        animate: true,
        onClick: function (node) {
            $('#JDQRTable').datagrid('load', {
                QRNumber: node.text,
            });
        }
    });

    // 按是否填写选择
    $('#JDQRTree3').tree({
        valueField: 'id',
        textField: 'text',
        loadMsg: '加载中，请稍后...',
        lines: true,
        url: 'json/isFillin.json',
        animate: true,
        onClick: function (node) {
            // layer.msg("该功能测试中。。。");
            // return;
            $('#JDQRTable').datagrid('load', {
                QRIsFullin: node.text,
            });
        }
    });
}

function JDQRTableInfo(index, row) {
    $("#detailJD").textbox('setValue', '');
    contentjdId = row.cid;
    $.ajax({
        type: "post",
        url: g_url_head + '/chaxunQRInfo',
        dataType: 'json',
        data: {qruuid: qrjduuid, contentId: contentjdId},
        success: function (data) {
            if (data.success == 1) {
                didjd = data.did;
                if (data.info != null && data.info != '' && typeof data.info != 'undefined') {
                    $("#detailQRJD").textbox('setValue', data.info);
                    $("#detailQRJD").textbox('textbox').css("font-size", "14px");
                } else {
                    $("#detailQRJD").textbox('setValue', row.content);
                    $("#detailQRJD").textbox('textbox').css("font-size", "14px");
                }
                $("#detailJDHistory").textbox('setValue', data.detail);
                $('#detailJDHistory').textbox('textbox').attr('readonly', true);
                $("#detailJDHistory").textbox('textbox').css("color", "#8E8E8E");
                $('#qrJDUnCheckout').panel({title: '待检查项(绿:未填写--红:不合格--黑:正常)--该项<font color="#a52a2a">已填写</font>'});
            } else {
                didjd = '';
                $("#detailQRJD").textbox('setValue', row.content);
                $("#detailQRJD").textbox('textbox').css("font-size", "14px");
                $("#detailJDHistory").textbox('setValue', '');
                $('#detailJDHistory').textbox('textbox').attr('readonly', true);
                $("#detailJDHistory").textbox('textbox').css("color", "#8E8E8E");
                $('#qrJDUnCheckout').panel({title: '待检查项(绿:未填写--红:不合格--黑:正常)--该项<font color="#a52a2a">未填写</font>'});
            }
        }
    })
}

function saveJDQR() {
    // var isok = $("input[name='isok']:checked").val();
    var info = $("#detailQRJD").textbox("getValue");
    var today = new Date();
    today.setTime(today.getTime());
    var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var detail = $("#detailJD").textbox("getValue");
    if(detail != null && detail != '' && typeof detail != 'undefined'){
        detail += ' -- ' + date + ' -- ' + g_usernamec;
    }
    var detailHistory = $("#detailJDHistory").textbox("getValue");
    if (detailHistory == null || detailHistory == '') {
        detailHistory = detail;
    } else {
        if(detail != null && detail != '' && typeof detail != 'undefined'){
            detailHistory += '\n';
            detailHistory += detail;
        }
    }
    var content = $('#JDQRTable').datagrid('getSelected');
    if (detail == '' || detail == null || typeof detail == 'undefined') {
        layer.msg("未填写备注！");
        return;
    }
    if (info == '' || info == null || typeof info == 'undefined') {
        layer.msg("未填写检查内容？");
        return;
    }
    if (content == '' || content == null || typeof content == 'undefined') {
        layer.msg("请先选择待检查项");
        return;
    } else {
        var contentjdId = content.cid;
        var ccid = content.ccid;
    }
    $.ajax({
        type: "post",
        url: g_url_head + '/saveJDQR',
        dataType: 'json',
        data: {info: info, detail: detailHistory, qruuid: qrjduuid, contentId: contentjdId, did: didjd, endUsername:g_usernamec},
        success: function (data) {
            if (data.success == 1) {
                layer.msg("序号为" + ccid + "的质量记录填写成功！");
                var rowQR = $('#JDQRTable').datagrid('getSelected');
                JDQRTableInfo(1, rowQR);
                return;
            } else {
                layer.msg("序号为" + ccid + "的质量记录填写失败！");
                return;
            }
        }
    })
}

function cancelJDQR() {
    datagrid_refresh(editor.getValue());
    $("#operJDQRDialog").dialog("close");
}

// 质量记录详情
function lookJDQR(row) {
    var sql = "SELECT cid,序号,检查项目,检查内容及要求,检查内容,情况说明,最近检查人 FROM qr_质量记录详情 qr WHERE qr.流水号 = " + row.流水号id + " ORDER BY cid ASC";
    var title = "流水号(" + row.流水号id + ")" + "-" + row.编码 + "-" + row.质量记录 + "-" + row.检查人 + "-" + row.工程名称 + "-" + row.项目名称 + "-" + row.日期;
    executeJDQR(sql, title);
}

function executeJDQR(sql, title) {
    var exeSqlQR = sql;
    var initPageSize = 50;
    if ($.trim(exeSqlQR) === "") {
        layer.msg("暂时查询不到相关信息！");
        return false;
    }

    loadData(exeSqlQR, 1, initPageSize, function (r) {
        if (!r) {
            layer.msg("执行中止");
            return false;
        }
        if (r.success) {
            if (r.rows && r.rows != null) {
                $('#JDQRDetailTable').datagrid({
                    title: title,
                    rownumbers: true,
                    fit: true,
                    fitColumns: false,
                    singleSelect: true,
                    striped: true,
                    nowrap: true,
                    pagination: true,
                    pageList: [10, 20, 50, 100, 200],
                    loadMsg: "查询中，请稍后...",
                    pageNumber: 1,// 在设置分页属性的时候初始化页码。
                    pageSize: 50,// 在设置分页属性的时候初始化页面大小。
                    remoteSort: false,// 关闭服务器排序
                    // columns: r.column,
                    columns: [[
                        {field: '序号', title: '序号', width: 50, align: 'center'},
                        {field: '检查项目', title: '检查项目', width: 180, align: 'center'},
                        {
                            field: '检查内容及要求', title: '检查内容及要求', width: 280,
                            formatter: function (value, row, index) {
                                return "<div class='textEllipsis_cloumnQRdetail'>" + value + "</div>";
                            }
                        },
                        {
                            field: '检查内容', title: '检查内容', width: 280,
                            formatter: function (value, row, index) {
                                if(value != null && value != '' && typeof value != 'undefined'){
                                    return "<div class='textEllipsis_cloumndetail'>" + value + "</div>";
                                }else {
                                    return "";
                                }
                            }
                        },
                        {
                            field: '情况说明', title: '情况说明', width: 280,
                            formatter: function (value, row, index) {
                                if(value != null && value != '' && typeof value != 'undefined'){
                                    return "<div class='textEllipsis_cloumndetail'>" + value + "</div>";
                                }else {
                                    return "";
                                }
                            }
                        },
                        {field: '最近检查人', title: '最近检查人', width: 120, align: 'center'}
                    ]],
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
                var p = $('#JDQRDetailTable').datagrid('getPager');
                if (p) {
                    $(p).pagination({
                        beforePageText: '第',
                        afterPageText: '页 共 {pages}页',
                        total: r.total,
                        displayMsg: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 显示 {from}到{to} ,共 {total}条记录',
                        onSelectPage: function (page, pageSize) {
                            loadData(exeSqlQR, page, pageSize, function (r2) {
                                if (r2.success) {
                                    if (r2.rows && r2.rows != null) {
                                        var gridOpts = $('#JDQRDetailTable').datagrid('options');
                                        gridOpts.pageNumber = page;
                                        gridOpts.pageSize = pageSize;
                                        $('#JDQRDetailTable').datagrid('loadData', r2.rows);
                                        $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                            total: r2.total,
                                            pageNumber: page
                                        });
                                    }
                                }
                            });
                        },
                        onChangePageSize: function (pageSize) {
                            loadData(exeSqlQR, 1, pageSize, function (r2) {
                                if (r2.success) {
                                    if (r2.rows && r2.rows != null) {
                                        $('#JDQRDetailTable').datagrid('loadData', r2.rows);
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
                $('#JDQRDetailDiv').dialog({
                    title: "机电质量记录详情",
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
                $("#JDQRDetailDiv").dialog("open");
            }
        } else {
            layer.msg("暂时查询不到相关信息！");
        }
    });
};