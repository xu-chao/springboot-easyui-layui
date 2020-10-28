var qruuid;
var contentId;
var did;

$(function () {
    $("#detail").textbox({
        onChange: function (newValue, oldValue) {
            if (event.ctrlKey == true && event.keyCode == 13) {
                if(newValue != null && newValue != '' && typeof newValue != 'undefined' ){
                    saveQR();
                }else {
                   layer.msg('情况说明为空！');
                   return;
                }
            }
        }
    });
    $("#detailHistory").textbox({
        onChange: function (newValue, oldValue) {
            var detail = $("#detail").textbox("getValue");
            if(detail != null && detail != '' && typeof detail != 'undefined'){
                layer.msg("修改时请先不要填写情况说明！");
                return;
            }
            if (event.ctrlKey == true && event.keyCode == 13) {
                if(newValue != null && newValue != '' && typeof newValue != 'undefined'){
                    saveQR();
                }else {
                    layer.msg('无法进行修改！');
                    return;
                }
            }
        }
    })
});

function showQR(row) {
    if(row.部门 == 'AVCL'){
        openQR(row);
    }else if(row.部门 == 'JD'){
        openJDQR(row);
    }else {
        layer.msg('该质量记录不属于任何一个部门！');
        return;
    }
}

function seeQR(row) {
    if(row.部门 == 'AVCL'){
        lookQR(row);
    }else if(row.部门 == 'JD'){
        lookJDQR(row);
    }else {
        layer.msg('该质量记录不属于任何一个部门！');
        return;
    }
}

function editQR() {
    $('#detailHistory').textbox('textbox').attr('readonly', false);
    $("#detailHistory").textbox('textbox').css("color", "#000000");
    layer.msg('已打开编辑修改模式！');
    return;
}

function openQR(row) {
    qruuid = row.流水号id;
    var title = "流水号(" + row.流水号id + ")" + "-" + row.编码 + "-" + row.质量记录 + "-" + row.检查人 + "-" + row.工程名称 + "-" + row.项目名称 + "-" + row.日期;
    $("#operQRDialog").dialog({
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
    $("#operQRDialog").parent().css("padding", "2");

    $("#QRAccordion").accordion({
        selected: 1
    });

    $('#QRTable').datagrid({
        method: "get",
        url: g_url_head + '/qrTable?hid=' + row.id + '&mid=' + row.流水号id,
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
            {field: 'ways', title: '检验方法', width: 90, align: 'center'},
            {field: 'did', title: '详细内容Id', width: 90, align: 'center', hidden: true},
            {field: 'isok', title: '是否合格', width: 90, align: 'center', hidden: true}
        ]],
        rowStyler: function (index, row) {
            if (typeof (row.isok) == "undefined" || row.isok == '') {
                // return 'background-color:#ADFEDC;';
                return 'color:#2E8B57;';
            } else if (row.isok == '不合格') {
                // return 'background-color:#f05b72;';
                return 'color:#f05b72;';

            }
        },
        toolbar: "#QRTableSearch",
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
            QRTableInfo(index, row);
        }
    });

    // 搜索按钮
    $("#standardQueryBtn").click(function () {
        $('#QRTable').datagrid('load', {
            QRContent: $("#QRContent").val(),
            QRWays: $("#QRWays").val(),
        });
    });

    // 重置按钮
    $('#btnReset').bind('click', function () {
        $("#QRContent").textbox('clear');
        $("#QRWays").textbox('clear');
        $("#standardQueryBtn").click();
    });

    // 按检查项目选择
    $('#QRTree1').tree({
        valueField: 'id',
        textField: 'text',
        loadMsg: '加载中，请稍后...',
        lines: true,
        url: g_url_head + '/qrTree?hid=' + row.id,
        animate: true,
        onClick: function (node) {
            $('#QRTable').datagrid('load', {
                QRType: node.text,
            });
        }
    });

    // 按序号选择
    $('#QRTree2').tree({
        valueField: 'id',
        textField: 'text',
        loadMsg: '加载中，请稍后...',
        lines: true,
        url: g_url_head + '/qrTreeNum?hid=' + row.id,
        animate: true,
        onClick: function (node) {
            $('#QRTable').datagrid('load', {
                QRNumber: node.text,
            });
        }
    });

    // 按是否填写选择
    $('#QRTree3').tree({
        valueField: 'id',
        textField: 'text',
        loadMsg: '加载中，请稍后...',
        lines: true,
        url: 'json/isFillin.json',
        animate: true,
        onClick: function (node) {
            // layer.msg("该功能测试中。。。");
            // return;
            $('#QRTable').datagrid('load', {
                QRIsFullin: node.text,
            });
        }
    });
}

