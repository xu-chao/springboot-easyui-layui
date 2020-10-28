var gpeditIndex = undefined;//表格编辑标识
//酒店物料申报编辑 开启窗口动作
function openparkgoodsform() {//parkgoodsDateRange
    //初始化脚本
    layui.use('laydate', function () {
        var laydate = layui.laydate;
        //日期范围
        laydate.render({
            elem: '#parkgoodsDateRange'
            , theme: 'molv'
            , range: true
        });
    })
    var pggoods_code_add = [
        {"id": 1, "sort_goods": "蔬菜类"},
        {"id": 2, "sort_goods": "冻品类"},
        {"id": 3, "sort_goods": "水产类"},
        {"id": 4, "sort_goods": "干货调料类"},
        {"id": 5, "sort_goods": "水果类 "},
        {"id": 6, "sort_goods": "家禽类"},
        {"id": 7, "sort_goods": "禽肉类"},
        {"id": 8, "sort_goods": "粮油类"}
    ];
    $('#pggoods_code_add').combobox({
        disabled: false,
        // method: 'GET',
        // url: g_url_head + '/configureAjax?id=34&foreign=' + cityname,
        data: pggoods_code_add,
        valueField: 'id',
        textField: 'sort_goods',
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
        }
    });

    $("#parkgoodsdiv").dialog("open");

}

function closeParkGoods() {
    $("#parkgoodsform").form('clear');
    $('#parkgoodsdiv').dialog('close')
}
function commitParkGoods() {
    var commitbool = $('#parkgoodsform').form("validate");
    if (!commitbool) {
        layer.msg("请填写必填字段并符合规范")
        return;
    }
    var parkgooddat = $("#parkgoodsDateRange").val();
    if (parkgooddat == "") {
        layer.msg("请填写日期区间")
        return;
    }
    $.ajax({
        //几个参数需要注意一下
        type: "POST",//方法类型
        dataType: "json",//预期服务器返回的数据类型
        url: g_url_head + "/saveParkGood",
        data: $('#parkgoodsform').serialize(),
        success: function (result) {
            if (result == 2) {
                layer.msg("已经存在该物料")
            } else if (result == 3) {
                layer.msg("日期范围已存在")
            } else if (result == 1) {
                layer.msg("提交成功")
                closeParkGoods()
            } else {
                layer.msg("提交失败")
            }
        },
        error: function () {
            layer.msg("异常！");
        }
    });

    //goods_code_add
}

