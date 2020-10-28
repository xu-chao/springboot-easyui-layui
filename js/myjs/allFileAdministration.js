/**
 * all_文件管理 对应启动函数
 * <!-- 全局文件上传 -->
 */

function openFileTypeAllocation() {
    $('#fileTypeAllocation').combobox(
        {
            disabled: false,
            method: 'GET',
            url: g_url_head+'/configureFunc?id=22',
            prompt: '请填入类型名称',
            valueField: 'id',
            textField: 'name',
            panelHeight: 'auto',
            panelMaxHeight: 150,
            editable: false,
            onLoadSuccess: function () {
                var data = $("#fileTypeAllocation").combobox('getData');
                if (data.length > 0) {
                    $("#fileTypeAllocation").combobox('select', data[0].name);
                }
            },
            onSelect: function (record) {
                var id = record.id;
                $('#fileDetailTypeAllocation').combobox({
                    disabled: false,
                    method: 'GET',
                    url:  g_url_head+'/configureSecond?id=23&foreign=' + id,
                    prompt: '请先填入文件详细类型名称',
                    valueField: 'id',
                    textField: 'name',
                    panelHeight: 'auto',
                    panelMaxHeight: 150,
                    editable: false,
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

    $('#fileTypeAllocationPark').combobox(
        {
            disabled: false,
            method: 'GET',
            url:  g_url_head+'/configureFunc?id=6',
            prompt: '请填入公园名称',
            valueField: 'id',
            textField: 'name',
            panelHeight: 'auto',
            panelMaxHeight: 150,
            editable: false,
            onLoadSuccess: function () {
                var data = $("#fileTypeAllocationPark").combobox('getData');
                if (data.length > 0) {
                    $("#fileTypeAllocationPark").combobox('select', data[0].name);
                }
            },
            onSelect: function (record) {
                var id = record.id;
                $('#fileTypeAllocationProject').combobox({
                    disabled: false,
                    method: 'GET',
                    url:  g_url_head+'/configureSecond?id=7&foreign=' + id,
                    prompt: '请先填入公园名称',
                    valueField: 'id',
                    textField: 'name',
                    panelHeight: 'auto',
                    panelMaxHeight: 150,
                    editable: false,
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

    $('#fileDetailTypeAllocationZgb').combobox(
        {
            disabled: false,
            method: 'GET',
            url:  g_url_head+'/configureFunc?id=20',
            prompt: '请填入类型名称',
            valueField: 'id',
            textField: 'name',
            panelHeight: 'auto',
            panelMaxHeight: 150,
            editable: false,
            onLoadSuccess: function () {
                var data = $("#fileDetailTypeAllocationZgb").combobox('getData');
                if (data.length > 0) {
                    $("#fileDetailTypeAllocationZgb").combobox('select', data[0].name);
                }
            },
        });
}

function uploadAll() {
    var edition = 'Latest';
    //得到上传文件的全路径
    var name = $('#name').textbox('getValue');
    var fileName = $('#uploadAllFile').filebox('getValue');
    //进行基本校验
    if (fileName == "") {
        layer.msg("请选择上传文件！");
    } else if (name == "") {
        layer.msg("请填写文件名称！");
    } else {
        var suffix = /\.[^\.]+$/.exec(fileName);
        var files = $("#uploadAllFile").next().find('input[type=file]')[0].files;
        if (files[0].size > 1024 * 1024 * 100) {
            layer.msg("上传文件不能大于100M！");
            return;
        }
        if (files[0]) {
            var formData = new FormData();
            formData.append("name", name);
            formData.append('file', files[0]);
            $.ajax({
                url: g_url_head+"/api/localStorage?edition=" + edition + "&per=" + username + "&role=" + role + "&deptname=" + deptname, //单文件上传
                type: 'POST',
                processData: false,
                contentType: false,
                async: false,
                cache: false,
                data: formData,
                beforeSend: function () {
                    $('#uploadSubmit').linkbutton('disable');
                    $("#dlg4").dialog("open").dialog("setTitle", "文件上传中...");
                    var value = 1;
                    $('#p').progressbar('setValue', value);
                    if (value < 100) {
                        ptime = window.setInterval(function () {
                            value += Math.floor(Math.random() * 8);
                            $('#p').progressbar('setValue', value);
                            if (value > 98) {
                                window.clearInterval(ptime);
                                $('#p').progressbar('setValue', 99);
                            }
                        }, 1500);
                    } else {
                        window.clearInterval(ptime);
                        $('#p').progressbar('setValue', 99);
                    }
                },
                success: function (json) {
                    var data = $.parseJSON(json);
                    if (data.success) {
                        if (ptime != null) {
                            window.clearInterval(ptime);
                        }
                        var audio = document.createElement("audio");
                        if (audio.canPlayType("audio/mp3")) {
                            audio.src = "ogg/upload.wav";
                        } else if (audio.canPlayType("audio/ogg")) {
                            audio.src = "ogg/upload.wav";
                        }
                        audio.play();
                        $('#p').progressbar('setValue', 100);
                        layer.confirm('文件上传成功!', {
                            closeBtn: 0,//不显示关闭按钮
                            btn: ['确认'] //按钮
                        }, function () {
                            $('#uploadSubmit').linkbutton('enable');
                            layer.closeAll(); //疯狂模式，关闭所有层
                            $("#uploadfilefrom")[0].reset();
                            layui.form.render();
                            editor.setValue("select 文件id,文件详细类别,文件备注名,文件格式,文件大小,文件基本类型,版本,管理人,文件下载地址,文件名,更新时间,部门id,部门 from all_文件管理 WHERE 文件id = '" + data.id + "' ORDER BY 文件id DESC");
                            $("#execute").click();
                            $("#uploadfilediv").dialog("close");
                            $("#dlg4").dialog("close");
                            // closeWin();
                        });
                    } else {
                        layer.msg("提示", "上传失败");
                    }
                },
                error: function (xhr, status, error) {
                    layer.msg("提示", "上传失败");
                }
            });
        }
    }
}


function assignFile(flag) {
    if (flag == 1) {
        var title = $('#fileAllocation').panel("options").title;
        var oldpath = $('#fileAllocation').panel("options").queryParams;
        var path1 = $('#fileTypeAllocation').combobox('getText');
        var path2 = $('#fileDetailTypeAllocation').combobox('getText');
        var data = $('#fileDetailTypeAllocation').combobox('getValue');
        var path = path1 + "->" + path2;
        var sqlValue = data + ";" + g_fileID + ";" + path1 + "->" + path2;
    } else if (flag == 2) {
        var title = $('#fileAllocationZgb').panel("options").title;
        var oldpath = $('#fileAllocationZgb').panel("options").queryParams;
        var path1 = $('#fileTypeAllocationPark').combobox('getText');
        var data1 = $('#fileTypeAllocationPark').combobox('getValue');
        var path2 = $('#fileTypeAllocationProject').combobox('getText');
        var data2 = $('#fileTypeAllocationProject').combobox('getValue');
        var path3 = $('#fileDetailTypeAllocationZgb').combobox('getText');
        var data3 = $('#fileDetailTypeAllocationZgb').combobox('getValue');
        var data = data1 + "-" + data2 + "-" + data3;
        var path = path1 + "->" + path2 + "->" + path3;
        var sqlValue = data + ";" + g_fileID + ";" + path;
    }
    if (!(data != null && g_fileID != null)) {
        layer.msg("请选择文件详细类型!");
        return;
    }
    if (title == '新增') {
        $.ajax({
            type: "post",
            url: g_url_head+'/configureSave',
            dataType: 'json',
            data: {id: 21, sqlValue: sqlValue},
            success: function (data) {
                if (data.success == 1) {
                    layer.msg("保存成功");
                    resetUploadAllocationForm(flag);
                    // $('#sqldata').datagrid("reload");
                    datagrid_refresh(editor.getValue());
                } else {
                    layer.msg("保存失败");
                }
            }
        })
    } else if (title == '修改') {
        $.ajax({
            type: "post",
            url: g_url_head+'/editMc',
            dataType: 'json',
            data: {fileId: g_fileID, mc: data, oldpath: oldpath, newpath: path},
            success: function (data) {
                if (data.success == 1) {
                    layer.msg("修改成功");
                    resetUploadAllocationForm(flag);
                    // $('#sqldata').datagrid("reload");
                    datagrid_refresh(editor.getValue());
                } else {
                    layer.msg("修改失败");
                }
            }
        })
    }
}


function resetUploadAllocationForm(flag) {
    if (flag == 1) {
        $('#fileAllocation').dialog('close');
        $('#fileAllocationfrom').form('clear');
    } else if (flag == 2) {
        $('#fileAllocationZgb').dialog('close');
        $('#fileAllocationfromZgb').form('clear');
    }
};

function resetUploadForm() {
    $('#uploadfilediv').dialog('close');
    $('#uploadfilefrom').form('clear');
    $('#uploadSubmit').linkbutton('enable');
};