function QRTableInfo(index, row) {
    $("#detail").textbox('setValue', '');
    contentId = row.cid;
    $.ajax({
        type: "post",
        url: g_url_head + '/chaxunQRDetail',
        dataType: 'json',
        data: {qruuid: qruuid, contentId: contentId},
        success: function (data) {
            if (data.success == 1) {
                did = data.did;
                if (data.isok == "合格") {
                    $("input[name='isok'][value='合格']").prop("checked", true);
                } else if (data.isok == "不合格") {
                    $("input[name='isok'][value='不合格']").prop("checked", true);
                }
                $("#detailHistory").textbox('setValue', data.detail);
                $('#detailHistory').textbox('textbox').attr('readonly', true);
                $("#detailHistory").textbox('textbox').css("color", "#8E8E8E");
                $('#qrUnCheckout').panel({title: '待检查项(绿:未填写--红:不合格--黑:正常)--该项<font color="#a52a2a">已填写</font>'});
                $('#qrCheckout').panel({title: '已检查项--该项<font color="#a52a2a">' + data.isok + '</font>'});
            } else {
                did = '';
                $("input[name='isok'][value='合格']").prop("checked", true);
                $("#detailHistory").textbox('setValue', '');
                $('#detailHistory').textbox('textbox').attr('readonly', true);
                $("#detailHistory").textbox('textbox').css("color", "#8E8E8E");
                $('#qrUnCheckout').panel({title: '待检查项(绿:未填写--红:不合格--黑:正常)--该项<font color="#a52a2a">未填写</font>'});
                $('#qrCheckout').panel({title: '已检查项--该项<font color="#a52a2a">默认合格</font>'});
            }
        }
    })
}

function saveQR() {
    var isok = $("input[name='isok']:checked").val();
    var today = new Date();
    today.setTime(today.getTime());
    var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var detail = $("#detail").textbox("getValue");
    if(detail != null && detail != '' && typeof detail != 'undefined'){
        detail += ' -- ' + date + ' -- ' + g_usernamec;
    }
    var detailHistory = $("#detailHistory").textbox("getValue");
    if (detailHistory == null || detailHistory == '') {
        detailHistory = detail;
    } else {
        if(detail != null && detail != '' && typeof detail != 'undefined'){
            detailHistory += '\n';
            detailHistory += detail;
        }
    }
    var content = $('#QRTable').datagrid('getSelected');
    if (detail == '' || detail == null || typeof detail == 'undefined') {
        layer.msg("未填写备注！");
        return;
    }
    if (isok == '' || isok == null || typeof isok == 'undefined') {
        layer.msg("请先判断是否合格？");
        return;
    }
    if (content == '' || content == null || typeof content == 'undefined') {
        layer.msg("请先选择待检查项");
        return;
    } else {
        var contentId = content.cid;
        var ccid = content.ccid;
    }
    $.ajax({
        type: "post",
        url: g_url_head + '/saveQR',
        dataType: 'json',
        data: {isok: isok, detail: detailHistory, qruuid: qruuid, contentId: contentId, did: did, endUsername:g_usernamec},
        success: function (data) {
            if (data.success == 1) {
                layer.msg("序号为" + ccid + "的质量记录填写成功！");
                var rowQR = $('#QRTable').datagrid('getSelected');
                QRTableInfo(1, rowQR);
                return;
            } else {
                layer.msg("序号为" + ccid + "的质量记录填写失败！");
                return;
            }
        }
    })
}

function cancelQR() {
    datagrid_refresh(editor.getValue());
    $("#operQRDialog").dialog("close");
}

// 质量记录详情
function lookQR(row) {
    var sql = "SELECT 序号,检查项目,检查内容及要求,检验方法,检验结果,情况说明,最近检查人 FROM qr_质量记录详情 qr WHERE qr.流水号 = " + row.流水号id + " ORDER BY 序号 ASC";
    var title = "流水号(" + row.流水号id + ")" + "-" + row.编码 + "-" + row.质量记录 + "-" + row.检查人 + "-" + row.工程名称 + "-" + row.项目名称 + "-" + row.日期;
    executeQR(sql, title);
}

