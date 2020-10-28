var gpeditIndexs = undefined;//表格标识
var gpeditIndexFlag = true;//是否可删除标识
var gpahead_id = null;//是否可删除标识
var gpFlag = 0;//采购流程
//酒店物料查看 开启窗口动作
function openGoodsPurcharseSBefore(row) {
    $("#submitGpS").hide();
    $("#gparrivediv").hide();
    var datalong = 2;
    $.ajax({
        type: "GET",
        url: g_url_head + '/configureAjax',//读取函数
        data: {id: 28, foreign: "goods_arrive_date_set"},
        dataType: "json",
        async: false,
        success: function (r) {
            if (r.length == 0) {
            } else {
                datalong = r[0].notice;
                datalong = parseInt(datalong);
                if ((datalong == null) || (datalong == "")) {
                    datalong = 2;
                }
            }
        }
    })
    $('#gparrive_dates').datebox().datebox('calendar').calendar({
        validator: function (date) {
            var now = new Date();
            var d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - datalong);
            return d2 <= date && date <= d1;
        }
    });
    $('#goods_suppliers').combobox({
        disabled: false,
        method: 'GET',
        url: g_url_head + '/configureAjax?id=55',
        valueField: 'supplier_name',
        textField: 'supplier_name',
        panelHeight: '200',
        panelMaxHeight: 250,
        editable: true,
        onHidePanel: function () {
            var _options = $(this).combobox('options');
            var _data = $(this).combobox('getData');/* 下拉框所有选项 */
            var _value = $(this).combobox('getValue');/* 用户输入的值 */
            var _b = false;/* 标识是否在下拉列表中找到了用户输入的字符 */
            for (var i = 0; i < _data.length; i++) {
                if (_data[i][_options.valueField] == _value) {
                    _b = true;
                    break;
                }
            }
            if (!_b) {
                $(this).combobox('setValue', '');
            }
        },
        onLoadSuccess: function (data) {
            // var data = $(this).combobox("getData");
            // if (data && data.length > 0) {
            //     $(this).combobox("setValue", data[0].com_name);
            // }
        }
    });
    var gpsystem_nos = null;

    //如果 row有值
    if (row) {
        gpsystem_nos = row.系统单号;
        $('#gpsystem_nos').textbox('setValue', gpsystem_nos);
        $.ajax({
            url: g_url_head + '/configureAjax?id=54&foreign=' + gpsystem_nos,
            dataType: "json",
            async: false,
            xhrFields: {
                withCredentials: true
            },
            success: function (r) {
                if (r.length == 0) {
                    layer.msg("不存在该系统单号 ");
                } else {
                    $('#gpcorporate_names').textbox('setValue', r[0].corporate_name);
                    $('#gpappli_departments').textbox('setValue', r[0].appli_department);
                    $('#gpjob_nos').textbox('setValue', r[0].job_no);
                    $('#gpapply_dates').textbox('setValue', r[0].apply_date);
                    $('#gpapply_mans').textbox('setValue', r[0].apply_man);
                    $('#gparrive_dates').textbox('setValue', r[0].arrive_date);
                    $('#gpflaw_places').textbox('setValue', r[0].park_name);
                    $('#gpsort_goodss').textbox('setValue', r[0].sort_goods);
                    $('#goods_suppliers').combobox('setValue', r[0].goods_supplier);
                    gpsystem_nos = r[0].system_no;
                    var purchase_confirm = r[0].purchase_confirm;//采购确认
                    var warehouse_confirm = r[0].warehouse_confirm;//仓库确认


                    if (r[0].arrive_date == null) {//还没有确认到货
                        if (warehouse_confirm == null) {
                            //如果采购还没有确认  明细加载所有数据，待采购选择去留的数据
                            $('#gprowsTableShow').datagrid({
                                url: g_url_head + '/configureAjax?id=38&foreign=' + gpsystem_nos,
                            });
                            if (purchase_confirm == null) {
                                if (deptname == 6) {//采购部
                                    // gpeditIndexFlag = false;//编辑开启
                                    $("#submitGpS").show();//提交按钮打开
                                    $("#goods_suppliers").combobox({readonly: false});
                                    gpFlag = 1;//采购提交
                                }
                            } else {//仓库确认  删除 提交
                                $("#purchase_confirm").prop("checked", true);
                                if ((deptname == 25)) {//仓库和仓库部长
                                    gpeditIndexFlag = false;//编辑开启
                                    $("#gparrivediv").show();//到货日期开启
                                    $("#gparrive_dates").datebox({readonly: false});
                                    $("#submitGpS").show();//提交按钮打开
                                    gpFlag = 2;//仓库提交
                                } else if (deptname == 30) {//采购部长 可以重新修改
                                    // gpeditIndexFlag = false;//编辑开启
                                    $("#submitGpS").show();//提交按钮打开
                                    $("#goods_suppliers").combobox({readonly: false});
                                    $('#goods_suppliers').combobox('setValue', r[0].goods_supplier);
                                    gpFlag = 3;//采购部长提交
                                }
                            }
                            // $("#gparrive_dates").datebox({readonly: false});
                        }
                        // else {//流程走完  采购仓库都已经确认
                        //     var gpdata = []
                        //     $.ajax({
                        //         type: "GET",
                        //         url: g_url_head + '/configureAjax',//读取函数
                        //         data: {id: 38, foreign: gpsystem_nos},
                        //         dataType: "json",
                        //         async: false,
                        //         xhrFields: {
                        //             withCredentials: true
                        //         },
                        //         success: function (r) {
                        //             r.forEach(function (value, index, array) {
                        //                 if ((value.goods_flag == 't')) {
                        //                     gpdata.push(value);
                        //                 }
                        //             })
                        //         }
                        //     })
                        //     $('#gprowsTableShow').datagrid({
                        //         data: gpdata
                        //     });
                        //     $("#purchase_confirm").prop("checked", true);
                        //     $("#warehouse_confirm").prop("checked", true);
                        // }
                    } else {//流程结束
                        if (deptname == 29) {//如果为仓库部长 可以修改
                            gpeditIndexFlag = false;//编辑开启
                            $("#gparrivediv").show();//到货日期开启
                            $("#gparrive_dates").datebox({readonly: false});
                            $('#gparrive_dates').textbox('setValue', r[0].arrive_date);
                            $("#submitGpS").show();//提交按钮打开
                            gpFlag = 4;//仓库部长修改
                        } else if (deptname == 30) {//采购部长 可以重新修改
                            // gpeditIndexFlag = false;//编辑开启
                            $("#submitGpS").show();//提交按钮打开
                            $("#goods_suppliers").combobox({readonly: false});
                            gpFlag = 3;//采购部长提交
                        }
                        var gpdata = []
                        $.ajax({
                            type: "GET",
                            url: g_url_head + '/configureAjax',//读取函数
                            data: {id: 38, foreign: gpsystem_nos},
                            dataType: "json",
                            async: false,
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function (r) {
                                r.forEach(function (value, index, array) {
                                    if ((value.goods_flag == 't')) {
                                        gpdata.push(value);
                                    }
                                })
                            }
                        });
                        $('#gprowsTableShow').datagrid({
                            data: gpdata
                        });
                        $("#gparrivediv").show();//到货日期开启
                        $("#purchase_confirm").prop("checked", true);
                        $("#warehouse_confirm").prop("checked", true);
                    }
                }
            }
        });

    }
    $('#gprowsTableShow').datagrid({
        url: '',
        striped: true,     //交替行换色
        fit: true,
        height: 400,
        fitColumns: true,
        singleSelect: true,
        // border: false,
        rownumbers: true,
        toolbar: [{
            id: 'gpDeleteButton',
            text: '删除',
            iconCls: 'icon-remove',
            handler: function (value, index) {
                if (gpeditIndexFlag) {
                    return
                }
                if (gpeditIndexs == undefined) {
                    return
                }
                //默认prompt
                layer.prompt({
                        title: '删除备注（注：必填项）'
                    },
                    function (val, index) {
                        var data = {
                            tableName: "t_goods_body",
                            anyFieldValue: "goods_del = '" + val + "'",
                            foreignName: "head_id",
                            foreignValue: gpahead_id
                        };
                        var url = g_url_head + "/configureUpdate";
                        $.ajax({
                            type: "post",
                            url: url,
                            dataType: 'json',
                            data: data,
                            success: function (r) {
                                if (r.success == 1) {
                                    layer.msg('删除成功');
                                    $('#gprowsTableShow').datagrid('cancelEdit', gpeditIndexs)
                                        .datagrid('deleteRow', gpeditIndexs);
                                    gpeditIndexs = undefined;
                                    layer.close(index);
                                } else {
                                    layer.msg('删除失败');
                                    layer.close(index);
                                }
                            }
                        });

                    });

            }
        }
            , {
                text: '接受改变',
                id: 'gpSaveButton',
                iconCls: 'icon-save',
                handler: function () {
                    if (gpsendEditing()) {
                        $('#gprowsTableShow').datagrid('acceptChanges');
                    }
                }
            }, {
                text: '撤销改变',
                id: 'gpCancelButton',
                iconCls: 'icon-undo',
                handler: function () {
                    $('#gprowsTableShow').datagrid('rejectChanges');
                    gpeditIndexs = undefined;
                }
            }
        ],
        onClickRow: function (index, row) {
            if (gpeditIndexFlag) {//编辑开启权限
                return
            }
            gpahead_id = row.head_id;
            if (gpeditIndexs != index) {
                if (gpsendEditing()) {
                    gpeditIndexs = index;
                    $('#gprowsTableShow').datagrid('selectRow', gpeditIndexs);
                    $('#gprowsTableShow').datagrid('beginEdit', gpeditIndexs);
                } else {
                    $('#gprowsTableShow').datagrid('selectRow', gpeditIndex);
                }
            }
        },

        onBeforeLoad: function (data) {
            // if (gpeditIndexFlag) {//true 为隐藏按钮
            //     $("div.datagrid-toolbar [id ='gpDeleteButton']").eq(0).hide();
            // }
            if (gpFlag == 0) {
                $("div.datagrid-toolbar [id ='gpDeleteButton']").eq(0).hide();
                $("div.datagrid-toolbar [id ='gpSaveButton']").eq(0).hide();
                $("div.datagrid-toolbar [id ='gpCancelButton']").eq(0).hide();
            } else if (gpFlag == 1) {
                $("div.datagrid-toolbar [id ='gpDeleteButton']").eq(0).hide();
                $("div.datagrid-toolbar [id ='gpSaveButton']").eq(0).hide();
                $("div.datagrid-toolbar [id ='gpCancelButton']").eq(0).hide();
            } else if (gpFlag == 2) {
                // $("div.datagrid-toolbar [id ='gpSaveButton']").eq(0).hide();
                // $("div.datagrid-toolbar [id ='gpCancelButton']").eq(0).hide();
            } else if (gpFlag == 3) {//采购部长 修改供应商
                $("div.datagrid-toolbar [id ='gpDeleteButton']").eq(0).hide();
                $("div.datagrid-toolbar [id ='gpSaveButton']").eq(0).hide();
                $("div.datagrid-toolbar [id ='gpCancelButton']").eq(0).hide();
            } else if (gpFlag == 4) {//仓库部长 修改到货数量
                $("div.datagrid-toolbar [id ='gpDeleteButton']").eq(0).hide();
            }

        },
        onBeforeEdit: function (rowIndex, rowData) {
            // 动态设置 字段 最大值
            var columnOption = $('#gprowsTableShow').datagrid('getColumnOption', "goods_true_num");
            columnOption.editor.options.min = 0;
            columnOption.editor.options.max = parseFloat(rowData.goods_num);
            // 解决单击一行会自动设置最小值的问题
            if (rowData.goods_true_num == 0) {
                rowData.goods_true_num = "";
            }
        },
        onBeginEdit: function (index, rowData, value) {
            //回车时结束编辑
            $('.datagrid-editable .textbox,.datagrid-editable .datagrid-editable-input,.datagrid-editable .textbox-text').bind('keyup', function (e) {
                var code = e.keyCode || e.which;
                if (code == 13) {
                    if (gpsendEditing()) {
                        $('#gprowsTableShow').datagrid('acceptChanges');
                    }
                }

            });
        },
        columns: [[
            {field: 'head_id', title: 'id', width: 100, hidden: true},
            {
                field: 'goods_name', title: '商品名称', width: 100,
                formatter: function (value) {
                    return "<span title='" + value + "'>" + value + "</span>";
                }
            },
            {
                field: 'goods_spec', title: '商品型号', width: 100,
                formatter: function (value) {
                    return "<span title='" + value + "'>" + value + "</span>";
                }
            },
            {field: 'goods_unit', title: '单位', width: 50},
            {
                field: 'goods_code', title: '商品编码', width: 150,
                formatter: function (value) {
                    return "<span title='" + value + "'>" + value + "</span>";
                }
            },
            {field: 'goods_num', title: '提单数量', width: 100},
            // {field: 'goods_price', title: '价格', width: 100},
            // {field: 'goods_rate', title: '税率', width: 100},
            {
                field: 'goods_remarks', title: '备注', width: 100,
                formatter: function (value) {
                    return "<span title='" + value + "'>" + value + "</span>";
                }
            },
            // {
            //     field: 'goods_supplier', title: '商品供应商', width: 100,
            //     formatter: function (value, row) {
            //         return row.goods_supplier;
            //     },
            //     editor: {
            //         type: 'combobox',
            //         options: {
            //             panelHeight: '150',
            //             valueField: 'supplier_name',
            //             textField: 'supplier_name',
            //             url: g_url_head + '/configureAjax?id=55',
            //             required: true,
            //             onHidePanel: function () {
            //                 var _options = $(this).combobox('options');
            //                 var _data = $(this).combobox('getData');/* 下拉框所有选项 */
            //                 var _value = $(this).combobox('getValue');/* 用户输入的值 */
            //                 var _b = false;/* 标识是否在下拉列表中找到了用户输入的字符 */
            //                 for (var i = 0; i < _data.length; i++) {
            //                     if (_data[i][_options.valueField] == _value) {
            //                         _b = true;
            //                         break;
            //                     }
            //                 }
            //                 if (!_b) {
            //                     $(this).combobox('setValue', '');
            //                 }
            //             }
            //         }
            //     }
            // },
            {
                field: 'goods_true_num',
                title: '到货数量',
                width: 80,
                align: 'center',
                editor: {type: 'numberbox', options: {precision: 2, required: true, min: 0, max: 100}}
            }
        ]]
    });

    $('#gprowsShow').dialog({
        title: '运行函数',
        width: 880,
        height: 560,
        top: 50,
        closed: false,//显示对话框
        cache: false,
        modal: true,
        closable: false,//关闭按钮
        resizable: true//大小拖动
    });
    $('#gprowsShow').window('center');//使Dialog居中显示
}

