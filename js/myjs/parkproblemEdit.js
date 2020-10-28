var ppeditIndex = undefined;//表格编辑标识
var ppwhether = 1;//表格是否可以编辑  1 为可以编辑  2 为不可编辑
var ppPlaceSelect;//地点下拉框选中的值
var ppditsystem_no = "";//系统单号
var ppmenuid = null;//指定审批人类型
var approve_num = null;//审批流程号
var g_submitter = null;//上一个提交人工号
var g_approve1 = null;//记录问题提交人工号
var ppindex = 1;//指定审批人类型
var tijiaoren = "提交人：";
var wentiren = "问题处理人：";
var zongjian = "设备总监：";
var shenpiren = "审批人：";

//公园问题派单编辑 开启窗口动作
function openParkProblemEditBefore(row) {
    //分类下拉框值
    var majorData = [{"majorName": "机电"}, {"majorName": "AVC"}, {"majorName": "智能化"}, {"majorName": "灯光"}];
    if (ppindex == 1) {//保证只加载一次
        ppindex++;
        $('#pprows').datagrid({
            // url:ppurl,
            toolbar: [{
                text: '添加',
                iconCls: 'icon-add',
                handler: function () {
                    if (pgendEditing()) {
                        // ppditsystem_no = $("#system_no").textbox('getValue');
                        $('#pprows').datagrid('appendRow', {system_no: ppditsystem_no});
                        ppeditIndex = $('#pprows').datagrid('getRows').length - 1;
                        $('#pprows').datagrid('selectRow', ppeditIndex).datagrid('beginEdit', ppeditIndex);
                    }
                }
            }, {
                text: '删除',
                iconCls: 'icon-remove',
                handler: function () {
                    if (ppeditIndex == undefined) {
                        return
                    }
                    $('#pprows').datagrid('cancelEdit', ppeditIndex)
                        .datagrid('deleteRow', ppeditIndex);
                    ppeditIndex = undefined;
                }
            }, {
                text: '接受改变',
                iconCls: 'icon-save',
                handler: function () {
                    if (pgendEditing()) {
                        $('#pprows').datagrid('acceptChanges');
                    }
                }
            }, {
                text: '撤销改变',
                iconCls: 'icon-undo',
                handler: function () {
                    $('#pprows').datagrid('rejectChanges');
                    editIndex = undefined;
                }
            },],
            onClickRow: function (index, row) {
                if (ppeditIndex != index) {
                    if (pgendEditing()) {
                        // $('#dgrows').datagrid('selectRow', index)
                        //     .datagrid('beginEdit', index);
                        ppeditIndex = index;
                        $('#pprows').datagrid('selectRow', index);
                        $('#pprows').datagrid('beginEdit', index);

                    } else {
                        $('#pprows').datagrid('selectRow', ppeditIndex);
                    }
                }
            },
            //表格样式
            columns: [[
                {field: 'system_no', title: '系统单号', width: 100, align: 'center', hidden: true},
                // {field: 'problem_class', title: '问题分类', width: 100, align: 'center', hidden: true},
                // {field: 'whether_evacuate', title: '是否疏散', width: 100, align: 'center', hidden: true},
                // {field: 'suspend_duration', title: '中断时长', width: 100, align: 'center', hidden: true},
                {
                    field: 'entry_name', title: '项目名称', width: 125, align: 'center',
                    formatter: function (value, row) {
                        return row.entry_name;
                    },
                    editor: {
                        type: 'combobox',
                        options: {
                            panelHeight: '150',
                            valueField: 'name',
                            textField: 'name',
                            required: true,
                        }
                    }
                },
                {
                    field: 'major', title: '专业', width: 125, align: 'center',
                    formatter: function (value, row) {
                        return row.major;
                    },
                    editor: {
                        type: 'combobox',
                        options: {
                            panelHeight: '150',
                            valueField: 'majorName',
                            textField: 'majorName',
                            required: true,
                            data: majorData,
                        }
                    }
                },
                {
                    field: 'problem_describe', title: '问题描述', width: 525, align: 'center', editor: {type: 'text'},
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }
                }
            ]],
            onBeginEdit: function (index, rowData) {
                //回车时结束编辑
                $('.datagrid-editable .textbox,.datagrid-editable .datagrid-editable-input,.datagrid-editable .textbox-text').bind('keyup', function (e) {
                    var code = e.keyCode || e.which;
                    if (code == 13) {
                        if (pgendEditing()) {
                            $('#pprows').datagrid('acceptChanges');
                        }
                    }
                });
                // 统计方法下拉框
                //统计方法下拉框
                var smEditor = $('#pprows').datagrid('getEditor', {
                    index: index,
                    field: 'entry_name'
                });

                $(smEditor.target).combobox({
                    onLoadSuccess: function () {
                        $(smEditor.target).combobox('setValue', rowData.entry_name);
                    },
                    onShowPanel: function () {
                        //下拉展开时动态修改options
                        //datatype处理统计方法
                        // if(rowData.dataType == 'string' || rowData.dataType == 'date'){
                        var jqData = [];
                        var url = g_url_head + '/configureSecond?id=7&foreign=' + ppPlaceSelect
                        $.ajax({
                            url: url,
                            dataType: 'json',
                            type: 'GET',
                            async: false,
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function (data) {
                                jqData = data;
                            }
                        });
                        $(smEditor.target).combobox("loadData", jqData);
                        // }
                        //设置值
                        $(smEditor.target).combobox('setValue', rowData.entry_name);
                    }
                });
                if ((rowData.entry_name == null) || (rowData.entry_name == "")) {
                } else {
                    $(smEditor.target).combobox('setValue', rowData.entry_name);
                }
            }
        });

        //表格 结束编辑触发
        function pgendEditing() {
            if (ppwhether == 2) {
                return false
            }
            if (ppeditIndex == undefined) {
                return true
            }
            if ($('#pprows').datagrid('validateRow', ppeditIndex)) {
                $('#pprows').datagrid('endEdit', ppeditIndex);
                ppeditIndex = undefined;
                return true;
            } else {
                return false;
            }
        }
    }
    //如果 row有值
    if (row) {
        ppditsystem_no = row.系统单号;
        ppwhether = 2;//表格只可以读取不可编辑
        $("#pppark_place").combobox({readonly: true});
        $("#problem_title").textbox({readonly: true});
        $("input[name=ppstate]").attr("disabled", false);
        $("#ppupload").hide();
        getpptabledata();

    } else {
        $("#ppcommit").show();//显示提交按钮
        $("#ppupload").show();
        ppmenuid = 69;//第一次提交 指定设备总监
        ppwhether = 1;
        $("input[name=ppstate]").attr("disabled", true);
        //加载表单初始值
        putppedittablevalues();
    }
    $("input[name=ppstate]").click(function () {
        // $("input[name=ppstate]").value();
        var ppstate = $("input[name=ppstate]:checked").val();
        if (ppstate == 1) {//通过
            $('#approved_by').combobox({disabled: false});
        } else {
            $('#approved_by').combobox({disabled: true});
        }
    });
    $("#approved_by").combobox({
        disabled: false,
        method: 'GET',
        // url: g_url_head + '/getUserNameByDept?deptid=' + deptname,
        url: g_url_head + '/getUserNameByMenu?menuid=' + ppmenuid,
        valueField: 'id',
        textField: 'name',
        panelHeight: '150',
        // enablePinyin:true,
        editable: true,
        prompt: '可根据拼音进行搜索！',
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
        formatter: formatItem,
    }).combobox("clear");
    $('#parkproblemRows').dialog({
        title: '运行函数',
        width: 860,
        height: 560,
        top: 50,
        closed: false,//显示对话框
        cache: false,
        modal: true,
        closable: false,
        resizable: true
    });

    $('#parkproblemRows').window('center');//使Dialog居中显示


}