function openGoodsPurcharseBefore() {
    var gpGoodSorts;
    var gpditsystem_no = "";//系统单号
    //申请日期 当前系统日期
    $('#gpapply_date').datetimebox('setValue', getCurrentTime());
    $("#gpapply_man").textbox('setValue', g_usernamec);
    $('#gpappli_department').textbox('setValue', getDeptname());
    $("#gpjob_no").textbox('setValue', username);
    // $('#gparrive_date').datebox().datebox('calendar').calendar({
    //     validator: function (date) {
    //         var now = new Date();
    //         var d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //         var d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10);
    //         return d1 <= date && date <= d2;
    //     }
    // });
    $('#gpcorporate_name').combobox({
        disabled: false,
        method: 'GET',
        url: g_url_head + '/configureAjax?id=51',
        valueField: 'com_name',
        textField: 'com_name',
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
    // var gpflaw_place = "";

    // if(deptname==7){//芜湖四期经营
    //     gpflaw_place =[{"id": 18, "park_name": "芜湖方特东方神画"}]
    // }else if(deptname==27||deptname==28){
    //     gpflaw_place =[{"id": 18, "park_name": "酒店专家公寓"}]
    // }else if(deptname==12){
    //     gpflaw_place =[{"id": 5, "park_name": "芜湖方特梦幻王国"}, {"id": 15, "park_name": "芜湖方特水上乐园"}]
    // }else {
    var gpflaw_place =  [{"id": 5, "park_name": "芜湖方特梦幻王国"}, {"id": 15, "park_name": "芜湖方特水上乐园"},
            {"id": 18, "park_name": "芜湖方特东方神画"}, {"id": 49, "park_name": "芜湖方特酒店"},
            {"id": 50, "park_name": "酒店专家公寓"}];
    // }

    $('#gpflaw_place').combobox({
        disabled: false,
        method: 'GET',
        // url: g_url_head + '/configureAjax?id=40',
        data: gpflaw_place,
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
        }
    });
    $('#gpsort_goods').combobox({
        disabled: false,
        method: 'GET',
        url: g_url_head + '/configureAjax?id=40',
        // data: gpflaw_place,
        valueField: 'id',
        textField: 'sort_goods',
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
                $(this).combobox("setValue", data[0].sort_goods);
                gpGoodSorts = data[0].id;
            }
        },
        onSelect: function (record) {
            gpGoodSorts = record.id;
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
        data: {NoKey: "HQGP", NoSize: 11},
        success: function (r) {
            if (r.systemno == null) {
                layer.msg("网络错误，请联系管理员！");
            } else {
                // $("#system_no").val(r.systemno);
                gpditsystem_no = r.systemno;
                $("#gpsystem_no").textbox('setValue', gpditsystem_no);
            }
        }
    });

    $('#goodspurchaseRows').dialog({
        title: '运行函数',
        width: 890,
        height: 560,
        top: 50,
        closed: false,//显示对话框
        cache: false,
        modal: true,
        closable: false,
        resizable: true
    });
    $('#goodspurchaseRows').window('center');//使Dialog居中显示

    $('#gprows').datagrid({
        toolbar: [{
            text: '添加',
            iconCls: 'icon-add',
            handler: function () {
                if (pgendEditing()) {
                    // gpditsystem_no = $("#system_no").textbox('getValue');
                    $('#gprows').datagrid('appendRow', {system_no: gpditsystem_no});
                    gpeditIndex = $('#gprows').datagrid('getRows').length - 1;
                    $('#gprows').datagrid('selectRow', gpeditIndex).datagrid('beginEdit', gpeditIndex);
                }
            }
        }, {
            text: '删除',
            iconCls: 'icon-remove',
            handler: function () {
                if (gpeditIndex == undefined) {
                    return
                }
                $('#gprows').datagrid('cancelEdit', gpeditIndex)
                    .datagrid('deleteRow', gpeditIndex);
                gpeditIndex = undefined;
            }
        }, {
            text: '接受改变',
            iconCls: 'icon-save',
            handler: function () {
                if (pgendEditing()) {
                    $('#gprows').datagrid('acceptChanges');
                }
            }
        }, {
            text: '撤销改变',
            iconCls: 'icon-undo',
            handler: function () {
                $('#gprows').datagrid('rejectChanges');
                editIndex = undefined;
            }
        },],
        onClickRow: function (index, row) {
            if (gpeditIndex != index) {
                if (pgendEditing()) {
                    // $('#dgrows').datagrid('selectRow', index)
                    //     .datagrid('beginEdit', index);
                    gpeditIndex = index;
                    $('#gprows').datagrid('selectRow', index);
                    $('#gprows').datagrid('beginEdit', index);

                } else {
                    $('#gprows').datagrid('selectRow', gpeditIndex);
                }
            }
        },

        //表格样式
        columns: [[
            {field: 'system_no', title: '系统单号', width: 100, align: 'center', hidden: true},
            // {field: 'sort_id', title: '分类id', width: 100, align: 'center', hidden: true},
            // {
            //     field: 'sort_goods', title: '分类类别', width: 125, align: 'center',
            //     formatter: function (value, row) {
            //         return row.sort_goods;
            //     },
            //     editor: {
            //         type: 'combobox',
            //         options: {
            //             panelHeight: '150',
            //             valueField: 'sort_goods',
            //             textField: 'sort_goods',
            //             required: true,
            //             onSelect: function (data) {
            //                 var row = $('#gprows').datagrid('getSelected');
            //                 var rowIndex = $('#gprows').datagrid('getRowIndex', row);//获取行号
            //                 // var thisTarget = $('#gprows').datagrid('getEditor', {'index':rowIndex,'field':'sort_goods'}).target;
            //                 // var value = thisTarget.combobox('getValue');
            //                 //给改行的 sort_id 赋值
            //                 // var configUrlEditor = $('#gprows').datagrid('getEditor', {
            //                 //     index: rowIndex,
            //                 //     field: 'sort_id'
            //                 // });
            //                 // configUrlEditor.actions.setValue(configUrlEditor.target, data.id);
            //                 // var sort_id = $('#gprows').datagrid('getEditor', {index: rowIndex, field: 'sort_id'});
            //                 // // sort_id.target.textbox("setValue", data.id);
            //                 // sort_id.actions.setValue(sort_id.target, data.id);
            //                 // 得到columns对象
            //                 var columns = $('#gprows').datagrid("options").columns;
            //                 var rows = $('#gprows').datagrid("getRows"); // 这段代码是
            //                 rows[rowIndex][columns[0][1].field] = data.id;
            //
            //                 // $("#gprows").datagrid("updateRow",{index:rowIndex,row:{sort_id:data.id}});
            //
            //                 // sort_id.target.prop('readonly', true); // 得到文本框对象
            //                 // var target = $('#gprows').datagrid('getEditor', {
            //                 //     'index': rowIndex,
            //                 //     'field': 'goods_name'
            //                 // }).target;
            //                 // target.combobox('clear'); //清除原来的数据
            //                 // var url = g_url_head + '/configureAjax?id=39&foreign=' + data.id;
            //                 // target.combobox('reload', url);//联动下拉列表重载
            //                 // target.combobox({
            //                 //     disabled: false,
            //                 //     method: 'GET',
            //                 //     url: url,
            //                 //     valueField: 'goods_name',
            //                 //     textField: 'goods_name',
            //                 //     panelHeight: '150',
            //                 //     editable: true,
            //                 //     prompt: '可根据拼音进行搜索！',
            //                 //     onHidePanel: function () {
            //                 //         var _options = $(this).combobox('options');
            //                 //         var _data = $(this).combobox('getData');/* 下拉框所有选项 */
            //                 //         var _value = $(this).combobox('getValue');/* 用户输入的值 */
            //                 //         var _b = false;/* 标识是否在下拉列表中找到了用户输入的字符 */
            //                 //         for (var i = 0; i < _data.length; i++) {
            //                 //             if (_data[i][_options.valueField] == _value) {
            //                 //                 _b = true;
            //                 //                 break;
            //                 //             }
            //                 //         }
            //                 //         if (!_b) {
            //                 //             $(this).combobox('setValue', '');
            //                 //         }
            //                 //     },
            //                 //     formatter: function (row) {
            //                 //         var s = '<span style="font-weight:bold">' + row.goods_name + '</span><br/>' +
            //                 //             '<span style="color:#888">' + row.goods_code + '</span>';
            //                 //         return s;
            //                 //     }
            //                 // }).combobox("clear");
            //
            //                 // $('#gprows').datagrid('updateRow', {
            //                 //     index: rowIndex,
            //                 //     row: {
            //                 //         sort_id: data.id,
            //                 //     }
            //                 // });
            //             }
            //         }
            //     }
            // },
            {
                field: 'goods_name', title: '商品名称', width: 125, align: 'center',
                formatter: function (value, row) {
                    // debugger
                    // var s = '<span style="font-weight:bold">' + row.goods_name1 + '</span><br/>' +
                    //     '<span style="color:#888">' + row.goods_code + '</span>';
                    return row.goods_name1;
                },
                editor: {
                    type: 'combobox',
                    options: {
                        panelHeight: '150', valueField: 'goods_code', textField: 'goods_name', required: true,
                        onSelect: function (data) {
                            // var good_price;
                            var row = $('#gprows').datagrid('getSelected');
                            // var url = g_url_head + '/configureAjax?id=50&foreign=' + data.goods_code
                            // $.ajax({
                            //     url: url,
                            //     dataType: 'json',
                            //     type: 'GET',
                            //     async: false,
                            //     xhrFields: {
                            //         withCredentials: true
                            //     },
                            //     success: function (res) {
                            //         good_price = res[0];
                            //         // data.forEach(function(value,index,array){
                            //         //         var map = {"id":value.id,"name":value.sort_goods};
                            //         //         sort_goodsData.push(map);
                            //         // })
                            //     }
                            // });
                            var rowIndex = $('#gprows').datagrid('getRowIndex', row);//获取行号
                            for (var i = 0; i < 5; i++) {
                                var gpfield;
                                var gpvalue;
                                if (i == 0) {
                                    gpfield = "goods_spec";
                                    gpvalue = data.goods_spec;
                                } else if (i == 1) {
                                    gpfield = "goods_unit";
                                    gpvalue = data.goods_unit;
                                } else if (i == 2) {
                                    gpfield = "goods_code";
                                    gpvalue = data.goods_code;
                                } else if (i == 3) {
                                    gpfield = "goods_name1";
                                    gpvalue = data.goods_name;
                                }

                                // else if (i == 3) {
                                //     gpfield = "goods_price";
                                //     gpvalue = good_price.price;
                                // } else if (i == 4) {
                                //     gpfield = "goods_rate";
                                //     gpvalue = good_price.rate;
                                // }
                                var configUrlEditor = $('#gprows').datagrid('getEditor', {
                                    index: rowIndex,
                                    field: gpfield
                                });
                                configUrlEditor.actions.setValue(configUrlEditor.target, gpvalue);
                                configUrlEditor.target.prop('readonly', true); // 得到文本框对象


                            }


                        }
                    }
                }
            },
            {field: 'goods_spec', title: '商品型号', width: 125, align: 'center', editor: {type: 'text'}},
            {field: 'goods_unit', title: '单位', width: 80, align: 'center', editor: {type: 'text'}},
            {field: 'goods_code', title: '商品编码', width: 155, align: 'center', editor: {type: 'text'}},
            {
                field: 'goods_num',
                title: '提单数量',
                width: 125,
                align: 'center',
                editor: {type: 'numberbox', options: {required: true, precision: 2}}
            },
            // {
            //     field: 'goods_price',
            //     title: '价格',
            //     width: 80,
            //     align: 'center',
            //     hidden: true,
            //     editor: {type: 'numberbox', options: { precision: 2}}
            // },
            // {
            //     field: 'goods_rate',
            //     title: '税率',
            //     width: 80,
            //     align: 'center',hidden: true,
            //     editor: {type: 'numberbox', options: { precision: 2}}
            // },
            {
                field: 'goods_remarks', title: '备注', width: 150, align: 'center', editor: {type: 'text'},
                formatter: function (value) {
                    return "<span title='" + value + "'>" + value + "</span>";
                }
            },
            {field: 'goods_name1', editor: {type: 'text'}, hidden: true},
        ]],
        onBeginEdit: function (index, rowData, value) {
            //回车时结束编辑
            $('.datagrid-editable .textbox,.datagrid-editable .datagrid-editable-input,.datagrid-editable .textbox-text').bind('keyup', function (e) {
                var code = e.keyCode || e.which;
                if (code == 13) {
                    if (pgendEditing()) {
                        $('#gprows').datagrid('acceptChanges');
                    }
                }
            });
        //
        //     // 统计方法下拉框
        //     var smEditor = $('#gprows').datagrid('getEditor', {
        //         index: index,
        //         field: 'sort_goods'
        //     });
        //     $(smEditor.target).combobox({
        //         onLoadSuccess: function () {
        //             $(smEditor.target).combobox('setValue', rowData.sort_goods);
        //         },
        //         onHidePanel: function () {
        //             var _options = $(this).combobox('options');
        //             var _data = $(this).combobox('getData');/* 下拉框所有选项 */
        //             var _value = $(this).combobox('getValue');/* 用户输入的值 */
        //             var _b = false;/* 标识是否在下拉列表中找到了用户输入的字符 */
        //             for (var i = 0; i < _data.length; i++) {
        //                 if (_data[i][_options.valueField] == _value) {
        //                     _b = true;
        //                     break;
        //                 }
        //             }
        //             if (!_b) {
        //                 $(this).combobox('setValue', '');
        //             }
        //         },
        //         onShowPanel: function () {
        //             //下拉展开时动态修改options
        //             //datatype处理统计方法
        //             // if(rowData.dataType == 'string' || rowData.dataType == 'date'){
        //             var sort_goodsData = [];
        //             //查询 t_goods_sort 表
        //             var url = g_url_head + '/configureAjax?id=40&foreign=' + gpGoodSorts
        //             $.ajax({
        //                 url: url,
        //                 dataType: 'json',
        //                 type: 'GET',
        //                 async: false,
        //                 xhrFields: {
        //                     withCredentials: true
        //                 },
        //                 success: function (data) {
        //                     sort_goodsData = data;
        //                 }
        //             });
        //             $(smEditor.target).combobox("loadData", sort_goodsData);
        //             // }
        //             //设置值
        //             $(smEditor.target).combobox('setValue', rowData.sort_goods);
        //         }
        //     });
        //     if ((rowData.sort_goods == null) || (rowData.sort_goods == "") || (rowData.sort_goods == undefined)) {
        //     } else {
        //         $(smEditor.target).combobox('setValue', rowData.sort_goods);
        //     }

            var goods_name = $('#gprows').datagrid('getEditor', {
                index: index,
                field: 'goods_name'
            });
            $(goods_name.target).combobox({
                // onLoadSuccess: function () {
                //     $(goods_name.target).combobox('setValue', rowData.goods_name);
                // },
                formatter: function (row) {
                    var s = '<span style="font-weight:bold">' + row.goods_name + '</span><br/>' +
                        '<span style="color:#888">' + row.goods_code + '</span>';
                    return s;
                },
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
                onShowPanel: function () {
                    //下拉展开时动态修改options
                    //datatype处理统计方法
                    var sort_goodsName = [];
                    //查询 t_goods_sort 表
                    // var url = g_url_head + '/configureAjax?id=39&foreign=' + gpGoodSorts;
                    var url = g_url_head + '/selectGoodsInfoWithTruePrice';
                    $.ajax({
                        url: url,
                        dataType: 'json',
                        type: 'GET',
                        data:{gpGoodSorts:gpGoodSorts,goodsDate:getCurrentDate()},
                        async: false,
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function (data) {
                            sort_goodsName = data;
                        }
                    });
                    $(goods_name.target).combobox("loadData", sort_goodsName);
                    // }
                    //设置值
                    $(goods_name.target).combobox('setValue', rowData.goods_code);
                }
            });
            if ((rowData.goods_name1 == null) || (rowData.goods_name1 == "") || (rowData.goods_name1 == undefined)) {
            } else {
                $(goods_name.target).combobox('setValue', rowData.goods_name1);
            }
        }
    });

    //表格 结束编辑触发
    function pgendEditing() {
        if (gpeditIndex == undefined) {
            return true
        }
        if ($('#gprows').datagrid('validateRow', gpeditIndex)) {
            $('#gprows').datagrid('endEdit', gpeditIndex);
            gpeditIndex = undefined;
            return true;
        } else {
            return false;
        }
    }
}

