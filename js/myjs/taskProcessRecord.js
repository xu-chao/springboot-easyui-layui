var tprecordID = null;
var tprflag = null;
var zoperators_name;

function openTaskProcess() {
    var username = [];
    $.ajax({
        type: "GET",
        url: g_url_head + '/getUserNameByDept?deptid=1,2',
        dataType: "json",
        async: false,
        success: function (data) {
            data.forEach(function (value, index, array) {
                var map = {"name": value.name, "value": value.id};
                username.push(map);
            })
        }, error: function () {
            alert("获取失败")
        }
    });
    zoperators_name = xmSelect.render({
        el: '#zoperators_name',
        tips: '可多选',
        toolbar: {
            show: true,
        },
        filterable: true,
        data: username,
    });

    $('#zengineering_name').combobox(
        {
            disabled: false,
            method: 'GET',
            url: g_url_head + '/configureFunc?id=2',
            prompt: '请填入工程',
            valueField: 'name',
            textField: 'name',
            panelHeight: 'auto',
            panelMaxHeight: 150,
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
            onLoadSuccess: function () {
                var val = $(this).combobox("getData");
                if (val.length > 0) {
                    for (var item in val[0]) {
                        if (item == "name") {
                            $(this).combobox("select", val[0][item]);
                        }
                    }
                }
            },
        });

    $('#zattraction_name').combobox(
        {
            disabled: false,
            method: 'GET',
            url: g_url_head + '/configureFunc?id=3',
            prompt: '请填入项目',
            valueField: 'name',
            textField: 'name',
            panelHeight: 'auto',
            panelMaxHeight: 150,
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
            onLoadSuccess: function () {
                var val = $(this).combobox("getData");
                if (val.length > 0) {
                    for (var item in val[0]) {
                        if (item == "name") {
                            $(this).combobox("select", val[0][item]);
                        }
                    }
                }
            },
        });
    $('#zsub_attraction_name').combobox(
        {
            disabled: false,
            method: 'GET',
            url: g_url_head + '/configureFunc?id=4',
            prompt: '请填入子项目',
            valueField: 'name',
            textField: 'name',
            panelHeight: 'auto',
            panelMaxHeight: 150,
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
            onLoadSuccess: function () {
                var val = $(this).combobox("getData");
                if (val.length > 0) {
                    for (var item in val[0]) {
                        if (item == "name") {
                            $(this).combobox("select", val[0][item]);
                        }
                    }
                }
            },
        });
    $("#ztask_type").combobox({
        disabled: false,
        method: 'GET',
        prompt: '请填入任务类型',
        url: g_url_head + '/configureFunc?id=5',
        valueField: 'name',
        textField: 'name',
        panelHeight: 'auto',
        panelMaxHeight: 150,
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
        onLoadSuccess: function () {
            var val = $(this).combobox("getData");
            if (val.length > 0) {
                for (var item in val[0]) {
                    if (item == "name") {
                        $(this).combobox("select", val[0][item]);
                    }
                }
            }
        },
        onSelect: function (record) {
            $("#zjob_content").combobox({
                disabled: false,
                method: 'GET',
                prompt: '请填入作业内容',
                url: g_url_head + '/configureSecond?id=14&foreign=' + record.id,
                valueField: 'name',
                textField: 'name',
                panelHeight: 'auto',
                panelMaxHeight: 150,
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
                onLoadSuccess: function () {
                    var val = $(this).combobox("getData");
                    if (val.length > 0) {
                        for (var item in val[0]) {
                            if (item == "name") {
                                $(this).combobox("select", val[0][item]);
                            }
                        }
                    }
                },
            })
        }
    });
    $("#zlssued_by").textbox("setValue", getUserName());
    $("#taskProcessShow").dialog("open");
}

function submitTaskProcessCommitS() {

    var selectArr = zoperators_name.getValue();
    var operators_name = "";

    selectArr.forEach(function (value, index, array) {
        operators_name += value.name + ";";
    });

    if (operators_name == "") {
        layer.msg("请选择 作业人员")
        return;
    }

    var zengineering_name = $('#zengineering_name').combobox('getText');
    var zattraction_name = $('#zattraction_name').combobox('getText');
    var zsub_attraction_name = $('#zsub_attraction_name').combobox('getText');
    var ztask_type = $('#ztask_type').combobox('getText');
    var zjob_content = $('#zjob_content').combobox('getText');
    var zlssued_by = $('#zlssued_by').textbox('getText');
    var zfollowqf = $('#zfollowqf').textbox('getText');
    if (zattraction_name == "") {
        layer.msg("请选择 项目")
        return;
    }
    if (zengineering_name == "") {
        layer.msg("请选择 工程")
        return;
    }
    if (zsub_attraction_name == "") {
        layer.msg("请选择 子项目")
        return;
    }
    if (ztask_type == "") {
        layer.msg("请选择 任务类型")
        return;
    }
    if (zjob_content == "") {
        layer.msg("请选择 作业内容")
        return;
    }
    var zstart_date = $('#zstart_date').datebox('getValue');
    if (zstart_date == "") {
        layer.msg("请选择 任务开始时间")
        return;
    }
    var zplan_end_date = $('#zplan_end_date').datebox('getValue');
    if (zplan_end_date == "") {
        layer.msg("请选择 任务完成时间")
        return;
    }
    var sqlValue = zengineering_name + ";" + zattraction_name + ";" + zsub_attraction_name +
        ";" + ztask_type + ";" + zjob_content + ";" + zstart_date + ";"
        + zplan_end_date + ";" + zlssued_by + ";" + zfollowqf + ";" + getCurrentTime();


    $.ajax({
        type: "post",
        url: g_url_head + '/saveAvcRecord',
        dataType: 'json',
        data: {operators_name: operators_name, sqlValue: sqlValue},
        success: function (data) {
            if (data.success == 1) {
                layer.msg("提交成功");
                closeTaskRecord()
                executeClick()
            } else {
                layer.msg("提交失败");
            }
        }
    });
}