function closeGpWinShow() {
    $("#gprowsTableShow").datagrid("loadData", []);
    $("#gpRowsFormShow").form('clear');
    $('#gprowsShow').dialog('close')
    $("#gparrive_dates").datebox({readonly: true});
    $("#goods_suppliers").combobox({readonly: true});
    gpeditIndexFlag = true;
    gpahead_id = null;
    gpFlag = 0;
    gpeditIndexs = undefined;
    $("#purchase_confirm").prop("checked", false);
    $("#warehouse_confirm").prop("checked", false);
    // $("#purchase_confirm").prop("checked", false)
    // $("#warehouse_confirm").prop("checked", false)
    $('#execute').click();
}

//酒店物料申请编辑 提交表单
function submitGpShow() {
    var system_no = $('#gpsystem_nos').textbox('getValue');
    var submitflag = false;
    var good_head = "";
    if (gpFlag == 1) {//采购员提交
        // if (gpeditIndexs != undefined) {//判断  接受改变
        //     layer.msg("请点击 接受改变")
        //     return;
        // }
        // var lists = $("#gprowsTableShow").datagrid('getRows');//获取所有行
        // lists.forEach(function (value, index, array) {
        //     if (value.goods_supplier == null) {//判断  接受改变
        //         submitflag = true;
        //         return;
        //     }
        //     good_head += value.head_id + "/" + value.goods_supplier + ";";
        // });
        // if (submitflag) {
        //     layer.msg("商品供应商 不能为空");
        //     return;
        // }
        var goods_suppliers = $('#goods_suppliers').combobox('getText');
        if (goods_suppliers == "") {
            layer.msg("供应商确认 不能为空")
            return;
        }
        var pc_dtime = getCurrentTime();
        var data = {
            tableName: "t_goods_head",
            anyFieldValue: "purchase_confirm = '" + g_usernamec + "',goods_supplier = '" + goods_suppliers + "',pc_dtime = '" + pc_dtime + "'",
            foreignName: "system_no",
            foreignValue: system_no
        };
    } else if (gpFlag == 3) {//采购部长提交
        var goods_suppliers = $('#goods_suppliers').combobox('getText');
        if (goods_suppliers == "") {
            layer.msg("供应商确认 不能为空")
            return;
        }
        var pu_header = getUserName();
        var pu_h_dtime = getCurrentTime();
        var data = {
            tableName: "t_goods_head",
            anyFieldValue: "goods_supplier = '" + goods_suppliers + "',pu_header = '" + pu_header + "',pu_h_dtime = '" + pu_h_dtime + "'",
            foreignName: "system_no",
            foreignValue: system_no
        };
    } else if (gpFlag == 2) {//仓库员提交
        if (gpeditIndexs != undefined) {//判断 探伤表格是否 接受改变
            layer.msg("请点击 接受改变")
            return;
        }
        var gparrive_dates = $('#gparrive_dates').textbox('getValue');
        if (gparrive_dates == "") {
            layer.msg("到货日期 不能为空")
            return;
        }
        var lists = $("#gprowsTableShow").datagrid('getRows');//获取所有行
        if (lists.length == 0) {//单子删除完毕
            gpFlag = 1;
        }
        lists.forEach(function (value, index, array) {
            if (value.goods_true_num == null) {//判断  接受改变
                submitflag = true;
                return;
            }
            good_head += value.head_id + "/" + value.goods_true_num + ";";
        });
        if (submitflag) {
            layer.msg("到货价格 不能为空");
            return;
        }
        var wc_dtime = getCurrentTime();
        var data = {
            tableName: "t_goods_head",
            anyFieldValue: "arrive_date = '" + gparrive_dates + "',warehouse_confirm = '" + g_usernamec + "'," +
                " wc_dtime = '" + wc_dtime + "'",
            foreignName: "system_no",
            foreignValue: system_no
        };
    } else if (gpFlag == 4) {//仓库部长 修改
        if (gpeditIndexs != undefined) {//判断 探伤表格是否 接受改变
            layer.msg("请点击 接受改变")
            return;
        }
        var gparrive_dates = $('#gparrive_dates').textbox('getValue');
        if (gparrive_dates == "") {
            layer.msg("到货日期 不能为空")
            return;
        }
        var lists = $("#gprowsTableShow").datagrid('getRows');//获取所有行
        if (lists.length == 0) {//单子删除完毕
            gpFlag = 1;
        }
        lists.forEach(function (value, index, array) {
            if (value.goods_true_num == null) {//判断  接受改变
                submitflag = true;
                return;
            }
            good_head += value.head_id + "/" + value.goods_true_num + ";";
        });
        if (submitflag) {
            layer.msg("到货价格 不能为空");
            return;
        }
        var wa_header = getUserName();
        var wa_h_dtime = getCurrentTime();
        var data = {
            tableName: "t_goods_head",
            anyFieldValue: "arrive_date = '" + gparrive_dates + "',wa_header = '" + wa_header + "',wa_h_dtime = '" + wa_h_dtime + "'",
            foreignName: "system_no",
            foreignValue: system_no
        };
    }
    var url = g_url_head + "/configureUpdate";

    $.ajax({
        type: "post",
        url: url,
        dataType: 'json',
        data: data,
        xhrFields: {
            withCredentials: true
        },
        success: function (r) {
            if (r.success == 1) {
                if ((gpFlag == 1) || (gpFlag == 3)) {
                    layer.confirm('保存成功!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                        closeGpWinShow();
                    });

                } else if ((gpFlag == 2) || (gpFlag == 4)) {

                    $.ajax({
                        type: "post",
                        url: g_url_head + '/updateGoodBodySatuts',
                        dataType: 'json',
                        data: {good_head: good_head, goodType: "2"},
                        success: function (r) {
                            if (r.success == 1) {
                                layer.confirm('保存成功!', {
                                    closeBtn: 0,//不显示关闭按钮
                                    btn: ['确认'] //按钮
                                }, function () {
                                    layer.close(layer.index);
                                    closeGpWinShow();
                                });
                            } else {
                                layer.confirm('保存失败!', {
                                    closeBtn: 0,//不显示关闭按钮
                                    btn: ['确认'] //按钮
                                }, function () {
                                    layer.close(layer.index);
                                });
                            }
                        }
                    })
                }

            } else {
                layer.confirm('保存失败!', {
                    closeBtn: 0,//不显示关闭按钮
                    btn: ['确认'] //按钮
                }, function () {
                    layer.close(layer.index);
                });
            }
        }
    })
}