function executeQR(sql, title) {
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
                $('#QRDetailTable').datagrid({
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
                            field: '检查内容及要求', title: '检查内容及要求', width: 280, align: 'center',
                            formatter: function (value, row, index) {
                                return "<div class='textEllipsis_cloumnQRdetail'>" + value + "</div>";
                            }
                        },
                        {field: '检验方法', title: '检验方法', width: 120, align: 'center'},
                        {field: '检验结果', title: '检验结果', width: 120, align: 'center'},
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
                var p = $('#QRDetailTable').datagrid('getPager');
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
                                        var gridOpts = $('#QRDetailTable').datagrid('options');
                                        gridOpts.pageNumber = page;
                                        gridOpts.pageSize = pageSize;
                                        $('#QRDetailTable').datagrid('loadData', r2.rows);
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
                                        $('#QRDetailTable').datagrid('loadData', r2.rows);
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
                $('#QRDetailDiv').dialog({
                    title: "质量记录详情",
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
                $("#QRDetailDiv").dialog("open");
            }
        } else {
            layer.msg("暂时查询不到相关信息！");
        }
    });
};

// 申请质量记录填写
var hid;
var qrName;

function applyQR(row) {
    hid = row.id;
    qrName = row.质量记录名称;
    if (hid == '' || hid == null || typeof hid == 'undefined') {
        layer.msg("请先选择需要申请的质量记录！");
        return;
    }
    $('#applyQRPark').combobox(
        {
            disabled: false,
            method: 'GET',
            url: g_url_head + '/configureFunc?id=6',
            prompt: '请填入公园名称',
            valueField: 'id',
            textField: 'name',
            panelHeight: 'auto',
            panelMaxHeight: 150,
            editable: true,
            onLoadSuccess: function () {
                var data = $("#applyQRPark").combobox('getData');
                if (data.length > 0) {
                    $("#applyQRPark").combobox('select', data[0].name);
                }
            },
            onSelect: function (record) {
                var id = record.id;
                $('#applyQRProject').combobox({
                    disabled: false,
                    method: 'GET',
                    url: g_url_head + '/configureSecond?id=7&foreign=' + id,
                    prompt: '请先填入公园名称',
                    valueField: 'id',
                    textField: 'name',
                    panelHeight: 'auto',
                    panelMaxHeight: 150,
                    editable: true,
                    onLoadSuccess: function () {
                        var val = $(this).combobox('getData');
                        for (var item in val[0]) {
                            if (item == "name") {
                                $(this).combobox("select", val[0][item]);
                            }
                        }
                    },
                }).combobox("clear");
            }
        });
    $("#applyQRDialog").dialog("open");
}

function applyBtnOk() {
    var parkname = $('#applyQRPark').combobox('getText');
    var projectname = $('#applyQRProject').combobox('getText');
    if (parkname == '' || parkname == null || typeof parkname == 'undefined') {
        layer.msg("工程名称未填写！");
        return;
    }
    if (projectname == '' || projectname == null || typeof projectname == 'undefined') {
        layer.msg("项目名称未填写！");
        return;
    }
    layer.confirm('&nbsp;&nbsp;&nbsp;是否填写「' + parkname + '--' + projectname + '--' + qrName + '」质量记录？', {
        closeBtn: 0,
        btn: ['是', '取消']
    }, function () {
        layer.closeAll();
        $.ajax({
            type: "post",
            url: g_url_head + '/insertQR',
            dataType: 'json',
            data: {
                parkname: parkname,
                projectname: projectname,
                username: g_usernamec,
                hid: hid,
            },
            success: function (data) {
                if (data.success == 1) {
                    layer.msg('「' + parkname + '--' + projectname + '--' + qrName + '」质量记录申请成功！');
                    editor.setValue("select * from qr_质量记录填写 WHERE 流水号id = '" + data.mid + "'");
                    $("#execute").click();
                    applyBtnCancel();
                    return;
                } else {
                    layer.msg('「' + parkname + '--' + projectname + '--' + qrName + '」质量记录申请失败！');
                    return;
                }
            }
        })
    });
}

function applyBtnCancel() {
    $("#applyQRPark").combo('setText', '');
    $("#applyQRPark").combo('setValue', '');
    $("#applyQRProject").combo('setText', '');
    $("#applyQRProject").combo('setValue', '');
    $("#applyQRDialog").dialog("close");
}