function closeTaskRecord() {
    $("#menupark").empty();
    $('#taskProcessShow').dialog('close')
    $("#taskProcessFormShow").form('clear');
}

function openTaskProcessRecord(row) {
    //如果 row有值
    if (row) {
        tprecordID = row.记录id;
        $.ajax({
            url: g_url_head + '/configureAjax?id=15&foreign=' + tprecordID,
            dataType: "json",
            async: false,
            success: function (r) {
                if (r.length == 0) {
                    layer.msg("不存在该记录id ");
                } else {
                    $('#srecord_id').textbox('setValue', tprecordID);
                    $('#soperators_name').textbox('setValue', r[0].operators_name);
                    $('#sjob_content').textbox('setValue', r[0].job_content);
                    $('#sstart_date').textbox('setValue', r[0].start_date);
                    $('#splan_end_date').textbox('setValue', r[0].plan_end_date);
                    $('#slssued_by').textbox('setValue', r[0].lssued_by);
                    $('#sfollow_questions').textbox('setValue', r[0].follow_questions_feedback);
                    if (r[0].task_situation == null) {//作业人还未填写
                        $("#stask_situation").textbox({readonly: false});
                        $("#reviewertpr").hide();
                        tprflag = 1;//作业人提交
                    } else if (r[0].feedback_source == null)//审核人还未填写
                    {
                        tprflag = 2;//审核人提交
                        $("#send_date").datebox({readonly: false});
                        $("#send_remark").textbox({readonly: false});
                        $('#stask_situation').textbox('setValue', r[0].task_situation);
                        $("#sfeedback_source").combobox({readonly: false});
                        $('#sfeedback_source').combobox({
                            disabled: false,
                            method: 'GET',
                            url: g_url_head + '/configureAjax?id=12',
                            valueField: 'score',
                            textField: 'score',
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
                                    $(this).combobox("setValue", data[0].score);
                                }
                            }
                        });
                    } else {
                        $('#stask_situation').textbox('setValue', r[0].task_situation);
                        $('#send_date').datebox('setValue', r[0].end_date);
                        $('#sfeedback_source').combobox('setValue', r[0].feedback_source);
                        $('#send_remark').textbox('setValue', r[0].end_remark);
                        $("#taskProcessRecordDetail").hide();
                    }
                }
            }
        });
        $("#taskProcessRecordShow").dialog("open");
        // '$("' + name + '").textbox({multiline:true,height:"50px"});';
    }
}


function submitTaskProcessRecordCommitS() {
    if (tprflag == 1) {//作业人提交
        var soperators_name = $('#soperators_name').textbox('getValue');
        var userName = getUserName();

        if (soperators_name != userName) {
            layer.msg("不是该作业人,无法提交")
            return;
        }

        var stask_situation = " [ " + getCurrentTime() + " ] " + $('#stask_situation').textbox('getValue');
        if (stask_situation == "") {
            layer.msg("请填写作业完成情况")
            return;
        }

        var data = {
            tableName: "t_avc_record",
            anyFieldValue: "task_situation = '" + stask_situation + "'",
            foreignName: "record_id",
            foreignValue: tprecordID
        };
        $.ajax({
            type: "post",
            url: g_url_head + '/configureUpdate',
            dataType: 'json',
            data: data,
            success: function (data) {
                if (data.success == 1) {
                    layer.msg("提交成功");
                    closeTaskProcessRecord()
                    executeClick()
                } else {
                    layer.msg("提交失败");
                }
            }
        });
    } else if (tprflag == 2) {
        var slssued_by = $('#slssued_by').textbox('getValue');
        var userName = getUserName();
        if (slssued_by != userName) {
            layer.msg("不是该审核人,无法提交")
            return;
        }
        var send_date = $('#send_date').textbox('getValue');
        var sfeedback_source = $('#sfeedback_source').textbox('getValue');
        var send_remark = $('#send_remark').textbox('getValue');
        if (send_date == "") {
            layer.msg("请填写确认完成时间")
            return;
        }
        var data = {
            tableName: "t_avc_record",
            anyFieldValue: "end_date = '" + send_date + "',feedback_date = '" + getCurrentTime() + "',feedback_source = '" + sfeedback_source + "'," +
                "end_remark = '" + send_remark + "'",
            foreignName: "record_id",
            foreignValue: tprecordID
        };
        $.ajax({
            type: "post",
            url: g_url_head + '/configureUpdate',
            dataType: 'json',
            data: data,
            success: function (data) {
                if (data.success == 1) {
                    layer.msg("提交成功");
                    closeTaskProcessRecord()//avc_人员作业审核人待办
                    executeClick()
                } else {
                    layer.msg("提交失败");
                }
            }
        });
    }
}

function executeClick() {
    var allSql = editor.getValue();
    if (allSql == "") {
    } else {
        var sqlNameCompare = getSqlTableName(allSql);
        if ((sqlNameCompare.indexOf("ownfunc_") != -1) || (sqlNameCompare.indexOf("multiline_") != -1)) {
        } else {
            $('#execute').click();
        }
    }
}


function closeTaskProcessRecord() {
    tprflag = null;
    tprecordID = null;
    $("#send_remark").textbox({readonly: true});
    $("#send_date").datebox({readonly: true});
    $("#sfeedback_source").combobox({readonly: true});
    $("#stask_situation").textbox({readonly: true});
    $("#taskProcessRecordFormShow").form('clear');
    $('#taskProcessRecordShow').dialog('close')
    $("#taskProcessRecordDetail").show();
    $("#reviewertpr").show();
}