//酒店物料申请编辑 提交表单
function submitgpFormRows() {
    var params = $('#goodspurchaseForm').serializeArray();
    var lists = $("#gprows").datagrid('getRows');//获取所有行
    if (lists.length == 0) {
        layer.msg("请填写明细")
        return;
    } else if (gpeditIndex != undefined) {//判断 探伤表格是否 接受改变
        layer.msg("请点击 接受改变")
        return;
    }
    var gpcorporate_name = $('#gpcorporate_name').textbox('getValue');
    if (gpcorporate_name == "") {
        layer.msg("公司名称 不能为空")
        return;
    }
    var gpflaw_place = $('#gpflaw_place').combobox('getText');
    if (gpflaw_place == "") {
        layer.msg("地点 不能为空")
        return;
    }var gpsort_goods = $('#gpsort_goods').combobox('getValue');
    var gpsort_goodsText = $('#gpsort_goods').combobox('getText');
    if (gpsort_goods == "") {
        layer.msg("分类类别 不能为空")
        return;
    }
    // var gparrive_date = $('#gparrive_date').textbox('getValue');
    // if (gparrive_date == "") {
    //     layer.msg("到货日期 不能为空")
    //     return;
    // }
    var sqlValue = params[5].value + ";" + params[3].value + ";" + params[4].value +
        ";" + params[2].value + ";" + params[0].value + ";" + params[1].value + ";"
        + gpflaw_place+";" + gpsort_goodsText;
    $.ajax({
        type: "post",
        url: g_url_head + '/configureSave',
        dataType: 'json',
        data: {id: 41, sqlValue: sqlValue},
        xhrFields: {
            withCredentials: true
        },
        success: function (r) {
            if (r.success == 1) {
                var stringData = JSON.stringify(lists);
                $.ajax({
                    type: "post",
                    url: g_url_head + '/saveGoodsBody',
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
                                closeGpWinRows();
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

function closeGpWinRows() {
    $('#goodspurchaseRows').dialog('close')
    $('#gprows').datagrid('loadData', [])
    $("#goodspurchaseForm").form('clear');
    $('#execute').click();
}
