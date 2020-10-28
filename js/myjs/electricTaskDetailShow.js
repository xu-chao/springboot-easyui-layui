var edsFlag = 0;//流程
var etdsystem_nos = null;

function openElectricTaskDetail(row) {

    //如果 row有值
    if (row) {
        etdsystem_nos = row.系统单号;
        $.ajax({
            url: g_url_head + '/configureAjax?id=58&foreign=' + etdsystem_nos,
            dataType: "json",
            async: false,
            success: function (r) {
                if (r.length == 0) {
                    layer.msg("不存在该系统单号 ");
                } else {
                    $('#eplan_odd').textbox('setValue', r[0].plan_odd);
                    $('#eengin_name').textbox('setValue', r[0].engin_name);
                    $('#eproj_name').textbox('setValue', r[0].proj_name);
                    $('#esystem').textbox('setValue', r[0].system);
                    $('#esub_project').textbox('setValue', r[0].sub_project);
                    $('#eunit1').textbox('setValue', r[0].unit1);
                    $('#enumber1').textbox('setValue', r[0].number1);


                    $('#eelec_name').textbox('setValue', r[0].elec_name);
                    $('#especification').textbox('setValue', r[0].specification);
                    $('#eunit2').textbox('setValue', r[0].unit2);
                    $('#enumber2').textbox('setValue', r[0].number2);
                    $('#etype_work').textbox('setValue', r[0].type_work);
                    $('#etype').textbox('setValue', r[0].type);
                    $('#eaname').textbox('setValue', r[0].aname);
                    $('#econstruc_text').html(r[0].construc_text);
                    $('#etdapproltext').html(r[0].approltext);
                    $('#econstruc_text').textbox('setValue', r[0].construc_text);
                    // $('#eremarks').textbox('setValue', r[0].remarks);
                    if (r[0].zhi_s_d == null) {
                        $("#ezhi_s_d").datebox({readonly: false});
                        $("#ezhi_j_d").datebox({readonly: false});
                        edsFlag = 3;

                    } else if (r[0].cname == null) {
                        $('#ezhi_s_d').textbox('setValue', r[0].zhi_s_d);
                        $('#ezhi_j_d').textbox('setValue', r[0].zhi_j_d);
                        $('#ebname').textbox('setValue', r[0].bname);

                        edsFlag = 1;
                        $("#eins_p_h").numberbox({readonly: false});
                        $("#eins_t_h").numberbox({readonly: false});
                        $("#etask_odd").textbox({readonly: false});
                        $("#eins_p_d").datebox({readonly: false});
                        $("#eins_s_d").datebox({readonly: false});
                        $("#etype_work").textbox({readonly: false});
                    } else {
                        $('#etask_odd').textbox('setValue', r[0].task_odd);
                        $('#ebname').textbox('setValue', r[0].bname);
                        $('#ecname').textbox('setValue', r[0].cname);
                        $('#ezhi_s_d').textbox('setValue', r[0].zhi_s_d);
                        $('#ezhi_j_d').textbox('setValue', r[0].zhi_j_d);
                        $('#eins_p_h').textbox('setValue', r[0].ins_p_h);
                        $('#eins_t_h').textbox('setValue', r[0].ins_t_h);
                        $('#eins_p_d').textbox('setValue', r[0].ins_p_d);
                        $('#eins_s_d').textbox('setValue', r[0].ins_s_d);
                        if ((r[0].dname == "")||(r[0].dname == null)) {
                            edsFlag = 2;
                            $("#eitem_w_h").numberbox({readonly: false});
                            $("#eitem_s_d").datebox({readonly: false});
                            $("#eitem_c_d").datebox({readonly: false});
                            $("#estate").textbox({readonly: false});
                            $("#eexplain").textbox({readonly: false});
                            $('#edname').textbox('setValue', r[0].dname);
                            $('#eitem_w_h').textbox('setValue', r[0].item_w_h);
                            $('#eitem_s_d').textbox('setValue', r[0].item_s_d);
                            $('#eitem_c_d').textbox('setValue', r[0].item_c_d);
                            $('#estate').textbox('setValue', r[0].state);
                            $('#eexplain').textbox('setValue', r[0].explain);
                        } else {
                            $('#edname').textbox('setValue', r[0].dname);
                            $('#eitem_w_h').textbox('setValue', r[0].item_w_h);
                            $('#eitem_s_d').textbox('setValue', r[0].item_s_d);
                            $('#eitem_c_d').textbox('setValue', r[0].item_c_d);
                            $('#estate').textbox('setValue', r[0].state);
                            $('#eexplain').textbox('setValue', r[0].explain);
                            if (r[0].ename == null) {
                                $("#eeappro").combobox({readonly: false});
                                $("#eeremarks").textbox({readonly: false});
                                edsFlag = 4;
                            } else {
                                $('#eeappro').textbox('setValue', r[0].eappro);
                                $('#eeremarks').textbox('setValue', r[0].eremarks);
                                $('#eename').textbox('setValue', r[0].ename);
                            }
                        }
                    }

                }
            }
        })
    } else {

        $("#eplan_odd").textbox({readonly: false});
        $("#eengin_name").textbox({readonly: false});
        $("#eproj_name").textbox({readonly: false});
        $("#esystem").textbox({readonly: false});
        $("#esub_project").textbox({readonly: false});
        $("#eunit1").textbox({readonly: false});
        $("#enumber1").textbox({readonly: false});
        $("#etask_odd").textbox({readonly: false});
        $("#eelec_name").textbox({readonly: false});
        $("#especification").textbox({readonly: false});
        $("#eunit2").textbox({readonly: false});
        $("#enumber2").textbox({readonly: false});
    }
    $("#electricTaskDetailShow").dialog("open");
}

