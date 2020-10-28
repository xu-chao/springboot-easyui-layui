var editIndex = undefined;
var tseditsystem_no = "";//系统单号
let UPLOAD_FILES;
var UPLOAD_FILES1 = [];//文件上传成功 记录的 index,方便去除上传成功后的tr记录
var uploadListIns;//多文件上传
var demoListView;
function endEditing() {
    if (editIndex == undefined) {
        return true
    }
    if ($('#dgrows').datagrid('validateRow', editIndex)) {
        // var ed = $('#dgrows').datagrid('getEditor', {index:editIndex,field:'entry_name'});
        // var entry_name = $(ed.target).combobox('getText');
        // $('#dgrows').datagrid('getRows')[editIndex]['name'] = entry_name;
        $('#dgrows').datagrid('endEdit', editIndex);
        editIndex = undefined;
        return true;
    } else {
        return false;
    }

}

function onClickRow(index) {
    if (editIndex != index) {
        if (endEditing()) {
            // $('#dgrows').datagrid('selectRow', index)
            //     .datagrid('beginEdit', index);
            editIndex = index;
            $('#dgrows').datagrid('selectRow', index);
            $('#dgrows').datagrid('beginEdit', index);

        } else {
            $('#dgrows').datagrid('selectRow', editIndex);
        }
    }
}