//表格 结束编辑触发
function gpsendEditing() {
    // if (gpFlag == 1) {
    //     var e = $("#gprowsTableShow").datagrid('getColumnOption', 'goods_true_price');
    //     e.editor = {};
    // } else {
    //     var e = $("#gprowsTableShow").datagrid('getColumnOption', 'goods_supplier');
    //     e.editor = {};
    // }
    if (gpeditIndexs == undefined) {
        return true
    }
    if ($('#gprowsTableShow').datagrid('validateRow', gpeditIndexs)) {
        $('#gprowsTableShow').datagrid('endEdit', gpeditIndexs);
        gpeditIndexs = undefined;
        return true;
    } else {
        return false;
    }
}


<!-- toolbar function -->
function searchgoosbill() {
    var exesql = "";
    var andwhere = "";
    exesql = temp_exeSql;
    if((exesql.indexOf("where") != -1 )||(exesql.indexOf("WHERE") != -1 )){
        andwhere = " and ";
    }else{
        andwhere = " where ";
    }
    var goosbill_name = $("#goosbill_name").textbox('getText');
    var goosbill_code = $("#goosbill_code").textbox('getText');
    var goodbill_startDate = $('#goodbill_startDate').datebox('getValue');
    var goodbill_endDate = $('#goodbill_endDate').datebox('getValue');

    if (goosbill_name != '') {
        goosbill_name = " AND 系统单号 LIKE '%" + goosbill_name + "%'";
    }
    if (goosbill_code != '') {
        goosbill_code = " AND 货品编码 LIKE '%" + goosbill_code + "%'";
    }
    var sqlCon = goosbill_name + goosbill_code;
    sqlCon = sqlCon.substr(5, sqlCon.length);
    var searchdate = "";
    if ((goodbill_startDate == '') && (goodbill_endDate == '')) {
        if (sqlCon == "") {
        } else {
            exesql += andwhere + sqlCon;
            // exesql += " WHERE " + sqlCon;
        }
    } else if ((goodbill_startDate == '')) {
        layer.msg('请准确输入运行开始/结束时间');
        return;
    } else if ((goodbill_startDate != '') && (goodbill_endDate == '')) {
        if (sqlCon == "") {
            // exesql += " WHERE 提单日期 = '" + goodbill_startDate + "'";
            exesql += andwhere+" 提单日期 = '" + goodbill_startDate + "'";
        } else {
            // exesql += " WHERE " + sqlCon + " AND 提单日期 = '" + goodbill_startDate + "'";
            exesql += andwhere + sqlCon + " AND 提单日期 = '" + goodbill_startDate + "'";
        }
    } else if (goodbill_startDate > goodbill_endDate) {
        layer.msg('警告：结束时间不能早于开始时间!');
        return;
    } else if (goodbill_startDate == goodbill_endDate) {
        if (sqlCon == "") {
            // exesql += " WHERE 提单日期 = '" + goodbill_startDate + "'";
            exesql += andwhere+" 提单日期 = '" + goodbill_startDate + "'";
        } else {
            // exesql += " WHERE " + sqlCon + " AND 提单日期 = '" + goodbill_startDate + "'";
            exesql += andwhere + sqlCon + " AND 提单日期 = '" + goodbill_startDate + "'";
        }
    } else {
        if (sqlCon == "") {
            // exesql += " WHERE 提单日期 BETWEEN '" + goodbill_startDate + "' AND '" + goodbill_endDate + "'";
            exesql += andwhere+" 提单日期 BETWEEN '" + goodbill_startDate + "' AND '" + goodbill_endDate + "'";
        } else {
            // exesql += " WHERE " + sqlCon + " AND 提单日期 BETWEEN '" + goodbill_startDate + "' AND '" + goodbill_endDate + "'";
            exesql += andwhere + sqlCon + " AND 提单日期 BETWEEN '" + goodbill_startDate + "' AND '" + goodbill_endDate + "'";
        }
    }
    editor.setValue(exesql);
    g_page = 1;
    datagrid_refresh(editor.getValue());
    // faultCount++;
}

