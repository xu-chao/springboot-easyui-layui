// $(' + name + ').textbox({ prompt: \'输入完Enter键触发\'});';
var tanshangflag = 0;//判断探伤第几步流程
var tanshangsearchVal = null;//输入的系统单号
var approMan = null;//审批人
flawData = [{name: "临时探伤"}, {name: "定检探伤"}, {name: "延寿探伤"}]
$(function () {
    $('#system_nos').textbox('textbox').keydown(function (e) {
        if (e.keyCode == 13) {
            var systemno = $('#system_nos').val();
            takeTanshangDatas(systemno);
        }
    });
});

function takeTanshangDatas(systemno) {
    tanshangsearchVal = systemno;
    clearTanshangApproal();//先清空
    $('#system_nos').textbox('setValue', tanshangsearchVal);
    $.ajax({
        url: g_url_head + '/configureAjax?id=30&foreign=' + tanshangsearchVal,
        dataType: "json",
        async: false,
        xhrFields: {
            withCredentials: true
        },
        success: function (r) {
            if (r.length == 0) {
                layer.msg("不存在该系统单号 ");
                $("#RowsFormShow").form('clear');
            } else {
                $('#apply_times').textbox('setValue', r[0].apply_time);
                $('#apply_mans').textbox('setValue', r[0].apply_man);
                $('#job_nos').textbox('setValue', r[0].job_no);
                $('#corporate_names').textbox('setValue', r[0].corporate_name);
                $('#appli_departments').textbox('setValue', r[0].appli_department);
                $('#equipment_names').textbox('setValue', r[0].equipment_name);
                $('#number_equipments').textbox('setValue', r[0].number_equipment);
                $('#flaw_dbegins').textbox('setValue', r[0].flaw_dbegin);
                $('#flaw_dends').textbox('setValue', r[0].flaw_dend);
                $('#flaw_places').textbox('setValue', r[0].flaw_place);
                var strs = new Array(); //定义一数组
                strs = r[0].ts_sblx.split(";"); //字符分割
                for (i = 0; i < strs.length - 1; i++) {
                    debugger
                    var temp = "#ts_sblx" + strs[i];
                    $(temp).prop("checked", true);

                }
                tanshangsearchVal = r[0].system_no;
                $('#dgrowsShow').datagrid({
                    url: g_url_head + '/configureAjax?id=31&foreign=' + tanshangsearchVal,
                });
                $.ajax({
                    url: g_url_head + '/configureAjax?id=32&foreign=' + tanshangsearchVal,
                    dataType: "json",
                    async: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (r) {
                        //处理人1
                        $('#tshender1').html(r[0].handler1);
                        $('#tsstate1').html("已完成");//状 态
                        var flag = false;
                        //如果 总工办派单 没有值，判定为 总工办派单 审批中
                        if ((r[0].handler3 == null) || (r[0].handler3 == "")) {
                            if (deptname == 21) {//如果部门为总工办 3  总工办-技术中心
                                approMan = '#handler2';
                                $("#tsremarks2").textbox({disabled: false});
                                $("#tsremarks2").textbox('setValue', '');
                                $('#tsremarks2').textbox('textbox').css('background', '#F0F0F0');
                                flag = true;
                                tanshangflag = 2;
                            }

                        } else if ((r[0].handler4 == null) || (r[0].handler4 == "")) {  //如果 工厂接单 没有值，判定为 工厂接单 审批中
                            approMan = '#handler3';
                            var tsusername = r[0].handler3.split(";");
                            $("#tsremarks2").textbox('setValue', r[0].remarks2);
                            $('#tshender2').html(r[0].handler2);//处理人
                            $('#tsstate2').html("已完成");//状 态
                            $('#tshender3').html(r[0].handler3);//处理人3
                            if (username == tsusername[1]) {//判断当前账号=审批人账号 开启可编辑
                                $("#tsremarks3").textbox({disabled: false});
                                $("#tsremarks3").textbox('setValue', '');
                                $('#tsremarks3').textbox('textbox').css('background', '#F0F0F0');
                                flag = true;
                                tanshangflag = 3;
                            }

                        } else if ((r[0].handler5 == null) || (r[0].handler5 == "")) {//设备探伤 审批
                            approMan = '#handler4';//下拉框4
                            var tsusername = r[0].handler4.split(";");
                            $("#tsremarks2").textbox('setValue', r[0].remarks2);//备注2
                            $('#tshender2').html(r[0].handler2);//处理人2
                            $('#tsstate2').html("已完成");//状 态 2
                            $('#tshender3').html(r[0].handler3);//处理人3
                            $("#tsremarks3").textbox('setValue', r[0].remarks3);//备注3
                            $('#tsstate3').html("已完成");//状 态 3

                            $('#tshender4').html(r[0].handler4);//处理人4
                            if (username == tsusername[1]) {//判断当前账号=审批人账号 开启可编辑
                                $("#tsremarks4").textbox({disabled: false});
                                $("#tsremarks4").textbox('setValue', '');
                                $('#tsremarks4').textbox('textbox').css('background', '#F0F0F0')
                                flag = true;
                                tanshangflag = 4;
                            }
                        } else if (r[0].handler5 != null) { //报告编制
                            var tsusername = r[0].handler5.split(";");
                            $("#tsremarks2").textbox('setValue', r[0].remarks2);//备注2
                            $('#tshender2').html(r[0].handler2);//处理人2
                            $('#tsstate2').html("已完成");//状 态 2

                            $('#tshender3').html(r[0].handler3);//处理人3
                            $("#tsremarks3").textbox('setValue', r[0].remarks3);//备注3
                            $('#tsstate3').html("已完成");//状 态 3

                            $('#tshender4').html(r[0].handler4);//处理人4
                            $("#tsremarks4").textbox('setValue', r[0].remarks4);//备注4
                            $('#tsstate4').html("已完成");//状 态 4

                            $('#tshender5').html(r[0].handler5);//处理人5

                            if (r[0].over_flag == "t") {//结束流程
                                $("#tsremarks5").textbox('setValue', r[0].remarks5);//备注4
                                $('#tsstate5').html("已完成");//状 态 5
                                $("#tsshowfile1").hide()//表示display:none;
                            } else if (username == tsusername[1]) {//判断当前账号=审批人账号 开启可编辑
                                $("#tsremarks5").textbox({disabled: false});
                                $("#tsremarks5").textbox('setValue', '');
                                $('#tsremarks5').textbox('textbox').css('background', '#F0F0F0');
                                tanshangflag = 5;
                                $("#confirmrowsShow").show()//表示display:none;
                                $("#tsshowfile1").show()//表示display:none;
                            }

                        }
                        if (flag) {
                            $("#confirmrowsShow").show()//显示提交按钮
                            $(approMan).combobox({
                                disabled: false,
                                method: 'GET',
                                // url: g_url_head + '/getUserNameByDept?deptid=' + deptname,
                                url: g_url_head + '/getUserNameByDept?deptid=5',
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
                            $(approMan).textbox('textbox').css('background', '#F0F0F0')
                        }
                    }
                });
            }
        }
    });
}

function closeWinRowsShow() {
    $('#winrowsShow').dialog('close')
    tanshangsearchVal = null;
    clearTanshangApproal();
}

function clearTanshangApproal(row) {
    $("#dgrowsShow").datagrid("loadData", []);
    $("#RowsFormShow").form('clear');
    $("#tanshangApproval").form('clear');
    $('#tsstate1').html("待处理");
    $('#tsstate2').html("待处理");
    $('#tsstate3').html("待处理");
    $('#tsstate4').html("待处理");
    $('#tsstate5').html("待处理");
    $('#tshender1').html("");
    $('#tshender2').html("");
    $('#tshender3').html("");
    $('#tshender4').html("");
    $('#tshender5').html("");
    tanshangflag = 0;
    $("#tsremarks2").textbox({disabled: true});
    $("#tsremarks3").textbox({disabled: true});
    $("#tsremarks4").textbox({disabled: true});
    $("#tsremarks5").textbox({disabled: true});
    $('#tsremarks2').textbox('textbox').css('background', '#FFFFFF');
    $('#tsremarks3').textbox('textbox').css('background', '#FFFFFF');
    $('#tsremarks4').textbox('textbox').css('background', '#FFFFFF');
    $('#tsremarks5').textbox('textbox').css('background', '#FFFFFF');
    $("#handler2").textbox('textbox').css('background', '#FFFFFF');
    $("#handler3").textbox('textbox').css('background', '#FFFFFF');
    $("#handler4").textbox('textbox').css('background', '#FFFFFF');
    $("#handler2").combobox({disabled: true});
    $("#handler3").combobox({disabled: true});
    $("#handler4").combobox({disabled: true});
    $("#confirmrowsShow").hide()//显示提交按钮
    $("#tsshowfile1").hide()//表示display:none;
    clearTsEditFile();
    approMan = null;
}

function formatItem(row) {
    var s = '<span style="font-weight:bold">' + row.name + '</span><br/>' +
        '<span style="color:#888">' + row.id + '</span>';
    return s;
}

//探伤
function submitFormRowsShow() {
    if (approMan == null) {
    } else {
        var tscombobox = $(approMan).combobox('getText');
        if (tscombobox == "") {
            layer.msg("请指定审批人")
            return;
        }
    }

    var tsfieldvalue;//要更新的字段
    if (tanshangflag == 2) {//流程2
        var tshanderusername;
        //查找 操作人的 姓名
        $.ajax({
            url: g_url_head + '/configureAjax?id=1&foreign=' + username,
            dataType: "json",
            async: false,
            xhrFields: {
                withCredentials: true
            },
            success: function (r) {
                tshanderusername = r[0].operators_name + ";" + username
            }
        });
        var tstsremarks2 = $("#tsremarks2").val();
        var tshandler3 = $('#handler2').combobox('getText') + ";" + $('#handler2').combobox('getValue');
        tsfieldvalue = "handler2 = '" + tshanderusername + "',remarks2 = '" + tstsremarks2 + "',handler3 = '" + tshandler3 + "'";
    } else if (tanshangflag == 3) {//流程3
        var tstsremarks3 = $("#tsremarks3").val();
        var tshandler4 = $('#handler3').combobox('getText') + ";" + $('#handler3').combobox('getValue');
        tsfieldvalue = "handler4 = '" + tshandler4 + "',remarks3 = '" + tstsremarks3 + "'";

    } else if (tanshangflag == 4) {//流程4
        var tstsremarks4 = $("#tsremarks4").val();
        var tshandler5 = $('#handler4').combobox('getText') + ";" + $('#handler4').combobox('getValue');
        tsfieldvalue = "handler5 = '" + tshandler5 + "',remarks4 = '" + tstsremarks4 + "'";

    } else if (tanshangflag == 5) {//流程5
        var tstsremarks5 = $("#tsremarks5").val();
        tsfieldvalue = "remarks5 = '" + tstsremarks5 + "',over_flag = 't'";
    }
    var tsdatas = {
        tableName: "t_amusement_facilities_approl", anyFieldValue: tsfieldvalue,
        foreignName: "system_no", foreignValue: tanshangsearchVal
    };
    $.ajax({
        type: "post",
        url: g_url_head + '/configureUpdate',
        dataType: 'json',
        data: tsdatas,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (data.success == 1) {
                layer.confirm('保存成功!', {
                    closeBtn: 0,//不显示关闭按钮
                    btn: ['确认'] //按钮
                }, function () {
                    layer.close(layer.index);
                    clearTanshangApproal();
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


    // $.ajax({
    //     type: "post",
    //     url: g_url_head + '/saveAmusementHead',
    //     dataType: 'json',
    //     data: values,
    //     success: function (r) {
    //         if (r.success == 1) {
    //             var stringData = JSON.stringify(lists);
    //             $.ajax({
    //                 type: "post",
    //                 url: g_url_head + '/saveAmusementBody',
    //                 dataType: 'json',
    //                 data: stringData,
    //                 success: function (r) {
    //                     if (r.success == 1) {
    //                         layer.confirm('保存成功!', {
    //                             closeBtn: 0,//不显示关闭按钮
    //                             btn: ['确认'] //按钮
    //                         }, function () {
    //                             layer.close(layer.index);
    //                             closeWinRows();
    //                         });
    //                     } else {
    //                         layer.confirm('保存失败!', {
    //                             closeBtn: 0,//不显示关闭按钮
    //                             btn: ['确认'] //按钮
    //                         }, function () {
    //                             layer.close(layer.index);
    //                         });
    //                     }
    //                 }
    //             })
    //         } else {
    //             layer.confirm('保存失败!', {
    //                 closeBtn: 0,//不显示关闭按钮
    //                 btn: ['确认'] //按钮
    //             }, function () {
    //                 layer.close(layer.index);
    //             });
    //         }
    //     }
    // })

}

//探伤审批 开启窗口动作
function openWinShowBefore(row) {
    $('#dgrowsShow').datagrid({
        url: '',
        striped: true,     //交替行换色
        fit: true,
        columns: [[
            {field: 'entry_name', title: '项目名称', width: 100},
            {field: 'dpart_name', title: '部件名称/编号', width: 100},
            {field: 'material_quality', title: '材质', width: 100},
            {field: 'total', title: '总数', width: 100},
            {field: 'flaw_num', title: '探伤数量', width: 100},
            {field: 'flaw_method', title: '探伤方法', width: 100},
            {field: 'flaw_type', title: '探伤类型', width: 100},
        ]]
    });
    $('#winrowsShow').dialog({
        title: '运行函数',
        width: 1050,
        height: 620,
        top: 50,
        closed: false,//显示对话框
        cache: false,
        modal: true,
        closable: false,
        resizable: true
    });
    $('#winrowsShow').window('center');//使Dialog居中显示
    if (row) {
        var systemno = row.系统单号;
        takeTanshangDatas(systemno);
    }
}

function tsshowupload(type) {
    var index = layer.open({
        type: 1,
        title: '文件查看',
        content: $('#tsshowfilediv'),
        id: 'tsshowfiledivarea',
        area: ['800px', '360px'],//宽高不影响最大化
        success: function (layero, index) {
            var tsdata = [];
            if (tanshangsearchVal == null) {
            } else {
                $.ajax({
                    type: "GET",
                    url: g_url_head + '/configureAjax',//读取函数
                    data: {id: 33, foreign: tanshangsearchVal},
                    dataType: "json",
                    async: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (r) {
                        r.forEach(function (value, index, array) {
                            if ((value.file_flag == type)) {
                                tsdata.push(value);
                            }
                        })
                    }
                })
            }
            layui.use('table', function () {
                var table = layui.table;
                table.render({
                    id: 'tsshowfiledtable1'
                    , elem: '#tsshowfiledtable'
                    , data: tsdata
                    , cellMinWidth: 80 //全局定义常规单元格的最小宽度，layui 2.2.1 新增
                    , cols: [[
                        {field: 'id', title: 'ID', width: 80, sort: true, align: 'center'}
                        , {field: 'file_name', width: 120, title: '文件名称', align: 'center'} //width 支持：数字、百分比和不填写。你还可以通过 minWidth 参数局部定义当前单元格的最小宽度，layui 2.2.1 新增
                        , {field: 'file_format', width: 100, title: '文件格式', sort: true}
                        , {field: 'file_size', width: 100, title: '文件大小', align: 'center'}
                        , {field: 'file_date', width: 120, title: '文件日期', align: 'center'}
                        , {
                            field: 'file_download', width: 173, title: '文件下载', align: 'center',
                            templet: function (res) {
                                return "<a href='" + g_url_head + "/file/" + res.file_format + "/" + res.file_download + "' download='' target='_blank' style='color: yellowgreen'>下载</a>";
                            }
                        } //单元格内容水平居中
                    ]]
                });
            });
        },
        end: function () {

        }
    });

    // $("#tsuploadfilediv").dialog("open").dialog("setTitle", "文件上传(50M以内)");
}

function tanshangrollback(row) {
    var systemno = row.系统单号;

    if ((systemno == null) || (systemno == "")) {
        layer.msg("未获取到该系统单号")
    }
    var usernamc = getUserName();
    if (deptname == 21) {//总工办技术中心
    } else {
        if (usernamc != row.申请人) {
            layer.msg("不是该审核人员，没有权限")
            return
        }
    }

    layer.confirm('您确定要将「' + systemno + '」计划单号 撤销吗？', {
        btn: ['确定', '取消'] //按钮
    }, function () {
        var tsdata = {
            tableName: "t_amusement_facilities_approl",   //指定下一个人审批人工号
            anyFieldValue: "handler1 = null ,handler2 = null,remarks2 = null,handler3 = null" +
                ",remarks3 = null,handler4 = null,remarks4 = null,handler5 = null," +
                "remarks5 = null,over_flag = null",
            foreignName: "system_no",
            foreignValue: systemno
        };
        $.ajax({
            type: "post",
            url: g_url_head + '/configureUpdate',
            dataType: 'json',
            data: tsdata,
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

function tanshangDelete(row) {
    var systemno = row.系统单号;
    if ((systemno == null) || (systemno == "")) {
        layer.msg("未获取到该系统单号")
    }
    var usernamc = getUserName();
    if (deptname == 21) {//总工办技术中心
    } else {
        if (usernamc != row.申请人) {
            layer.msg("不是该审核人员，没有权限")
            return
        }
    }

    layer.confirm('您确定要将「' + systemno + '」计划单号 撤销吗？', {
        btn: ['确定', '取消'] //按钮
    }, function () {
        var data = {
            tableName: "t_amusement_facilities_head",
            foreignName: "system_no",
            foreignValue: systemno
        };
        var data1 = {
            tableName: "t_amusement_facilities_file",
            foreignName: "system_no",
            foreignValue: systemno
        };
        $.ajax({
            type: "post",
            url: g_url_head + '/configureDelete',
            dataType: 'json',
            data: data,
            success: function (data) {
                if (data.success == 1) {
                    $.ajax({
                        type: "post",
                        url: g_url_head + '/configureDelete',
                        dataType: 'json',
                        data: data1,
                        success: function (data) {
                            if (data.success == 1) {
                                layer.msg("删除成功");
                                $('#execute').click();
                            } else {
                                layer.msg("删除失败");
                            }
                        }
                    });
                } else {
                    layer.msg("删除失败");
                }
            }
        });
    });

}