//酒店物料申请编辑 提交表单
function submitElectricTaskDetail() {
    var data = null;
    if (edsFlag == 3) {
        if(deptname!=1){
            layer.msg("没有提交权限")
            return;
        }
        var zhi_s_d = $('#ezhi_s_d').datebox('getValue');
        var zhi_j_d = $('#ezhi_j_d').datebox('getValue');
        if (zhi_s_d == "") {
            layer.msg("请填写 指定开始时间")
            return;
        }
        if (zhi_j_d == "") {
            layer.msg("请填写 指定结束时间")
            return;
        }
        data = {
            tableName: "t_electric_task_detail",
            anyFieldValue: "zhi_s_d = '" + zhi_s_d + "',zhi_j_d = '" + zhi_j_d
                + "',bname = '" + getUserName() + "'",
            foreignName: "system_no",
            foreignValue: etdsystem_nos
        };
    } else if (edsFlag == 1) {
        if(deptname!=31){
            layer.msg("没有提交权限")
            return;
        }
        var eins_p_h = $('#eins_p_h').numberbox('getValue');
        var eins_t_h = $('#eins_t_h').numberbox('getValue');
        var eins_p_d = $('#eins_p_d').datebox('getValue');
        var eins_s_d = $('#eins_s_d').datebox('getValue');
        var etask_odd = $('#etask_odd').textbox('getValue');
        var etype_work = $('#etype_work').textbox('getValue');
        if (eins_p_h == "") {
            eins_p_h =null;
            }
        if (eins_t_h == "") {
            eins_t_h =null;
            }
        // if (eins_p_h == "") {
        //     layer.msg("请填写 计划单项工时")
        //     return;
        // }
        // if (eins_t_h == "") {
        //     layer.msg("请填写 计划总工时")
        //     return;
        // }
        if (eins_p_d == "") {
            layer.msg("请填写 制单日期")
            return;
        }
        if (eins_s_d == "") {
            layer.msg("请填写 发现场日期")
            return;
        }
        if (etask_odd == "") {
            layer.msg("请填写 任务单号")
            return;
        }
        data = {
            tableName: "t_electric_task_detail",
            anyFieldValue: "type_work = '" + etype_work + "',ins_p_h = " + eins_p_h + ",ins_t_h = " + eins_t_h
                + ",ins_p_d = '" + eins_p_d + "',ins_s_d = '" + eins_s_d + "'" +
                ",cname = '" + getUserName() + "',task_odd = '"+etask_odd+"'",
            foreignName: "system_no",
            foreignValue: etdsystem_nos
        };
    } else if (edsFlag == 2) {
        if(deptname!=32){
            layer.msg("没有提交权限")
            return;
        }
        var eitem_w_h = $('#eitem_w_h').numberbox('getValue');
        var eitem_s_d = $('#eitem_s_d').datebox('getValue');
        var eitem_c_d = $('#eitem_c_d').datebox('getValue');
        var estate = $('#estate').textbox('getValue');
        var eexplain = $('#eexplain').textbox('getValue');
        if (eitem_s_d == "") {
            layer.msg("请填写 开始日期")
            return;
        }if (eitem_c_d == "") {
            layer.msg("请填写 完成日期")
            return;
        }  if (eitem_w_h == "") {
            layer.msg("请填写 实际工时")
            return;
        } if (estate == "") {
            layer.msg("请填写 状态")
            return;
        }
        var username = getUserName();
        var approltext = "CONCAT(approltext,'<br/>项目人⇒⇒" + username +"提交:("+getCurrentTime() +")')";

        data = {
            tableName: "t_electric_task_detail",
            anyFieldValue: "item_w_h = " + eitem_w_h + ",item_s_d = '" + eitem_s_d
                + "',item_c_d = '" + eitem_c_d + "',state = '" + estate + "',explain = '" + eexplain + "'" +
                ", dname = '" + getUserName() + "',approltext="+approltext+",ename = null",
            foreignName: "system_no",
            foreignValue: etdsystem_nos
        };
    }else if (edsFlag == 4) {
        if(deptname!=1){
            layer.msg("没有提交权限")
            return;
        }
        var eeappro = $('#eeappro').combobox('getValue');
        var eeremarks = $('#eeremarks').textbox('getValue');
        var username = getUserName();
        var approltext = "CONCAT(approltext,'<br/>审核人⇒⇒" + username +":"+eeappro+"；备注：【"+eeremarks+ "】("+getCurrentTime() +")')";
        var dname =  $('#edname').textbox('getValue');
        if(eeappro=="通过"){
            dname="'"+dname+"'";
        }else{
            dname =null;
        }

        data = {
            tableName: "t_electric_task_detail",
            anyFieldValue: "eappro = '" + eeappro + "',eremarks = '" + eeremarks +
                "', ename = '" + username + "',approltext ="+approltext+",dname = "+dname,
            foreignName: "system_no",
            foreignValue: etdsystem_nos
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
                layer.confirm('保存成功!', {
                    closeBtn: 0,//不显示关闭按钮
                    btn: ['确认'] //按钮
                }, function () {
                    layer.close(layer.index);
                    closeElectricTaskDetail();
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

function closeElectricTaskDetail() {
    edsFlag = 0;
    etdsystem_nos = null;
    $('#etdapproltext').html("");//状 态
    $("#etask_odd").textbox({readonly: true});
    $("#eeappro").combobox({readonly: true});
    $("#eeremarks").textbox({readonly: true});
    $("#ezhi_s_d").datebox({readonly: true});
    $("#ezhi_j_d").datebox({readonly: true});
    $("#eins_p_h").numberbox({readonly: true});
    $("#eins_t_h").numberbox({readonly: true});
    $("#eins_p_d").datebox({readonly: true});
    $("#eins_s_d").datebox({readonly: true});
    $("#eitem_w_h").numberbox({readonly: true});
    $("#eitem_s_d").datebox({readonly: true});
    $("#eitem_c_d").datebox({readonly: true});
    $("#estate").textbox({readonly: true});
    $("#eexplain").textbox({readonly: true});
    $("#etype_work").textbox({readonly: true});
    $("#electricTaskDetailFormShow").form('clear');
    $('#electricTaskDetailShow').dialog('close')
    $('#execute').click();
}
function electricTaskDelete(row) {
    var systemno = row.系统单号;
    if ((systemno == null) || (systemno == "")) {
        layer.msg("未获取到该系统单号")
        return
    }
    layer.confirm('您确定要将「' + row.计划单号 + '」计划单号 撤销吗？', {
        btn: ['确定', '取消'] //按钮
    }, function () {
        var data = {
            tableName: "t_electric_task_detail",
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
                    layer.msg("撤销成功");
                    $('#execute').click();
                } else {
                    layer.msg("撤销失败");
                }
            }
        });
    });

}

function t_avc_recordDelete(row) {
    var systemno = row.记录id;
    if ((systemno == null) || (systemno == "")) {
        layer.msg("未获取到该系统单号")
        return
    }
var usernamc = getUserName();
    if (usernamc != row.审核人员)  {
        layer.msg("不是该审核人员，没有权限")
        return
    }
    layer.confirm('您确定要将「' + systemno+ '」记录id 删除吗？', {
        btn: ['确定', '取消'] //按钮
    }, function () {
        var data = {
            tableName: "t_avc_record",
            foreignName: "record_id",
            foreignValue: systemno
        };
        $.ajax({
            type: "post",
            url: g_url_head + '/configureDelete',
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