function resetgoosbill() {
    $("#goosbill_name").textbox('setText', '');
    $("#goosbill_code").textbox('setText', '');
    // $("#goodbill_startDate").textbox('setText', '');
    $("#goodbill_startDate").textbox('setValue', '');
    // $("#goodbill_endDate").textbox('setText', '');
    $("#goodbill_endDate").textbox('setValue', '');
    searchgoosbill();
}

function resetaddAppTree() {
    // 先去掉
    var itemEl = $('#addAppTree')[0];
    if (itemEl != null) {
        $('#mm').menu('removeItem', itemEl);
    }
    // 追加一个顶部菜单
    $('#mm').menu('appendItem', {
        id: 'addAppTree',
        text: '添加应用',
        iconCls: 'icon-ok',
    });
    var item = $('#mm').menu('findItem', '添加应用');  // 查找“打开”项
    $.ajax({
        type: "GET",
        url: g_url_head + '/configureAjax',//读取函数
        data: {id: 56, foreign: username},
        dataType: "json",
        async: false,
        success: function (r) {
            if (r.length != 0) {
                r.forEach(function (value, i) {
                    if (value.isparent == 1) {
                        $('#mm').menu('appendItem', {
                            parent: item.target,  // 设置父菜单元素
                            text: value.viewfuncname,
                            // iconCls: 'icon-excel',
                            onclick: function (source) {
                                var node = $(g_tree).tree('getSelected');
                                var sqlValue2 = username + ";" + node.text + ";" + '0' + ";" + value.id;
                                layer.confirm('您确定要将「' + node.text + '」设置成个人应用：「' + value.viewfuncname + '」吗？', {
                                    btn: ['确定', '取消'] //按钮
                                }, function () {
                                    $.ajax({
                                        type: "post",
                                        url: g_url_head + '/configureIdSave',
                                        dataType: 'json',
                                        data: {id: 27, sqlValue: sqlValue2},
                                        success: function (data) {
                                            if (data.success == 1) {
                                                layer.msg("保存成功");
                                                init();
                                                layer.closeAll();
                                            } else {
                                                layer.msg("保存失败");
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }

                })
            }
        }
    });
}

function goodpucharseDelete(row) {
    var systemno = row.系统单号;
    if ((systemno == null) || (systemno == "")) {
        layer.msg("未获取到该系统单号")
    }
    layer.confirm('您确定要将「' + systemno + '」系统单号 撤销吗？', {
        btn: ['确定', '取消'] //按钮
    }, function () {
        var del_dtime = getCurrentTime()
        var del_man = getUserName();
        var data = {
            tableName: "t_goods_head",
            anyFieldValue: "g_delete = 't',del_man = '"+del_man+"',del_dtime = '"+del_dtime+"'",
            foreignName: "system_no",
            foreignValue: systemno
        };
        $.ajax({
            type: "post",
            url: g_url_head + '/configureUpdate',
            dataType: 'json',
            data: data,
            success: function (data) {
                if (data.success == 1) {
                    layer.msg("撤销成功");
                    $('#execute').click();
                } else {
                    layer.msg("撤销失败");
                }
            }
        });
    });

}