//触发二级下拉框 点击展开数据时 请求远程数据 展示下拉框
function onBeginEdit(index, rowData) {
    //回车时结束编辑
    $('.datagrid-editable .textbox,.datagrid-editable .datagrid-editable-input,.datagrid-editable .textbox-text').bind('keyup', function (e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            if (endEditing()) {
                $('#dgrows').datagrid('acceptChanges');
            }
        }
    });
    //统计方法下拉框
    var smEditor = $('#dgrows').datagrid('getEditor', {
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
            var url = g_url_head +'/configureSecond?id=7&foreign=' + flawPlaceSelect
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
    if((rowData.entry_name==null)||(rowData.entry_name=="")){}else {
        $(smEditor.target).combobox('setValue', rowData.entry_name);
    }
}

function appendRows() {
    if (endEditing()) {
        tseditsystem_no = $("#system_no").textbox('getValue');
        $('#dgrows').datagrid('appendRow', {system_no: tseditsystem_no});
        editIndex = $('#dgrows').datagrid('getRows').length - 1;
        $('#dgrows').datagrid('selectRow', editIndex).datagrid('beginEdit', editIndex);
        // $('#dgrows').datagrid('selectRow', editIndex)
        //     .datagrid('beginEdit', editIndex);
        // $('#dgrows').datagrid('selectRow', editIndex);
        // $('#dgrows').datagrid('beginEdit', editIndex);
    }
}

function removeRows() {
    if (editIndex == undefined) {
        return
    }
    $('#dgrows').datagrid('cancelEdit', editIndex)
        .datagrid('deleteRow', editIndex);
    editIndex = undefined;
}

function acceptRows() {
    if (endEditing()) {
        $('#dgrows').datagrid('acceptChanges');
    }
}

function rejectRows() {
    $('#dgrows').datagrid('rejectChanges');
    editIndex = undefined;
}

function getChangesRows() {
    var rows = $('#dgrows').datagrid('getChanges');
    alert(rows.length + ' rows are changed!');
}

//探伤编辑 提交表单
    function submitFormRows() {
    var params = $('#RowsForm').serializeArray();
    var lists = $("#dgrows").datagrid('getRows');//获取所有行
    var ts_sblx = "";
    $("input[name='ts_sblx']:checked").each(function(i){
        ts_sblx +=$(this).val()+";"
    });
    if (lists.length == 0) {
        layer.msg("请填写明细")
        return;
    } else if (editIndex != undefined) {//判断 探伤表格是否 接受改变
        layer.msg("请点击 接受改变")
        return;
    }
    var apply_time = $("#apply_time").datebox("getValue");
    if (apply_time == "") {
        layer.msg("申请时间 不能为空")
        return;
    }
    var flaw_dbegin = $('#flaw_dbegin').textbox('getValue');
    if (flaw_dbegin == "") {
        layer.msg("开始时间 不能为空")
        return;
    }
    var flaw_dend = $('#flaw_dend').textbox('getValue');
    if (flaw_dend == "") {
        layer.msg("结束时间 不能为空")
        return;
    }
    var values = {};
    for (var item in params) {
        values[params[item].name] = params[item].value;
    }
        values["ts_sblx"] = ts_sblx;
    $.ajax({
        type: "post",
        url: g_url_head +'/saveAmusementHead',
        dataType: 'json',
        data: values,
        xhrFields: {
            withCredentials: true
        },
        success: function (r) {
            if (r.success == 1) {
                var stringData = JSON.stringify(lists);
                $.ajax({
                    type: "post",
                    url: g_url_head +'/saveAmusementBody',
                    dataType: 'json',
                    data: stringData,
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
                                closeWinRows();
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
//探伤编辑 开启窗口动作
function openWinRowsBefore() {
    $('#apply_time').datebox('setValue', getCurrentDate());
    $("#apply_man").textbox('setValue', g_usernamec);
    $("#job_no").textbox('setValue', username);

    //探伤
    $('#flaw_place').combobox({
        disabled: false,
        method: 'GET',
        url: g_url_head +'/configureAjax?id=34&foreign=' + cityname,
        valueField: 'id',
        textField: 'park_name',
        panelHeight: '200',
        panelMaxHeight: 250,
        editable: false,
        onLoadSuccess: function (data) {
            var data = $(this).combobox("getData");
            if (data && data.length > 0) {
                $(this).combobox("setValue", data[0].park_name);
                flawPlaceSelect = data[0].id;
            }
        },
        onSelect: function (record) {
            flawPlaceSelect = record.id;
        }
    });
    //生成流水号
    $.ajax({
        type: "get",
        url: g_url_head +'/getSystemNo',
        dataType: 'json',
        async: false,
        data: {NoKey: "HQTS", NoSize: 11},
        xhrFields: {
            withCredentials: true
        },
        success: function (r) {
            if (r.systemno == null) {
                layer.msg("网络错误，请联系管理员！");
            } else {
                // $("#system_no").val(r.systemno);
                tseditsystem_no = r.systemno;
                tanshangsearchVal = tseditsystem_no;
                $("#system_no").textbox('setValue', tseditsystem_no);
                uploadListIns.reload({
                    url: g_url_head + "/api/localStorage/layuiUp"
                    , data: {"system_no": tseditsystem_no, "file_flag": 1}
                })
            }
        }
    })


    $('#winrows').dialog({
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
    $('#winrows').window('center');//使Dialog居中显示


}

//多文件上传
layui.use('upload', function () {

    var $ = layui.jquery
        , upload = layui.upload;
    //多文件列表示例
    demoListView = $('#tsdemoList');
    uploadListIns = upload.render({
        elem: '#tsuploadList'
        , url: g_url_head + "/api/localStorage/layuiUp"
        , type:"post"
        // , size: 20*1024  //限制文件大小，单位 KB
        , accept: 'file'
        , multiple: true
        , auto: false
        , bindAction: '#tsListAction'
        ,before: function(obj){
            // layer.load();
        }
        , choose: function (obj) {
            // var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
            UPLOAD_FILES = obj.pushFile(); //将每次选择的文件追加到文件队列
            //读取本地文件
            obj.preview(function (index, file, result) {
                var tr = $(['<tr id="upload-' + index + '">'
                    , '<td>' + file.name + '</td>'
                    , '<td>' + (file.size / 1024).toFixed(1) + 'kb</td>'
                    , '<td>等待上传</td>'
                    , '<td>'
                    , '<button class="layui-btn layui-btn-xs demo-reload layui-hide">重传</button>'
                    , '<button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>'
                    , '</td>'
                    , '</tr>'].join(''));

                //单个重传
                tr.find('.demo-reload').on('click', function () {
                    obj.upload(index, file);
                });

                //删除
                tr.find('.demo-delete').on('click', function () {
                    delete UPLOAD_FILES[index]; //删除对应的文件
                    tr.remove();
                    uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                });

                demoListView.append(tr);
            });
        }
        , done: function (res, index, upload) {
            layer.closeAll('loading');
            if (res) { //上传成功
                var tr = demoListView.find('tr#upload-' + index)
                    , tds = tr.children();
                tds.eq(2).html('<span style="color: #5FB878;">上传成功</span>');
                tds.eq(3).html(''); //清空操作
                // return;
                UPLOAD_FILES1.push(index);
                return delete UPLOAD_FILES[index]; //删除文件队列已经上传成功的文件
            }
            this.error(index, upload);
        }
        , error: function (index, upload) {
            // layer.closeAll('loading');
            var tr = demoListView.find('tr#upload-' + index)
                , tds = tr.children();
            tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
            tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传
        }
    });
})

function closeWinRows() {
    $('#winrows').dialog('close')
    $('#dgrows').datagrid('loadData', [])
    $("#RowsForm").form('clear');
    clearTsEditFile();
}

function clearTsEditFile() {
    // var ss = layui.jquery("#tsdemoList");
    // layui.jquery("#tsdemoList").find("tr").remove();//删除所有tr
    for (let index in UPLOAD_FILES) {
        delete UPLOAD_FILES[index];
        var tr = demoListView.find('tr#upload-' + index);
        tr.remove();
        uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
    }
    for (let index in UPLOAD_FILES1) {//循环删除上传成功的
        var tr = demoListView.find('tr#upload-' + UPLOAD_FILES1[index]);
        tr.remove();
        uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
    }
    UPLOAD_FILES1 = [];
}

/**
 * 文件上传
 * @param type 类型
 * @param filesize 文件上传限制大小
 * @param fileclass 文件所属项目
 */
function tsupload(type,filesize) {
    var filesizespan = "上传文件小于"+filesize+"M";
    $("#filesizespan").html(filesizespan)
    var index = layer.open({
        type: 1,
        title: '文件上传',
        content: $('#tsuploadfilediv'),
        id: 'tsuploadarea',
        area: ['700px', '360px'],//宽高不影响最大化
        success: function (layero, index) {
            // if (type == 2) {
                uploadListIns.reload({
                    size: 1024*filesize
                    ,
                    url: g_url_head + "/api/localStorage/layuiUp"
                    , data: {"system_no": tanshangsearchVal, "file_flag": type}
                })
            // }
        },
        end: function () {
            // layui.jquery("#tsdemoList").find("tr").remove();//删除所有tr
            // clearTsEditFile();
            // uploadListIns.reload();
        }

    });

    // $("#tsuploadfilediv").dialog("open").dialog("setTitle", "文件上传(50M以内)");
}