/**
 * 获取该系统单号下的 所有数据
 */
function getpptabledata() {
    $("#pprows").datagrid("loadData", []);
    $("#parkproblemForm").form('clear');
    $.ajax({
        url: g_url_head + '/configureAjax?id=45&foreign=' + ppditsystem_no,
        dataType: "json",
        async: false,
        xhrFields: {
            withCredentials: true
        },
        success: function (r) {
            if (r.length == 0) {
                layer.msg("不存在该系统单号 ");
            } else {
                $('#ppapply_date').textbox('setValue', r[0].apply_date);
                $('#ppapply_man').textbox('setValue', r[0].apply_man);
                $('#ppappli_department').textbox('setValue', r[0].appli_department);
                $('#ppjob_no').textbox('setValue', r[0].job_no);
                $('#pppark_place').textbox('setValue', r[0].park_place);
                ppditsystem_no = r[0].system_no;
                tanshangsearchVal = ppditsystem_no;//查看文件用到
                $('#ppsystem_no').textbox('setValue', ppditsystem_no);
                $('#problem_title').textbox('setValue', r[0].problem_title);//问题标题
                $('#pprows').datagrid({
                    url: g_url_head + '/configureAjax?id=46&foreign=' + ppditsystem_no,
                });
                $.ajax({
                    url: g_url_head + '/configureAjax?id=47&foreign=' + ppditsystem_no,
                    dataType: "json",
                    async: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (r) {
                        $('#ppapproltext').html(r[0].approve_str);
                        approve_num = r[0].approve_num;//审批号
                        var approved_by = r[0].approved_by;//指定审批人
                        g_submitter = r[0].submitter;//上一个提交人工号
                        var over_flag = r[0].over_flag;//结束标识
                        if (r[0].approve1) {
                            g_approve1 = r[0].approve1;
                        }
                        var flag = false;//提交按钮开启
                        if (approve_num == 1) {//提交人重新修改
                            ppmenuid = 69;// 指定设备总监
                            ppwhether = 1;//可编辑
                            flag = true;
                            $("input[name=ppstate]").attr("disabled", true);//驳回不可编辑
                            $("#pppark_place").combobox({readonly: false});//开始地点下拉框
                            $("#ppupload").show();//文件上传打开
                            $('#pppark_place').combobox({
                                disabled: false,
                                method: 'GET',
                                url: g_url_head + '/configureAjax?id=34',
                                valueField: 'id',
                                textField: 'park_name',
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
                                    var data = $(this).combobox("getData");
                                    if (data && data.length > 0) {
                                        $(this).combobox("setValue", data[0].park_name);
                                        ppPlaceSelect = data[0].id;
                                    }
                                },
                                onSelect: function (record) {
                                    ppPlaceSelect = record.id;
                                }
                            });
                        } else if (approve_num == 2) {//总监审批
                            ppmenuid = 67;//指定问题处理人
                            flag = true;
                        } else if (approve_num == 3) {//问题处理人
                            ppmenuid = 68;//指定审批人
                            flag = true;
                            $("input[name=ppstate]").attr("disabled", true);//驳回不可编辑
                        } else if (approve_num == 4) {//审批人 审批
                            ppmenuid = 69;//指定 设备总监
                            flag = true;
                        } else if (approve_num == 5) {//设备总监确认
                            flag = true;
                            $("#approved_by").combobox({readonly: true});
                            $("input[name=ppstate]").attr("disabled", false);//驳回不可编辑
                        } else if (over_flag == "t") {//流程结束
                            $("input[name=ppstate]").attr("disabled", true);//驳回不可编辑
                            $("#ppreamrk").textbox({disabled: true});
                            $("#approved_by").combobox({readonly: true});
                        }
                        if(approved_by!=username){
                            flag=false;
                        }
                        if (flag) {
                            $("#ppcommit").show();//显示提交按钮
                        }
                    }
                })
            }
        }
    });
}

//酒店物料申请编辑 提交表单
function submitppFormRows() {
    var ppjob_no = $('#ppjob_no').textbox('getValue');//提交人工号
    var ppstate = $("input[name=ppstate]:checked").val();
    var currenttime = getCurrentTime();//当前系统时间
    var ppusername = g_usernamec;//当前用户中文名
    var ppreamrk = $("#ppreamrk").textbox('getValue');//审批备注
    var approved_by = $('#approved_by').combobox('getValue');
    var approved_Name = $('#approved_by').combobox('getText');
    var pppark_place = $('#pppark_place').combobox('getText');
    if (approve_num == null) {
        var params = $('#parkproblemForm').serializeArray();
        var lists = $("#pprows").datagrid('getRows');//获取所有行
        if (lists.length == 0) {
            layer.msg("请填写明细")
            return;
        } else if (ppeditIndex != undefined) {//判断 探伤表格是否 接受改变
            layer.msg("请点击 接受改变")
            return;
        }

        if (approved_by == "") {//判断  指定审批人
            layer.msg(" 指定审批人 不能为空")
            return;
        }
        // system_no,apply_date,apply_man,job_no,appli_department,park_place,problem_title
        var sqlValue = params[2].value + ";" + params[0].value + ";" + params[1].value +
            ";" + params[4].value + ";" + params[3].value + ";" + pppark_place + ";" + params[6].value;
        $.ajax({
            type: "post",
            url: g_url_head + '/configureSave',
            dataType: 'json',
            data: {id: 45, sqlValue: sqlValue},
            xhrFields: {
                withCredentials: true
            },
            success: function (r) {
                if (r.success == 1) {
                    var stringData = JSON.stringify(lists);
                    $.ajax({
                        type: "post",
                        url: g_url_head + '/saveParkProblemBody',
                        dataType: 'json',
                        data: stringData,
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (r) {
                            if (r.success == 1) {
                                // system_no,submitter,approved_by,approve_str,over_flag,starte_time,approve_num,approve_state
                                var sqlValue2 = ppditsystem_no + ";" + params[4].value + ";" + approved_by +
                                    ";" + tijiaoren + params[1].value + ";" + "f" + ";" + currenttime + ";" + 2 + ";" + "审批中" + ";" + " "+ ";" ;//+tijiaoren + params[1].value
                                $.ajax({
                                    type: "post",
                                    url: g_url_head + '/configureSave',
                                    dataType: 'json',
                                    data: {id: 47, sqlValue: sqlValue2},
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    success: function (r) {
                                        if (r.success == 1) {
                                            layer.confirm('提交成功!', {
                                                closeBtn: 0,//不显示关闭按钮
                                                btn: ['确认'] //按钮
                                            }, function () {
                                                layer.close(layer.index);
                                                closeppWinRows();
                                            });
                                        } else {
                                            layer.confirm('提交失败!', {
                                                closeBtn: 0,//不显示关闭按钮
                                                btn: ['确认'] //按钮
                                            }, function () {
                                                layer.close(layer.index);
                                            });
                                        }
                                    }
                                })

                            } else {
                                layer.confirm('提交失败!', {
                                    closeBtn: 0,//不显示关闭按钮
                                    btn: ['确认'] //按钮
                                }, function () {
                                    layer.close(layer.index);
                                });
                            }
                        }
                    })

                } else {
                    layer.confirm('提交失败!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                    });
                }
            }
        })
    } else if (approve_num == 1) {//提交人重新编辑提交

        if (approved_by == "") {//判断  指定审批人
            layer.msg(" 指定审批人 不能为空")
            return;
        }
        var url = g_url_head + "/configureUpdate";
        var lists = $("#pprows").datagrid('getRows');//获取所有行
        var stringData = JSON.stringify(lists);

        $.ajax({
            type: "post",
            url: g_url_head + '/saveParkProblemBody',
            dataType: 'json',
            data: stringData,
            success: function (r) {
                if (r.success == 1) {
                    var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + tijiaoren + ppusername + "：提交; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
                    data = {
                        tableName: "t_park_approll",       //指定下一个人审批人工号
                        anyFieldValue: "approved_by = '" + approved_by + "'" + "," + "approve_str = " + approve_str + "," + "approve_num = 2",
                        foreignName: "system_no",
                        foreignValue: ppditsystem_no
                    };
                    $.ajax({
                        type: "post",
                        url: url,
                        dataType: 'json',
                        data: data,
                        success: function (r) {
                            if (r.success == 1) {
                                layer.confirm('提交成功!', {
                                    closeBtn: 0,//不显示关闭按钮
                                    btn: ['确认'] //按钮
                                }, function () {
                                    layer.close(layer.index);
                                    closeppWinRows();
                                });
                            } else {
                                layer.confirm('提交失败!', {
                                    closeBtn: 0,//不显示关闭按钮
                                    btn: ['确认'] //按钮
                                }, function () {
                                    layer.close(layer.index);
                                });
                            }
                        }
                    })
                } else {
                    layer.confirm('提交失败!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                    });
                }
            }
        });
    } else if (approve_num == 2) {//总监审批
        var url = g_url_head + "/configureUpdate";
        var data;
        if (ppstate == 1) {//通过
            if (approved_by == "") {//判断  指定审批人
                layer.msg(" 指定审批人 不能为空")
                return;
            }
            var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + zongjian + ppusername + "：通过; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
            data = {
                tableName: "t_park_approll",   //指定下一个人审批人工号
                anyFieldValue: "submitter = '" + username + "' ," + "approved_by = '" + approved_by + "'" + "," + "approve_str = " + approve_str + ","
                    + "approve_num = 3",
                foreignName: "system_no",
                foreignValue: ppditsystem_no
            }
        } else {
            var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + zongjian + ppusername + "：驳回; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
            data = {
                tableName: "t_park_approll",       //指定上一个人审批人工号
                anyFieldValue: "submitter = '" + username + "' ," + "approved_by = '" + g_submitter + "'" + "," + "approve_str = " + approve_str + ","
                    + "approve_num = 1",
                foreignName: "system_no",
                foreignValue: ppditsystem_no
            }
        }
        $.ajax({
            type: "post",
            url: url,
            dataType: 'json',
            data: data,
            success: function (r) {
                if (r.success == 1) {
                    layer.confirm('提交成功!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                        closeppWinRows();
                    });
                } else {
                    layer.confirm('提交失败!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                    });
                }
            }
        })

    } else if (approve_num == 3) {//问题处理人 处理

        if (approved_by == "") {//判断  指定审批人
            layer.msg(" 指定审批人 不能为空")
            return;
        }
        var url = g_url_head + "/configureUpdate";
        var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + wentiren + ppusername + "：处理; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
        data = {
            tableName: "t_park_approll",  //指定下一个人审批人工号
            anyFieldValue: "submitter = '" + username + "' ," + "approved_by = '" + approved_by + "'" + "," + "approve_str = " + approve_str + "," + "approve_num = 4" + ","
                + "approve1 = '" + username + "'",
            foreignName: "system_no",
            foreignValue: ppditsystem_no
        };
        $.ajax({
            type: "post",
            url: url,
            dataType: 'json',
            data: data,
            success: function (r) {
                if (r.success == 1) {
                    layer.confirm('提交成功!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                        closeppWinRows();
                    });
                } else {
                    layer.confirm('提交失败!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                    });
                }
            }
        })
    } else if (approve_num == 4) {//问题处理人 处理
        var url = g_url_head + "/configureUpdate";
        if (ppstate == 1) {//通过
            if (approved_by == "") {//判断  指定审批人
                layer.msg(" 指定审批人 不能为空")
                return;
            }
            var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + shenpiren + ppusername + "：通过; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
            data = {
                tableName: "t_park_approll",   //指定下一个人审批人工号
                anyFieldValue: "submitter = '" + username + "' ," + "approved_by = '" + approved_by + "'" + "," + "approve_str = " + approve_str + ","
                    + "approve_num = 5",
                foreignName: "system_no",
                foreignValue: ppditsystem_no
            }
        } else { //驳回
            var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + shenpiren + ppusername + "：驳回; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
            data = {
                tableName: "t_park_approll",   //指定下一个人审批人工号
                anyFieldValue: "submitter = '" + username + "' ," + "approved_by = '" + g_approve1 + "'" + "," + "approve_str = "
                    + approve_str + "," + "approve_num = 3",
                foreignName: "system_no",
                foreignValue: ppditsystem_no
            }

        }
        $.ajax({
            type: "post",
            url: url,
            dataType: 'json',
            data: data,
            success: function (r) {
                if (r.success == 1) {
                    layer.confirm('提交成功!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                        closeppWinRows();
                    });
                } else {
                    layer.confirm('提交失败!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                    });
                }
            }
        })
    } else if (approve_num == 5) {//设备总监 确认
        var url = g_url_head + "/configureUpdate";
        if (ppstate == 1) {//通过
            var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + zongjian + ppusername + "：通过; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
            data = {
                tableName: "t_park_approll",
                anyFieldValue: "submitter = '" + username + "'" + "," + "approve_str = " + approve_str + "," + "over_flag = 't' ,"
                    + "approve_state = '审批完成' ," + "approve_num = 6",
                foreignName: "system_no",
                foreignValue: ppditsystem_no
            }
        } else { //驳回
            var approve_str = "CONCAT(approve_str,'<br/>⇒⇒" + zongjian + ppusername + "：驳回; 备注：{" + ppreamrk + "}(" + currenttime + ")')";
            data = {
                tableName: "t_park_approll",                        //指定 问题提交人
                anyFieldValue: "submitter = '" + username + "' ," + "approved_by = '" + g_approve1 + "'" + "," + "approve_str = " + approve_str + "," + "approve_num = 3",
                foreignName: "system_no",
                foreignValue: ppditsystem_no
            }
        }
        $.ajax({
            type: "post",
            url: url,
            dataType: 'json',
            data: data,
            success: function (r) {
                if (r.success == 1) {
                    layer.confirm('提交成功!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                        closeppWinRows();
                    });
                } else {
                    layer.confirm('提交失败!', {
                        closeBtn: 0,//不显示关闭按钮
                        btn: ['确认'] //按钮
                    }, function () {
                        layer.close(layer.index);
                    });
                }
            }
        })
    }

}

//加载表单初始值
function putppedittablevalues() {
    $("#parkproblemForm").form('clear');
    //申请日期 当前系统日期
    $('#ppapply_date').datebox('setValue', getCurrentDate());
    $('#ppappli_department').textbox('setValue', getDeptname());
    $("#ppapply_man").textbox('setValue', g_usernamec);
    $("#ppjob_no").textbox('setValue', username);
    $('#pppark_place').combobox({
        disabled: false,
        method: 'GET',
        url: g_url_head + '/configureAjax?id=34',
        valueField: 'id',
        textField: 'park_name',
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
            var data = $(this).combobox("getData");
            if (data && data.length > 0) {
                $(this).combobox("setValue", data[0].park_name);
                ppPlaceSelect = data[0].id;
            }
        },
        onSelect: function (record) {
            ppPlaceSelect = record.id;
        }
    });
    //生成流水号
    $.ajax({
        type: "get",
        url: g_url_head + '/getSystemNo',
        dataType: 'json',
        async: false,
        xhrFields: {
            withCredentials: true
        },
        data: {NoKey: "HQPP", NoSize: 11},
        success: function (r) {
            if (r.systemno == null) {
                layer.msg("网络错误，请联系管理员！");
            } else {
                // $("#system_no").val(r.systemno);
                ppditsystem_no = r.systemno;
                tanshangsearchVal = ppditsystem_no;//文件上传用到
                $("#ppsystem_no").textbox('setValue', ppditsystem_no);
            }
        }
    });

}

function closeppWinRows() {
    $('#execute').click();
    // $('#pprows').datagrid('loadData', {total: 0, rows: [] });
    $('#pprows').datagrid('loadData', {total: 0, rows: [], footer: []});
    $("#parkproblemForm").form('clear');
    $('#parkproblemRows').dialog('close');
    $('#ppapproltext').html("");//状 态
    $("#ppreamrk").textbox('setValue', '');
    approve_num = null;
    clearTsEditFile();

}
