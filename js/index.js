// var username = getQueryString("username");
// var role = getQueryString("role");
// var cityname = getQueryString("cityname");
// var deptname = getQueryString("deptname");
var username;
var role;
var cityname;
var deptname;
var parkname;
var g_usernamec;//中文名
$(function () {
    $('#s_startDate').datebox({
        required: false,
        showSeconds: true,
        editable: false,
        onSelect: function (date) {
            $('#s_endDate').datebox('enable');	//启用结束日期控件
        }
    });

    $('#s_endDate').datebox({
        required: false,
        showSeconds: true,
        editable: false,
        disabled: true,
        validType: 'compareDate[\'#s_startDate\']'
    });

    $.extend($.fn.validatebox.defaults.rules, {
        compareDate: {
            validator: function (value, param) {
                var d1 = $(param[0]).datebox('getValue');  //获取开始时间
                return value >= d1;  //有效范围为大于开始时间
            },
            message: '结束时间不能早于开始时间!'
        }
    });

    $.ajax({
        type: "POST",
        url: g_url_head + '/chaxunuserinfo',
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        async: false,
        success: function (r) {
            if (r.username == null || r.username == '' || typeof r.username == 'undefined') {
                window.location.href = 'index.html';
                return;
            } else {
                username = r.username;
                role = r.role;
                cityname = r.cityname;
                deptname = r.deptname;
                parkname = r.parkname;
                init();
            }
        }
    })
    g_usernamec = getUserName();
    // $('#sqldata').datagrid({});
    // $('#sqldata').datagrid({
    // rownumbers: true,
    // fit: true,
    // fitColumns: false,
    // singleSelect: true,
    // striped: true,
    // pagination: true,
    // pageList: [10, 100, 200, 500, 1000],
    // loadMsg: "查询中，请稍后...",
    // pageNumber: 1,// 在设置分页属性的时候初始化页码。
    // pageSize: 100,// 在设置分页属性的时候初始化页面大小。
    // columns: [[]],
    // frozenColumns: [],
    // data: r,
    // enableRowContextMenu: true,
    // selectOnRowContextMenu: true,
    // refreshMenu: false,
    // pagingMenu: false,
    // rowContextMenu: rowMenu,
    // enableHeaderContextMenu: true,
    // enableHeaderClickMenu: true,
    // enableGroupSummary: { enable: true, mode: "local", ignoreFormatter: false }
    // });
})

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

//根据DOM元素的id构造出一个编辑器
var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "text/c-mysql", //实现SQL代码高亮
    // mode: "text/x-pgsql", //实现SQL代码高亮
    lineNumbers: true,
    theme: "default",
    keyMap: "default",
    // extraKeys: {"Ctrl-Space": "autocomplete"},
    extraKeys: {"Tab": "autocomplete"},
    hint: CodeMirror.hint.sql,
    lineWrapping: true,         //是否换行
    foldGutter: true,           //是否折叠
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"], //添加行号栏，折叠栏
    hintOptions: {
        tables: tablewords
    }
});

if (role == 'looker') {
    editor.setOption("readOnly", true);
}

editor.on("keyup", function (cm, event) {
    //所有的字母和'$','{','.'在键按下之后都将触发自动完成
    if (!cm.state.completionActive &&
        ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 52 || event.keyCode == 219 || event.keyCode == 190)) {
        CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
    }
});

/**
 * 根据sql编辑框动态高度，设置表格的高度
 */
function setDatalistHeight() {
    if ($('.right-card .layui-tab').css("display") === "none") {// 第一次执行代码
        $("#handle").show();
        $('.right-card .layui-tab').show();
        editor.setSize('height', '0px');
        // if(role == 'looker'){
        //     editor.setSize('height', '0px');
        // }else {
        //     editor.setSize('height', '100px');
        // }
    }
    var allH = parseInt($('.card').height());
    var sqlDivHeight = parseInt($('.right-card .sql-div').height());
    var toolsDivHeight = parseInt($('.right-card .tools').height());
    var datalistH = allH - sqlDivHeight - toolsDivHeight - 32;
    $('.right-card .data-div').height(datalistH + 'px');
    if ($(".data-list .datagrid").length > 0) {// 数据表格存在是高度适用
        $('#sqldata').datagrid('resize', {
            height: datalistH - 33 + "px"
        })
    }
}

/**
 * 加载中...
 */
function loading() {
    $("#stopImg").attr("src", "image/stop1.png");
    $("#loading").show();
}

/**
 * 完成
 */
function complete() {
    $("#loading").hide();
    $("#stopImg").attr("src", "image/stop0.png");
}

var exeAjax;// 当前ajax请求;
var g_url;
var g_exeSql;
var temp_exeSql;
var g_page;
var g_pageSize;

var g_exeSql_temp;

// 异步加载数据
function loadData(exeSql, page, pageSize, callback) {
    g_url = g_url_head + '/chaxun?role=' + role + '&_t=' + new Date().getTime();
    // if(header_sql != '' && typeof header_sql != 'undefined'){
    //     exeSql = header_sql;
    //     header_sql = '';
    // }
    g_exeSql_temp = exeSql;
    if (g_page == '') {
        g_page = page;
    }
    if (g_pageSize == '') {
        g_pageSize = pageSize;
    }
    exeAjax = $.ajax({
        type: "GET",
        url: g_url,
        data: {sql: exeSql, page: page, rows: pageSize},
        dataType: "json",
        //async:false,
        beforeSend: function () {
            loading();
        },
        success: function (r) {
            complete();
            callback(r);
            // $("#sqldata").datagrid("reload");
        },
        error: function (r) {
            complete();
            if (r.readyState == '0' && r.status == '0' && r.statusText != "abort") {
                layer.alert('对不起，无法连接服务器，请检查您的计算机硬件以及网络连接是否正常！');
            }
        }
    });
}

$('#distrimenu').click(function () {
    var index = layer.open({
        type: 1,
        title: '菜单分配',
        content: $('#view-member-div1'),
        id: 'TWork',
        area: ['800px', '600px'],//宽高不影响最大化
        success: function (layero, index) {
            layui.use(['tableEdit'], function (exports) {
                var table = layui.table, tableEdit = layui.tableEdit, $ = layui.$;
                var cols = table.render({
                    elem: '#view-member-table1',
                    id: 'usermenutable1'
                    , url: g_url_head + '/menuView'
                    , limit: 10 //默认为10
                    , height: 452
                    , cols: [[
                        {field: 'menu_id', width: 100, title: '菜单ID', sort: true} //sort：true页面可进行排序操作
                        , {field: 'menu_name', title: '菜单名', event: 'menu_name', config: {type: 'input'}}
                        , {field: 'menu_remarks', title: '菜单备注', event: 'menu_remarks', config: {type: 'input'}}
                        , {
                            field: 'level', width: 100, title: '操作', templet: function (d) {
                                return '<a class="layui-btn layui-btn-xs layui-btn-normal" onclick="sqlTree(\'' + d.menu_id + '\');">分配</a>';
                            }
                        }
                    ]]
                    , page: true
                    , done: function (res, curr, count) {
                        //数据的回调用，可不写
                    },
                }).config.cols;
                ;

                $('#usersearch1').click(function () {
                    var demoReload1 = $('#demoReload1');
                    //执行重载
                    table.reload('usermenutable1', {
                        page: {
                            curr: 1 //重新从第 1 页开始
                        }
                        , where: {
                            searchId: demoReload1.val()
                        }
                    }, 'data');
                });
                $('#resetsearch1').click(function () {
                    $('#demoReload1').val("");
                    //执行重载
                    table.reload('usermenutable1', {
                        page: {
                            curr: 1 //重新从第 1 页开始
                        }
                        , where: {
                            searchId: $('#demoReload1').val()
                        }
                    }, 'data');
                });

                $('#newMenu').click(function () {
                    var parkData = [];
                    $.ajax({
                        type: "GET",
                        url: g_url_head + '/configureAjax?id=34',
                        dataType: "json",
                        async: false,
                        success: function (data) {
                            data.forEach(function (value, index, array) {
                                var map = {"name": value.park_name, "value": value.park_pinyin};
                                parkData.push(map);
                            })

                        }, error: function () {
                            alert("重新所属公园失败")
                        }
                    });
                    var demo1 = xmSelect.render({
                        el: '#menupark',
                        tips: '可不选',
                        toolbar: {
                            show: true,
                        },
                        filterable: true,
                        data: parkData,
                    });
                    var index = layer.open({
                        type: 1,
                        area: ['450px', '600px'],
                        offset: "auto",
                        title: '表分配',
                        content: $('#view-member-menu'),
                        id: 'TWorkTree'
                        , btn: ['确定', '关闭'] //只是为了演示
                        , yes: function () {
                            var selectArr = demo1.getValue();
                            var park_menu = "";
                            selectArr.forEach(function (value, index, array) {
                                park_menu += value.value + ";";
                            });
                            var menuname = $('#view-member-menu input[name="menuname"]').val();
                            var menuremarks = $('#view-member-menu input[name="menuremarks"]').val();
                            if ($.trim(menuname) == "") {
                                layer.msg("菜单名称不能为空");
                                return false;
                            }

                            $.ajax({
                                type: "post",
                                url: g_url_head + '/saveMenu',
                                data: {menuname: menuname, menuremarks: menuremarks, park_menu: park_menu},
                                dataType: "json",
                                //async : false,
                                beforeSend: function () {
                                    // loading();
                                },
                                success: function (r) {
                                    if (r.success) {
                                        layer.confirm('添加成功!', {
                                            closeBtn: 0,//不显示关闭按钮
                                            btn: ['确认'] //按钮
                                        }, function () {
                                            layer.close(index);
                                            layer.close(layer.index);
                                            $("#menuAdd")[0].reset();
                                            $("#menupark").empty();
                                            layui.form.render();
                                            $('#resetsearch1').click();
                                        });
                                    } else {
                                        layer.confirm('添加失败!', {
                                            closeBtn: 0,//不显示关闭按钮
                                            btn: ['确认'] //按钮
                                        }, function () {
                                            layer.close(layer.index);
                                            $("#menuAdd")[0].reset();
                                            layui.form.render();
                                        });
                                    }
                                },
                                error: function (r) {
                                    if (r.success == '0') {
                                        layer.alert('添加失败！');
                                    }
                                }
                            });


                        }
                    })
                });
                var aopTable = tableEdit.aopObj(cols); //获取一个aop对象

                aopTable.on('tool(tableEvent)', function (obj) {
                    var field = obj.field; //单元格字段
                    var value = obj.value; //修改后的值
                    var data = obj.data; //当前行旧数据
                    var event = obj.event; //当前单元格事件属性值
                    var update = {};
                    update[field] = value;
                    //保存sys_menu表，更新菜单字段
                    if (event == "menu_name") {
                        $.ajax({
                            type: "post",
                            url: g_url_head + '/configureUpdate',
                            dataType: 'json',
                            data: {
                                tableName: "sys_menu", anyFieldValue: "menu_name = '" + value + "'",
                                foreignName: "menu_id", foreignValue: data.menu_id
                            },
                            success: function (data) {
                                if (data.success == 1) {
                                    obj.update(update);
                                    layer.msg("保存成功");
                                } else {
                                    layer.msg("保存失败");
                                }
                            }
                        })
                    } else {
                        $.ajax({
                            type: "post",
                            url: g_url_head + '/configureUpdate',
                            dataType: 'json',
                            data: {
                                tableName: "sys_menu", anyFieldValue: "menu_remarks='" + value + "'",
                                foreignName: "menu_id", foreignValue: data.menu_id
                            },
                            success: function (data) {
                                if (data.success == 1) {
                                    obj.update(update);
                                    layer.msg("保存成功");
                                } else {
                                    layer.msg("保存失败")
                                }
                            }
                        })
                    }
                });

            });
        },
        end: function () {

        }
    });
// //只需要加这一句就可以啦 窗口最大化
//         layer.full(index);
});

function sqlTree(menu_id) {
    var layer = layui.layer;
    var index = layer.open({
        type: 1,
        offset: "t",
        title: '表分配',
        content: $('#view-member-tree'),
        id: 'TWorkTree'
        , btn: ['确定', '关闭'] //只是为了演示
        , yes: function () {
            var tableSql = "";
            var checkedData = layui.tree.getChecked('sqlTree1');
            var data1 = checkedData[0].children;
            $.each(data1, function (i, item) {
                var date2 = item.children;
                $.each(date2, function (i, item) {
                    var title = item.title;
                    tableSql += title + ";";
                });
            });
            $.ajax({
                type: "post",
                url: g_url_head + '/saveMenuSql',
                dataType: 'json',
                data: {menu_id: menu_id, tableSql: tableSql},
                success: function (data) {
                    if (data.success == 1) {
                        var con = layer.confirm('保存成功!', {
                            closeBtn: 0,//不显示关闭按钮
                            btn: ['确认'] //按钮
                        }, function () {
                            layer.close(con);
                            layer.close(index);
                        });
                    }
                }
            })
        }
        , btn2: function (index) {
            layer.close(index);
        },
        // area: ['800px', '600px'],//宽高不影响最大化
        success: function (layero, index) {
            $.ajax({
                type: "get",
                url: g_url_head + '/ChaXunFuncView?menu_id=' + menu_id,
                dataType: 'json',
                success: function (res) {
                    layui.use(['tree', 'util'], function () {
                        var tree = layui.tree
                            , layer = layui.layer
                            , util = layui.util;
                        //基本演示
                        //开启复选框
                        tree.render({
                            elem: '#test12'
                            , data: res
                            , showCheckbox: true
                            , id: 'sqlTree1'
                        });
                        // tree.render({
                        //     elem: '#test12'
                        //     , data: data
                        //     , showCheckbox: true  //是否显示复选框
                        //     , id: 'sqlTree1'
                        //     // , isJump: true //是否允许点击节点时弹出新窗口跳转
                        //     , click: function (obj) {
                        //         var data = obj.data;  //获取当前点击的节点数据
                        //         layer.msg('状态：' + obj.state + '<br>节点数据：' + JSON.stringify(data));
                        //     }, oncheck:function(){
                        //         //这个时候，如果你声明了ID,那么你这个tree.getChecked()函数是可以用的，如果你没用添加id属性，则会提示你这个方法找不到
                        //         var checkData = tree.getChecked('sqlTree1');
                        //        }
                        // });
                    });
                }
            })


        }
    })
}

//如若上一次AJAX请求未完成，则中止请求
function stopLoadData() {
    if (exeAjax) {
        exeAjax.abort();
    }
}

function op(sqlName, r, view) {
    var sz1 = [];
    var sz2 = [
        {"field": "文件id", "title": "文件id", "width": 60, hidden: true, sortable: true},
        {
            "field": "文件名", "title": "文件名", "width": 200, sortable: true,
            "formatter": function (value, row, index) {
                if (typeof (value) == 'undefined') {
                    return "<span style='color: brown'>暂无文件名</span>";
                } else {
                    return "<div class='textEllipsis_zgb'>" + value + "</div>";
                }
            }
        },
        {
            "field": "文件备注名", "title": "文件备注名", "width": 100, sortable: true,
            "formatter": function (value, row, index) {
                return "<div class='textEllipsis_zgb'><a href='" + g_url_head + "/file/" + row.文件基本类型 + "/" + row.文件下载地址 + "' target='_blank' style='color: yellowgreen'>" + value + "</a></div>";
            }
        },
        {
            "field": "文件详细类别", "title": "文件详细类别", "width": 200, sortable: true,
            "formatter": function (value, row, index) {
                if (value != '' && typeof value != 'undefined') {
                    return "<div class='textEllipsis_zgb'>" + row.文件详细类别 + "</div>";
                } else {
                    return value;
                }
            }
        },
        {"field": "文件格式", "title": "文件格式", "width": 100, tooltip: true, sortable: true},
        {"field": "文件大小", "title": "文件大小", "width": 100, calcable: true, sortable: true},
        {"field": "文件基本类型", "title": "文件基本类型", "width": 100, sortable: true},
        {"field": "管理人", "title": "管理人", "width": 100, sortable: true},
        {"field": "更新时间", "title": "更新时间", "width": 100, sortable: true},
        {"field": "部门id", "title": "部门id", "width": 100, hidden: true, sortable: true},
        {"field": "部门", "title": "部门", "width": 100},
        {
            "field": "文件下载地址", "title": "文件下载地址", "width": 200, hidden: true, sortable: true,
            "formatter": function (value, row, index) {
                return "<div class='textEllipsis'>/file/" + row.文件基本类型 + "/" + value + "</div>";
            }
        }
    ];
    var sz3 = {"field": "版本", "title": "版本", "width": 100, sortable: true};
    var approve = [
        {"field": "系统单号", "title": "系统单号", "width": 120, sortable: true},
        {"field": "问题标题", "title": "问题标题", "width": 120, sortable: true},
        {"field": "工程简称", "title": "工程简称", "width": 150, sortable: true},
        {"field": "提交人", "title": "提交人", "width": 100, sortable: true},
        {"field": "项目", "title": "项目", "width": 100, sortable: true},
        {"field": "专业", "title": "专业", "width": 100, sortable: true},
        {
            "field": "审批详情", "title": "审批详情", "width": 400, sortable: true,
            "formatter": function (value, row, index) {
                if (value != '' && typeof value != 'undefined') {
                    return "<div class='textEllipsis_zgb'>" + row.审批详情 + "</div>";
                } else {
                    return value;
                }
            }
        },
        {"field": "提交时间", "title": "提交时间", "width": 150, sortable: true},
        {"field": "审批状态", "title": "提交时间", "width": 100, sortable: false},
    ];
    if (r.flag == 'xz') {
        if (view == 'all') {
            sz2.push(sz3);
            sz1.push(sz2);
        } else {
            sz1.push(sz2);
        }
        return sz1;
    } else {
        if ((sqlName == "all_待处理流程") || (sqlName == "all_流程审批中") || (sqlName == "all_流程结束单") || (sqlName == "multiline_公园问题反馈")) {
            sz1.push(approve);
            return sz1;
        } else {
            return r.column;
        }
    }
}

function opt(r, view) {
    if (r.flag == 'xz') {
        if (view == 'all') {
            return [[
                {
                    field: 'action', title: '操作', width: 80, align: 'center', sortable: true,
                    formatter: function (value, row, index) {
                        return "<a href=\"javascript:void(0)\" style='color: #1E9FFF' class=\"easyui-linkbutton\" onclick=\"openAssignFile('" + row.部门id + "','" + row.文件id + "','" + row.文件详细类别 + "','1')\">标签</a>&nbsp;" +
                            "<a href=\"javascript:void(0)\" style='color: #1E9FFF' class=\"easyui-linkbutton\" onclick=\"openAssignFile('" + row.部门id + "','" + row.文件id + "','" + row.文件详细类别 + "','2')\">修改</a>";
                    }
                }
            ]];
        } else {
            return [[]];
        }
    } else if (r.flag == 'qr') {
        return [[
            {
                field: 'action', title: '填写进度', width: 120, align: 'center', sortable: true,
                formatter: function (value, row, index) {
                    var v = 0;
                    if (row.是否填写 == 0 || typeof row.是否填写 == 'undefined') {
                        v = 0;
                    } else {
                        v = row.已填写数量;
                    }
                    var p = (v / row.总计) * 100;
                    var value = Math.ceil(p);
                    var htmlstr = '<div id="QRProgressbar" class="easyui-progressbar progressbar easyui-fluid" style="width: 100%; height: 20px;">'
                        + '<div class="progressbar-value" style="width: 100%; height: 20px; line-height: 20px;"> '
                        + '<div class="progressbar-text" style="width: ' + value + '%' + '; height: 20px; line-height: 20px;">' + value + '%</div>'
                        + '</div>'
                        + '</div>';
                    return htmlstr;
                }
            }
        ]];
    } else {
        return [[]];
    }
}

// layui组件相关的
layui.use(['element', 'layer'], function () {
    var element = layui.element;
    var layer = layui.layer;
    var allH = parseInt($('.card').height());

    // 初始化sql编辑框
    var toolsDivHeight = parseInt($('.right-card .tools').height());
    editor.setSize('height', allH - toolsDivHeight - 5 + 'px');
    $('#showhelpb').click(function () {
        var index = layer.open({
            type: 2,
            content: 'showhelp.html',
            area: ['520px', '395px'],
            maxmin: true
        });
        layer.full(index);
    });

    // 代码执行
    $('#execute').click(function () {
        var exeSql = "";
        var allSql = editor.getValue();
        var sqlNameCompare = getSqlTableName(allSql);
        // 处理要执行的sql语句
        if (typeof sqlName === 'undefined') {
            sqlName = sqlNameCompare;
        } else if (sqlNameCompare != sqlName) {
            sqlName = sqlNameCompare;
        }
        if (allSql.indexOf("where") == -1) {
            if (sqlName == "all_待处理流程") {
                allSql += " where 审批人工号 = '" + username + "' and 结束标识 = 'f'";
                editor.setValue(allSql);
            } else if (sqlName == "all_流程结束单") {
                allSql += " where  结束标识 = 't'";
                editor.setValue(allSql);
            } else if (sqlName == "all_流程审批中") {
                allSql += " where  审批状态 = '审批中'";
                editor.setValue(allSql);
            }
        }
        var view = "";
        if ($.trim(allSql) === "") {
            return false;
        }
        //判断 执行语句是否规范
        var flag = false;
        var str;//返回文本
        // str.replace(/需要替换的字符串/g,"新字符串")
        allSql = allSql.replace(/彑/g, "'");
        var split = allSql.split(" ");
        var funcname = '';
        var cloumnFlag = '';
        $.each(split, function (index, word) {
            var w = word.toLowerCase();
            if (index == 0) {
                if (!(w == "select")) {//如果不是以select开头
                    str = "不是以select开头";
                    flag = true;
                    return false;
                }
            } else {
                if ((w == "into") || w == "update" || w == "delete" || w == "alter"
                    || w == "insert" || w == "create" || w == "table"
                    || w == "drop" || w == "show" || w == "lock" || w == "truncate"
                    || w == "database" || w == "dropdb" || w == "references" || w == "trigger"
                    || w == "connect" || w == "temporary" || w == "execute"
                    || w == "usage" || w == "grant" || w == "commit" || w == "rollback") {
                    flag = true;
                    str = "含敏感字符串:" + w;
                    return false;
                } else if (w.indexOf("avc") != -1) {
                    view = "avc";
                } else if (w.indexOf("jd") != -1) {
                    view = "jd";
                } else if (w.indexOf("zgb") != -1) {
                    view = "zgb";
                } else if (w.indexOf("all") != -1) {
                    view = "all";
                } else if (w.indexOf("ownfunc_") != -1 || w.indexOf("function_") != -1) {
                    funcname = w;
                }
                // else if(w.indexOf("备注") != -1){
                //     cloumnFlag = w;
                // }
            }
        })
        if (flag) {//'执行语句不符合规范'
            layer.alert(str, {
                skin: 'layui-layer-molv' //样式类名  自定义样式
                , closeBtn: 1    // 是否显示关闭按钮
                , anim: 1 //动画类型
                , btn: ['确定'] //按钮
                , icon: 5    // icon
                , yes: function (index) {
                    layer.close(index);
                }
            });
            return;
        }
        var selectedSql = editor.getSelection();
        if (selectedSql !== "") {
            exeSql = selectedSql;
        } else {
            exeSql = allSql;
        }
        setDatalistHeight();
        // 获取输入的值
        // console.log(exeSql);
        var initPageSize = 100;
        // g_exeSql = exeSql;
        if (sqlName === '芜湖货品提单待办') {
            if (deptname == 6) {//采购部
                exeSql += " WHERE 采购确认 is null";
            } else if (deptname == 25) {//仓库部
                exeSql += " WHERE 仓库确认 is null";
            }
        }
        if (sqlName === 'avc_人员作业作业人待办') {
            exeSql += " WHERE 作业人员 = '" + getUserName() + "'";
        }
        if (sqlName === 'avc_人员作业审核人待办') {
            exeSql += " WHERE 审核人员 = '" + getUserName() + "'";
        }
        if ((sqlName === 'log_operation_report') || (sqlName === 'log_projector_report')) {
            $("#tb").css("display", "block");
            $("#sqldatadiv").css("height", "94%");
            $('#s_park').combobox(
                {
                    disabled: false,
                    method: 'GET',
                    url: g_url_head + '/szPark?parkPinYin=' + cityname,
                    prompt: '请填入公园名称',
                    valueField: 'id',
                    textField: 'name',
                    panelHeight: 'auto',
                    panelMaxHeight: 150,
                    editable: true,
                    onLoadSuccess: function () {
                        var data = $('#s_park').combobox('getData');
                        var tid;
                        var tname;
                        if (cityname == 'shenzhen') {
                            tid = data[1].id;
                            tname = data[1].name;
                        } else {
                            tid = data[0].id;
                            tname = data[0].name;
                        }
                        if (data.length > 0) {
                            $('#s_park').combobox('select', tname);
                        }
                        if (data.length > 0) {
                            $('#s_park').combobox('select', tname);
                            // if (!(exeSql.indexOf("where") != -1) && !(exeSql.indexOf("WHERE") != -1)) {
                            //     var s_park_where = $('#s_park').combobox('getValue');
                            //     if(s_park_where != ''){
                            //         exeSql += " WHERE 公园名称 = '" + s_park_where + "'";
                            //     }else {
                            //         exeSql += " WHERE 公园名称 = '" + parkname + "'";
                            //     }
                            // }
                            // $('#s_project').combobox({
                            //     disabled: false,
                            //     method: 'GET',
                            //     url: g_url_head + '/szAttraction?park_id=' + tid,
                            //     prompt: '请先填入公园名称',
                            //     valueField: 'id',
                            //     textField: 'name',
                            //     panelHeight: 'auto',
                            //     panelMaxHeight: 150,
                            //     editable: true,
                            //     onLoadSuccess: function () {
                            //         var val = $(this).combobox("getData");
                            //         for (var item in val[0]) {
                            //             if (item == "id") {
                            //                 $(this).combobox("select", val[0][item]);
                            //             }
                            //         }
                            //     }
                            // }).combobox("clear");
                        }
                    },
                    onSelect: function (record) {
                        var id = record.id;
                        $('#s_project').combobox({
                            disabled: false,
                            method: 'GET',
                            url: g_url_head + '/szAttraction?park_id=' + id,
                            prompt: '请先填入公园名称',
                            valueField: 'id',
                            textField: 'name',
                            panelHeight: 'auto',
                            panelMaxHeight: 150,
                            editable: true,
                        }).combobox("clear");
                    }
                });
            $("#s_park").combobox("textbox").bind("focus", function () {
                $("#s_park").combobox('setText', '');
            });

            if (!(exeSql.indexOf("where") != -1) && !(exeSql.indexOf("WHERE") != -1)) {
                var s_park_where = $('#s_park').combobox('getValue');
                if (s_park_where != '') {
                    exeSql += " WHERE 公园名称 = '" + s_park_where + "'";
                } else {
                    exeSql += " WHERE 公园名称 = '" + parkname + "'";
                }
            }
            // editor.setValue(sql);
            $('#s_type').combobox(
                {
                    disabled: false,
                    method: 'GET',
                    url: g_url_head + "/configureAjax?id=49&foreign=" + sqlName,
                    prompt: '请填入设备类型',
                    valueField: 'name',
                    textField: 'name',
                    panelHeight: 'auto',
                    panelMaxHeight: 150,
                    editable: true,
                    // onLoadSuccess: function () {
                    //     var val = $(this).combobox('getData');
                    //     for (var item in val[0]) {
                    //         if (item == "name") {
                    //             $(this).combobox("select", val[0][item]);
                    //         }
                    //     }
                    // },
                });
        } else if ((sqlName.indexOf("sz_项目标准备件基本信息表") != -1)||(sqlName.indexOf("pk_项目标准备件基本信息表") != -1)) {
            $("#beijian").css("display", "block");
            $("#sqldatadiv").css("height", "94%");
        } else if ((sqlName.indexOf("all_文件管理") != -1)|| (sqlName.indexOf("avc_文件下载") != -1) || (sqlName.indexOf("jd_文件下载") != -1) || (sqlName.indexOf("zgb_文件下载") != -1)) {
            $("#fileSea").css("display", "block");
            $("#sqldatadiv").css("height", "94%");
        } else if (sqlName.indexOf("货品提单") != -1) {
            $("#goodbill").css("display", "block");
            $("#sqldatadiv").css("height", "94%");
        } else if (sqlName.indexOf("dq_工厂任务") != -1) {
            $("#quanjusearch").css("display", "block");
            $("#sqldatadiv").css("height", "94%");
        } else {
            $("#sqldatadiv").css("height", "99%");
            $("#tb").css("display", "none");
            $("#goodbill").css("display", "none");
            $("#beijian").css("display", "none");
            $("#fileSea").css("display", "none");
            $("#quanjusearch").css("display", "none");
        }

        loadData(exeSql, 1, initPageSize, function (r) {
            if (typeof sqlName === 'undefined' || (sqlName.indexOf("ownfunc_") === -1)) {
                temp_exeSql = exeSql;
                if (!r) {
                    layer.msg("执行中止");
                    return false;
                }
                if (r.info) {
                    //$("#resultCode").text("> "+r.success.code);
                    $("#resultMsg").text(" >>> " + r.info);
                    $("#resultTime").text(" >>> 时间：Xs");
                }
                if (r.success) {
                    if (r.rows && r.rows != null) {
                        element.tabChange('result', 'data');
                        var sqlname = getSqlTableName(exeSql);
                        //通知通告
                        // var msg; //独立版的layer无需执行这一句
                        // $.ajax({
                        //     type: "GET",
                        //     url: g_url_head + '/configureAjax',//读取函数
                        //     data: {id: 28, foreign: sqlname},
                        //     dataType: "json",
                        //     async: false,
                        //     success: function (r) {
                        //         if (r.length == 0) {
                        //         } else {
                        //             msg = r[0].notice;
                        //             $(document).ready(function (e) {
                        //                 ScrollText($('#scrollText'), 23, 200, msg, 'left', 1, 20);//滚动字幕
                        //             })
                        //         }
                        //     }
                        // })

                        var rowMenu = [];
                        rowMenu.push({
                            iconCls: 'icon-more', text: "详细属性",
                            handler: function (e, item, menu, grid, rowIndex, row) {
                                cloumnDetail(row);
                            }
                        });
                        $.ajax({
                            type: "GET",
                            url: g_url_head + '/configureAjax',//读取函数
                            data: {id: 26, foreign: sqlname},
                            dataType: "json",
                            async: false,
                            success: function (r) {
                                if (r.length != 0) {
                                    var children = [];
                                    r.forEach(function (value, i) {
                                        var ss = {
                                            text: value.funcname,
                                            handler: function (e, item, menu, grid, rowIndex, row) {
                                                // selfSql =null;
                                                // sqlName = value.funcname;
                                                // var nodes = $("#dstable").tree("findNodes", function (node) {
                                                //     return $.string.contains(node.text, sqlName);
                                                // });
                                                // var node = nodes[0];
                                                // // chosed = $(this).tree('getChildren',node.target);
                                                // g_node.text  = value.funcname;
                                                sqlName = value.funcname;
                                                runFunc(2, row);
                                            }
                                        };
                                        children.push(ss)
                                    });
                                    rowMenu.push({iconCls: 'icon-table', text: "启动函数", children: children});
                                } else {
                                    // rowMenu.push({text: "启动函数"});
                                }
                            },
                            error: function (r) {
                                if (r.success == '0') {
                                    layer.alert('对不起，无法连接服务器，请检查您的计算机硬件以及网络连接是否正常！');
                                }
                            }
                        });

                        // LOG日志逻辑
                        if (sqlName === 'log_operation_report') {
                            rowMenu.push({
                                iconCls: 'icon-tip', text: "详细故障信息",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    openReport(row);
                                }
                            });
                        } else if (sqlName === 'log_projector_report') {
                            rowMenu.push({
                                iconCls: 'icon-tip', text: "投影详细故障信息",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    openReportProjector(row);
                                }
                            });
                        } else if (sqlName.indexOf("qr_全部质量记录") != -1) {
                            rowMenu.push({
                                iconCls: 'icon-applyQR', text: "申请质量记录",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    applyQR(row);
                                }
                            });
                        } else if (sqlName.indexOf("qr_质量记录填写") != -1) {
                            rowMenu.push({
                                iconCls: 'icon-saveQR', text: "填写质量记录",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    showQR(row);
                                }
                            });
                            rowMenu.push({
                                iconCls: 'icon-qr-detail', text: "质量记录详情",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    seeQR(row);
                                }
                            });
                            rowMenu.push({
                                iconCls: 'icon-look', text: "查看质量记录",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    window.open(g_url_head + "/ureport/preview?_u=file:" + row.质量记录 + ".ureport.xml&mid=" + row.流水号id);
                                }
                            });
                            // } else if ((sqlName.indexOf("货品提单详细") != -1) || (sqlName.indexOf("货品提单信息表") != -1)) {
                        } else if (sqlName.indexOf("货品提单") != -1) {
                            rowMenu.push({
                                iconCls: 'icon-look', text: "生成物料需求表格",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    // window.open(g_url_head + "/ureport/excel/sheet?_u=file:公园酒店物料申请.ureport.xml&system_no=" + row.系统单号);
                                    window.open(g_url_head + "/ureport/preview?_u=file:公园酒店物料申请.ureport.xml&system_no=" + row.系统单号);
                                }
                            });
                            rowMenu.push({
                                iconCls: 'icon-look', text: "生成物料质检表格",
                                handler: function (e, item, menu, grid, rowIndex, row) {
                                    // window.open(g_url_head + "/ureport/excel/sheet?_u=file:公园酒店物料申请.ureport.xml&system_no=" + row.系统单号);
                                    window.open(g_url_head + "/ureport/preview?_u=file:公园酒店物料质检.ureport.xml&system_no=" + row.系统单号);
                                }
                            });
                            if (sqlName.indexOf("芜湖货品提单信息表") != -1) {
                                if (deptname == 13) {//芜湖财务
                                    rowMenu.push({
                                        iconCls: 'icon-remove', text: "撤销改单",
                                        handler: function (e, item, menu, grid, rowIndex, row) {
                                            goodpucharseDelete(row);
                                        }
                                    });
                                }
                            }

                        }
                        if (sqlName.indexOf("avc_人员作业管理表") != -1) {
                                rowMenu.push({
                                    iconCls: 'icon-remove', text: "删除该单",
                                    handler: function (e, item, menu, grid, rowIndex, row) {
                                        t_avc_recordDelete(row);
                                    }
                                });
                        }
                        if (sqlName.indexOf("dq_工厂任务流程单") != -1) {
                            if ((deptname == 1)||(deptname == 2)) {//avc和调试部
                                rowMenu.push({
                                    iconCls: 'icon-remove', text: "删除该单",
                                    handler: function (e, item, menu, grid, rowIndex, row) {
                                        electricTaskDelete(row);
                                    }
                                });
                            }
                        }   if (sqlName.indexOf("游乐设施自检探伤信息表") != -1) {
                            // if (deptname == 21) {//总工办技术中心
                                rowMenu.push({
                                    iconCls: 'icon-redo', text: "撤销该单",
                                    handler: function (e, item, menu, grid, rowIndex, row) {
                                        tanshangrollback(row);
                                    }
                                });
                                rowMenu.push({
                                    iconCls: 'icon-remove', text: "删除该单",
                                    handler: function (e, item, menu, grid, rowIndex, row) {
                                        tanshangDelete(row);
                                    }
                                });
                            // }
                        }
                        $('#sqldata').datagrid({
                            title: sqlName,
                            rownumbers: true,
                            fit: true,
                            fitColumns: false,
                            singleSelect: true,
                            striped: true,
                            pagination: true,
                            pageList: [10, 100, 200, 500, 1000, 1500, 2000],
                            loadMsg: "查询中，请稍后...",
                            pageNumber: 1,// 在设置分页属性的时候初始化页码。
                            pageSize: 100,// 在设置分页属性的时候初始化页面大小。
                            // toolbar: opToolbar(sqlName),
                            remoteSort: false,// 关闭服务器排序
                            sortName: '',
                            sortOrder: 'desc',
                            columns: op(sqlName, r, view),
                            frozenColumns: opt(r, view),
                            data: r,
                            enableRowContextMenu: true,
                            selectOnRowContextMenu: true,
                            refreshMenu: true,
                            pagingMenu: false,
                            rowContextMenu: rowMenu,
                            enableHeaderContextMenu: true,
                            enableHeaderClickMenu: false,
                            enableGroupSummary: {enable: true, mode: "local", ignoreFormatter: false},
                            rowTooltip: false, //是否启用行数据的 tooltip 功能，若该属性为true，则设置在columns中的tooltip会自动失效
                            cache: false,
                            onDblClickRow: function (rowIndex, row) {
                                openReport(row);
                            },
                            navigatingWithKey: true,
                            navigateHandler: {
                                up: function (targetIndex) {
                                    console.log("功能待开发");
                                },
                                down: function (targetIndex) {
                                    console.log("功能待开发");
                                },
                                enter: function (selectedData) {
                                    cloumnDetail(selectedData[0]);
                                }
                            }
                            // total:r.total
                        });

                        // initHeaderCellClickMenu();

                        var p = $('#sqldata').datagrid('getPager');
                        var options = $("#sqldata").datagrid("getPager").data("pagination").options;
                        if (p) {
                            $(p).pagination({
                                beforePageText: '第',
                                afterPageText: '页 共 {pages}页',
                                total: r.total,
                                // displayMsg: '查询时间：'+r.time+'s  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 显示 {from}到{to} ,共 {total}条记录',
                                displayMsg: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 显示 {from}到{to} ,共 {total}条记录',
                                onSelectPage: function (page, pageSize) {
                                    // var size = options.pageSize;
                                    g_page = page;
                                    g_pageSize = pageSize;
                                    if (pageSize > 1000) {
                                        layer.confirm('&nbsp;&nbsp;&nbsp;&nbsp;您确定要查询超过1000条数据记录吗？可能需要花费一段时间去加载！', {
                                            btn: ['确定', '取消'] //按钮
                                        }, function () {
                                            exeSql = g_exeSql_temp;
                                            loadData(exeSql, page, pageSize, function (r2) {
                                                if (r2.success) {
                                                    if (r2.rows && r2.rows != null) {
                                                        var gridOpts = $('#sqldata').datagrid('options');
                                                        gridOpts.pageNumber = page;
                                                        gridOpts.pageSize = pageSize;
                                                        $('#sqldata').datagrid('loadData', r2.rows);
                                                        $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                                            total: r2.total,
                                                            pageNumber: page
                                                        });
                                                    }
                                                }
                                            });
                                            layer.closeAll();
                                        }, function () {
                                            p.pagination({
                                                pageSize: 100
                                            })
                                        });
                                    } else {
                                        exeSql = g_exeSql_temp;
                                        loadData(exeSql, page, pageSize, function (r2) {
                                            if (r2.success) {
                                                if (r2.rows && r2.rows != null) {
                                                    var gridOpts = $('#sqldata').datagrid('options');
                                                    gridOpts.pageNumber = page;
                                                    gridOpts.pageSize = pageSize;
                                                    $('#sqldata').datagrid('loadData', r2.rows);
                                                    $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                                        total: r2.total,
                                                        pageNumber: page
                                                    });
                                                }
                                            }
                                        });
                                    }
                                },
                                onChangePageSize: function (pageSize) {
                                    if (pageSize > 1000) {
                                        layer.confirm('&nbsp;&nbsp;&nbsp;&nbsp;您确定要查询超过1000条数据记录吗？可能需要花费一段时间去加载！', {
                                            btn: ['确定', '取消'] //按钮
                                        }, function () {
                                            exeSql = g_exeSql_temp;
                                            loadData(exeSql, 1, pageSize, function (r2) {
                                                if (r2.success) {
                                                    if (r2.rows && r2.rows != null) {
                                                        $('#sqldata').datagrid('loadData', r2.rows);
                                                        $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                                            total: r2.total,
                                                            pageNumber: 1
                                                        });
                                                    }
                                                }
                                            });
                                            layer.closeAll();
                                        }, function () {
                                            p.pagination({
                                                pageSize: 100
                                            })
                                        });
                                    } else {
                                        exeSql = g_exeSql_temp;
                                        loadData(exeSql, 1, pageSize, function (r2) {
                                            if (r2.success) {
                                                if (r2.rows && r2.rows != null) {
                                                    $('#sqldata').datagrid('loadData', r2.rows);
                                                    $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                                                        total: r2.total,
                                                        pageNumber: 1
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                } else {
                    element.tabChange('result', 'info');
                }
                // if(cloumnFlag.length>0){
                //     var fields = $("#sqldata").datagrid("getColumnFields");
                //     for(var i = 0;i<fields.length;i++){
                //         $("table tr td[field="+fields[i]+"]").addClass("textEllipsis");//需要改变的列
                //     }
                // }
            } else if (sqlName.indexOf("ownfunc_") != -1 || sqlName.indexOf("function_") != -1) {
                g_exeSql = temp_exeSql;
                if (!r) {
                    layer.msg("执行中止");
                    return false;
                }
                if (r.info) {// 提示信息
                    $("#resultMsg").text(" >>> " + r.info);
                    $("#resultTime").text(" >>> 时间：Xs");
                }
                if (r.success) {
                    if (r.rows && r.rows != null) {
                        element.tabChange('result', 'data');
                        var json = r.rows[0];
                        var msg = (Object.values(json))[0];
                        layer.msg(msg);
                        datagrid_refresh(g_exeSql);
                        // $('#sqldata').datagrid('reload');
                        // var url = $("#sqldata").datagrid("options");
                        // $("#left").find(".panel .datagrid     .easyui-fluid").find(".datagrid-wrap .panel-body .panel-body-noheader").find(".datagrid-pager .pagination").find("table tbody tr td:eq(12)").find("a.l-btn .l-btn-small .l-btn-plain").trigger("click");
                        // setTimeout(function () {
                        //     $('#sqldata').datagrid('reload');
                        // },5000);
                        // $(".l-btn-icon pagination-load").trigger("click");
                    }
                } else {
                    element.tabChange('result', 'info');
                }
            }
        });
    });

    $("#save").click(function () {
        var allSql = editor.getValue();
        if (allSql === "") {
            layer.msg("无保存内容");
            return false;
        }
        layer.open({
            type: 1,
            title: 'SQL基本信息'
            , area: ['500px', '300px']
            , content: $('#save_div')
            , btn: ['保存', '取消']
            , yes: function (index, layero) {
                var name = $('#save_div input[name="name"]').val();
                var desc = $('#save_div textarea[name="desc"]').val();
                var sql = allSql;
                if ($.trim(name) === "") {
                    layer.msg("名称不能为空");
                    return false;
                }
                $.ajax({
                    type: "GET",
                    url: g_url_head + '/savechaxun',
                    data: {name: name, desc: desc, sql: sql, username: username},
                    dataType: "json",
                    async: false,
                    beforeSend: function () {
                        // loading();
                    },
                    success: function (r) {
                        if (r.success) {
                            // layer.alert('保存成功！');
                            layer.closeAll(); //疯狂模式，关闭所有层
                            init();
                        }
                    },
                    error: function (r) {
                        if (r.success == '0') {
                            layer.alert('对不起，无法连接服务器，请检查您的计算机硬件以及网络连接是否正常！');
                        }
                    }
                });

            }
            , bt2: function (index, layero) {
                //return false 开启该代码可禁止点击该按钮关闭
            }
        });
    });
    //…
});

// editor.setSize('height', '100px');
// 最小高度
var MIN_HEIGHT = 100;

//对编辑器这个node添加鼠标事件
var editorNode = document.getElementById('code');

var hahahha = document.getElementsByClassName('CodeMirror-wrap')[0];
// console.log('初始值：' + hahahha.offsetHeight);
//
var dragBar = document.getElementById('handle');

// 返回编辑器的高度
function getHeight(node) {
    var h = window.getComputedStyle(node, null).height.replace(/px$/, "");
    if (h === 'auto') {
        h = node.offsetHeight;
    }
    return parseInt(h);
}

// 释放鼠标的时候触发的事件
function release() {
    // console.log('end');
    // 删除和添加都是使用两个参数的
    document.body.removeEventListener('mousemove', drag);
    window.removeEventListener('mouseup', release);
}

// drag 事件
function drag(e) {
    /*  console.log('drag');
        console.log('e.y:' + e.y);
        console.log('pos_y:' + pos_y);
        console.log('startHeight:' + startHeight);
        console.log('-----------');
        console.log(startHeight + e.y - pos_y);*/
    // var image = document.getElementById("showsqlimage");
    // var path = image.getAttribute('src');
    // if(path == 'image/showsql.png'){
    //     image.setAttribute("src","image/hiddensql.png");
    // }else {
    //     editor.setSize('height', '0px');
    //     image.setAttribute("src","image/showsql.png");
    // }
    editor.setSize('height', Math.max(MIN_HEIGHT, (startHeight + e.y - pos_y)) + "px");
    setDatalistHeight();// 数据表格高度
}

dragBar.addEventListener('mousedown', function (e) {
    // console.log('start');
    // 开始高度
    startHeight = getHeight(hahahha);
    // console.log('开始高度：' + startHeight);
    pos_x = e.x;
    pos_y = e.y;
    //只有按下鼠标移动的时候才能移动
    document.body.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', release);
});

function getSelectedRange() {
    return {from: editor.getCursor(true), to: editor.getCursor(false)};
}

/**** 初始化***/
// 格式化
$('#format').click(function () {
    // 获取输入的值
    // console.log(editor.getValue());
    // console.log('范围：' + JSON.stringify(getSelectedRange()));
    var range = getSelectedRange();
    editor.autoFormatRange(range.from, range.to);

    function format() {
        // console.time('formatting');
        var str = sqlFormatter.format(editor.getValue(), {language: 'sql'});
        editor.setValue(str);
        // console.log('格式化的代码:' + str);
        // console.timeEnd('formatting');
    }

    format();

});

// 清空
$('#delete').click(function () {
    editor.setValue("");
});

// 退出
$('#logout').click(function () {
    // window.history.back(-1);
    // window.location.href = 'index.html';
    $.ajax({
        type: "post",
        url: g_url_head + "/chaxunlogout",
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            if (data.success == 1) {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    })
});

var header_sql;

// 重写 datagrid reload 刷新
function datagrid_refresh(exeSql) {
    header_sql = exeSql;
    if (exeSql === '' || exeSql === null || typeof exeSql === 'undefined') {
        console.log("执行原视图语句为空，不能进行刷新操作！但函数操作成功！");
    } else {
        if (g_page == '' || g_page == null || typeof g_page == 'undefined') {
            g_page = 1;
        }
        if (g_pageSize == '' || g_pageSize == null || typeof g_pageSize == 'undefined') {
            g_pageSize = 100;
        }
        loadData(exeSql, g_page, g_pageSize, function (row) {
            if (row.success) {
                if (row.rows && row.rows != null) {
                    $('#sqldata').datagrid('loadData', row.rows);
                }
                var p = $('#sqldata').datagrid('getPager');
                $(p).pagination('refresh', {	// 改变选项并刷新分页栏信息
                    total: row.total,
                    pageNumber: g_page
                });
            }
        });
    }
};

function init() {
// 初始化数据库表树结构
//     $.ajax({
//         type: "get",
//         // url : baseUrl + 'json/tables.json',
//         url: g_url_head + '/chaxunview?username=' + username + '&role=' + role + '&_t=' + +new Date().getTime(),
//         dataType: "json",
//         async: true,
//         xhrFields: {
//             withCredentials: true
//         },
//         success: function (r) {
//             if (r) {
//                 // 加载待选树
//                 $('#dstable').tree({
//                     valueField: 'id',
//                     textField: 'text',
//                     loadMsg: '加载中，请稍后...',
//                     lines: true,
//                     data: r,
//                     animate: true,
//                     dnd: true,
//                     onContextMenu: function (e, node) {
//                         e.preventDefault();
//                         chosed = $(this).tree('getChildren', node.target);
//                         var level = $(this).tree("getLevel", node.target);
//                         g_node = node;
//                         g_nodeParent = $(this).tree("getParent", node.target);
//                         g_nodeGrandParent = $(this).tree("getParent", g_nodeParent.target);
//                         sqlName = node.text;
//                         selfSql = node.sql;
//                         var nodeParent = $(this).tree("getParent", node.target);
//                         if (level == 2) {
//                             if (nodeParent.text == '个人应用') {
//                                 layer.msg("请选择个人应用下的视图和函数！");
//                                 return false;
//                             } else {
//                                 $('#mm').menu('show', {
//                                     left: e.pageX,
//                                     top: e.pageY
//                                 });
//                                 return true;
//                             }
//                         } else if (level == 3) {
//                             var nodeGrandParent = $(this).tree("getParent", nodeParent.target);
//                             if (nodeGrandParent.text == '个人应用') {
//                                 $('#mm').menu('show', {
//                                     left: e.pageX,
//                                     top: e.pageY
//                                 });
//                                 return true;
//                             } else {
//                                 layer.msg("请选择个人应用下的视图和函数！");
//                                 return false;
//                             }
//                         } else {
//                             layer.msg("请选择父节点（视图和函数名）！");
//                         }
//                     },
//                     onBeforeDrop: function (target, source, point) {
//                         var targetNode = $(this).tree('getNode', target);
//                         var nodeParent = $(this).tree("getParent", source.target);
//                         var nodeGrandParent = $(this).tree("getParent", targetNode.target);
//                         var level = $(this).tree("getLevel", source.target);
//                         if (level == 2) {
//                             if (point === 'append' && nodeParent.text != '常用sql') {
//                                 if (targetNode.text === '个人应用') {
//                                     return true;
//                                 } else if (nodeGrandParent.text === '个人应用') {
//                                     return true;
//                                 } else {
//                                     layer.msg("请将视图和函数拖拽进个人应用模块！");
//                                     return false;
//                                 }
//                             } else {
//                                 layer.msg("请将视图和函数拖拽进个人应用模块！");
//                                 return false;
//                             }
//                         } else {
//                             layer.msg("请将视图和函数拖拽进个人应用模块！");
//                             return false;
//                         }
//                     },
//                     onDrop: function (target, source, point) {
//                         var targetNode = $(this).tree('getNode', target);
//                         var nodeGrandParent = $(this).tree("getParent", targetNode.target);
//                         if (targetNode.text === '个人应用') {
//                             layer.open({
//                                 type: 1,
//                                 title: '新增个人应用'
//                                 , area: ['500px', '160px']
//                                 , content: $('#app_div')
//                                 , btn: ['保存', '取消']
//                                 , yes: function (index, layero) {
//                                     var appname = $('#app_div input[name="appname"]').val();
//                                     if ($.trim(appname) === "") {
//                                         layer.msg("应用名称不能为空");
//                                         return false;
//                                     }
//                                     var sqlValue1 = username + ";" + appname + ";" + 1 + ";" + 'id';
//                                     $.ajax({
//                                         type: "GET",
//                                         url: g_url_head + '/configureIdSave',
//                                         data: {id: 27, sqlValue: sqlValue1},
//                                         dataType: "json",
//                                         //async : false,
//                                         beforeSend: function () {
//                                             // loading();
//                                         },
//                                         success: function (r) {
//                                             var sqlValue2 = username + ";" + source.text + ";" + '0' + ";" + r.id;
//                                             if (r.success) {
//                                                 layer.confirm('您确定要将「' + source.text + '」设置成个人应用：「' + appname + '」吗？', {
//                                                     btn: ['确定', '取消'] //按钮
//                                                 }, function () {
//                                                     $.ajax({
//                                                         type: "post",
//                                                         url: g_url_head + '/configureIdSave',
//                                                         dataType: 'json',
//                                                         data: {id: 27, sqlValue: sqlValue2},
//                                                         success: function (data) {
//                                                             if (data.success == 1) {
//                                                                 layer.msg("保存成功");
//                                                                 init();
//                                                                 layer.closeAll();
//                                                             } else {
//                                                                 layer.msg("保存失败");
//                                                             }
//                                                         }
//                                                     });
//                                                 });
//                                             } else {
//                                                 layer.msg("保存失败");
//                                             }
//                                         },
//                                         error: function (r) {
//                                             if (r.success == '0') {
//                                                 layer.alert('保存失败！');
//                                             }
//                                         }
//                                     });
//                                 }
//                                 , btn2: function (index, layero) {
//                                     init();
//                                 }
//                                 , cancel: function () {
//                                     init();
//                                 }
//                             });
//                         } else if (nodeGrandParent.text === '个人应用') {
//                             var appname = targetNode.text;
//                             var sqlValue = username + ";" + source.text + ";" + '0' + ";" + targetNode.id;
//                             layer.confirm('您确定要将「' + source.text + '」设置成个人应用：「' + appname + '」吗？', {
//                                     btn: ['确定', '取消'],//按钮
//                                     cancel: function () {
//                                         init();
//                                     }
//                                 }, function () {
//                                     $.ajax({
//                                         type: "post",
//                                         url: g_url_head + '/configureIdSave',
//                                         dataType: 'json',
//                                         data: {id: 27, sqlValue: sqlValue},
//                                         success: function (data) {
//                                             if (data.success == 1) {
//                                                 layer.msg("保存成功");
//                                                 init();
//                                                 layer.closeAll();
//                                             } else {
//                                                 layer.msg("保存失败");
//                                             }
//                                         }
//                                     });
//                                 }, function () {
//                                     init();
//                                 }
//                             );
//                         }
//                     },
//                     onDblClick: function (node) {
//                         var level = $(this).tree("getLevel", node.target);
//                         var nodeParent = $(this).tree("getParent", node.target);
//                         if (level == 2) {
//                             if (nodeParent.text == '个人应用') {
//                                 $('#app_div input[name="appname"]').val(node.text)
//                                 layer.open({
//                                     type: 1,
//                                     title: '修改个人应用'
//                                     , area: ['500px', '160px']
//                                     , content: $('#app_div')
//                                     , btn: ['保存', '取消']
//                                     , yes: function (index, layero) {
//                                         var appname = $('#app_div input[name="appname"]').val();
//                                         if ($.trim(appname) === "") {
//                                             layer.msg("应用名称不能为空");
//                                             return false;
//                                         }
//                                         var sqlValue1 = username + ";" + appname + ";" + 1 + ";" + node.text;
//                                         $.ajax({
//                                             type: "GET",
//                                             url: g_url_head + '/configureUpdateSave',
//                                             data: {id: 25, sqlValue: sqlValue1},
//                                             dataType: "json",
//                                             //async : false,
//                                             beforeSend: function () {
//                                                 // loading();
//                                             },
//                                             success: function (r) {
//                                                 if (r.success) {
//                                                     layer.msg("保存成功");
//                                                     init();
//                                                     layer.closeAll();
//                                                 } else {
//                                                     layer.msg("保存失败");
//                                                 }
//                                             },
//                                             error: function (r) {
//                                                 if (r.success == '0') {
//                                                     layer.alert('保存失败！');
//                                                 }
//                                             }
//                                         });
//                                     }
//                                     , btn2: function (index, layero) {
//                                         init();
//                                     }
//                                     , cancel: function () {
//                                         init();
//                                     }
//                                 });
//                             }
//                         } else {
//                             $(this).tree(node.state === 'closed' ? 'expand' : 'collapse', node.target);
//                             node.state = node.state === 'closed' ? 'open' : 'closed';
//                             // runFunc();
//                         }
//                     }
//                 });
//                 $("#dstable .tree-node").each(function (i, item) {
//                     $(item).attr("onselectstart", "return false;");
//                     $(item).css("cursor", "default");
//                     $(item).children(".tree-title").attr("draggable", "true");
//                 });
//                 /* 拖动目标元素时触发drag事件 */
//                 document.addEventListener("dragstart", function (e) {
//                     e.dataTransfer.setData('text', $(e.target).text());
//                 }, false);
//             }
//         },
//         // complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
//         //     if(status=='error' || status=='timeout'){
//         //         $.messager.alert('温馨提示', '超时！');
//         //     }else {
//         //         $.ajax({
//         //             type: "GET",
//         //             url: g_url_head + '/configureAjax',//读取函数
//         //             data: {id: 35, foreign: username},
//         //             dataType: "json",
//         //             async: false,
//         //             success: function (r) {
//         //                 viewname_index = r[0].viewname;
//         //                 sql_index = r[0].sql;
//         //                 if(sql_index == '' || sql_index == null || typeof sql_index == "undefined"){
//         //                     editor.setValue("SELECT * FROM " + viewname_index);
//         //                     $("#execute").click();
//         //                 }else {
//         //                     editor.setValue(sql_index.replace(/彑/g, "'"));
//         //                     $("#execute").click();
//         //                 }
//         //             }
//         //         })
//         //     }
//         // },
//         error: function (r) {
//             if (r.readyState == '0' && r.status == '0') {
//                 layer.alert('对不起，无法连接服务器，请检查您的计算机硬件以及网络连接是否正常！请按照正常规则使用');
//             }
//         }
//     });
}

var tmp = function () {
    editor.refresh();
};
setTimeout(tmp, 100);

/**
 * 根据sql语句获取表名
 */
function getSqlTableName(exeSql) {
    var lowerSql = exeSql.toLowerCase();
    var str1 = exeSql.substring(0, lowerSql.indexOf("from"));
    var str2 = exeSql.substring(str1.length + 4, lowerSql.length);
    var strsplit = str2.split(" ");
    var fileName = strsplit[1];
    return fileName;
}

/**
 * 返回当前日期
 */
function getCurrentDate() {
    var date = new Date();
    var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
    var month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0"
        + (date.getMonth() + 1);
    return date.getFullYear() + '/' + month + '/' + day;
};

/**
 * 返回当前时间
 */
function getCurrentTime() {
    var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日

    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分
    var ss = now.getSeconds();          //分

    var clock = year + "-";
    if (month < 10)
        clock += "0";

    clock += month + "-";
    if (day < 10)
        clock += "0";

    clock += day + " ";
    if (hh < 10)
        clock += "0";

    clock += hh + ":";
    if (mm < 10)
        clock += '0';
    clock += mm + ":";
    if (ss < 10)
        clock += '0';
    clock += ss;
    return clock;
}

/**
 * 获取登录系统 用户的中文名
 */
function getUserName() {
    var usernamec = null;
    //查找 操作人的 姓名
    $.ajax({
        url: g_url_head + '/configureAjax?id=1&foreign=' + username,
        dataType: "json",
        async: false,
        success: function (r) {
            usernamec = r[0].operators_name;
        }
    });
    return usernamec;
}

/**
 * 获取 deptname 当前部门的中文名
 */
function getDeptname() {
    var deptnamec = null;
    //查找 操作人的 姓名
    $.ajax({
        url: g_url_head + '/configureAjax?id=48&foreign=' + deptname,
        dataType: "json",
        async: false,
        success: function (r) {
            deptnamec = r[0].department;
        }
    });
    return deptnamec;
}

/**
 * 视图编辑通用方法
 */
var cloumnDetailSelectId = 0;
var cloumnDetailResultId = 0;
var cloumnDetailTemp = 0;

function cloumnDetail(row) {
    var arr = [];
    var cloumnId = '';
    var strValue = '';
    for (var key in row) {
        var obj = new Object();
        obj.name = key;
        obj.group = $("#sqldata").datagrid("getPanel").panel('options').title;
        if (key.indexOf("id") != -1 || key.indexOf("ID") != -1 || key.indexOf("Id") != -1 || key.indexOf("记录id") != -1) {
            cloumnId = row[key];
            obj.value = "<div class='textEllipsis_cloumndetail'>" + row[key] + "</div>";
        }
        // else if(cloumnId == ''){
        //     layer.msg("该视图暂无id或主键不能进行更新操作！");
        //     return;
        // }
        else if (key.indexOf("_") != -1) {
            var index = key.lastIndexOf("_");
            var str = key.substring(index + 1, key.length);
            var con = str.substring(0, 2);
            obj.value = row[key];
            switch (con) {
                case '01':
                    obj.editor = {
                        "type": "textbox",
                        "options": {
                            required: true,
                            onChange: function (newValue, oldValue) {
                                var row_01 = $('#tablepg').propertygrid('getSelected');
                                if (row_01 != null) {
                                    var key_01 = row_01.name;
                                    var index_01 = key_01.lastIndexOf("_");
                                    var str_01 = key_01.substring(index_01 + 1, key_01.length);
                                    var id_01 = str_01.substring(2, str_01.length);
                                }
                                if (event.keyCode == 13) {
                                    isUpdateView(id_01, newValue, oldValue, cloumnId);
                                }
                            }
                        }
                    };
                    break;
                case '02':
                    obj.editor = {
                        "type": "numberbox",
                        "options": {
                            required: true,
                            onChange: function (newValue, oldValue) {
                                var row_02 = $('#tablepg').propertygrid('getSelected');
                                if (row_02 != null) {
                                    var key_02 = row_02.name;
                                    var index_02 = key_02.lastIndexOf("_");
                                    var str_02 = key_02.substring(index_02 + 1, key_02.length);
                                    var id_02 = str_02.substring(2, str_02.length);
                                }
                                if (event.keyCode == 13) {
                                    isUpdateView(id_02, newValue, oldValue, cloumnId);
                                }
                            }
                        }
                    };
                    break;
                case '03':
                    var id_03 = str.substring(2, str.length);
                    var cloumnname_03 = row[key];
                    obj.editor = {
                        "type": "combobox",
                        "options": {
                            disabled: false,
                            method: 'GET',
                            url: g_url_head + "/configureView?id= " + id_03 + "&flag=1",
                            valueField: 'name',
                            textField: 'name',
                            panelHeight: 'auto',
                            panelMaxHeight: 150,
                            editable: true,
                            onSelect: function (result) {
                                if (result.name != cloumnname_03) {
                                    var cloumnValue = result.name;
                                    cloumnname_03 = result.name;
                                    if (cloumnValue == '') {
                                        layer.msg('视图更新内容为空！');
                                        return;
                                    } else if (cloumnId == '') {
                                        layer.msg('该视图无主键，不能进行更新操作！');
                                        return;
                                    } else {
                                        $.ajax({
                                            type: "GET",
                                            url: g_url_head + '/configureView',
                                            data: {id: id_03, flag: 2, cloumnValue: cloumnValue, cloumnId: cloumnId},
                                            dataType: "json",
                                            async: false,
                                            success: function (r) {
                                                if (r[0].success > 0) {
                                                    layer.msg('视图更新成功！');
                                                    // $("#dialogpg").dialog("close");
                                                    datagrid_refresh(editor.getValue());
                                                    arr = [];
                                                } else {
                                                    layer.msg('视图更新出错，请联系管理员！');
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    };
                    break;
                case '04':
                    obj.editor = {
                        "type": "datebox",
                        "options": {
                            required: true,
                            onChange: function (newValue, oldValue) {
                                var row_04 = $('#tablepg').propertygrid('getSelected');
                                if (row_04 != null) {
                                    var key_04 = row_04.name;
                                    var index_04 = key_04.lastIndexOf("_");
                                    var str_04 = key_04.substring(index_04 + 1, key_04.length);
                                    var id_04 = str_04.substring(2, str_04.length);
                                }
                                isUpdateView(id_04, newValue, oldValue, cloumnId);
                            }
                        }
                    };
                    break;
                case '05':
                    obj.editor = {
                        "type": "datetimebox",
                        "options": {
                            required: true,
                            onChange: function (newValue, oldValue) {
                                var row_05 = $('#tablepg').propertygrid('getSelected');
                                if (row_05 != null) {
                                    var key_05 = row_05.name;
                                    var index_05 = key_05.lastIndexOf("_");
                                    var str_05 = key_05.substring(index_05 + 1, key_05.length);
                                    var id_05 = str_05.substring(2, str_05.length);
                                }
                                isUpdateView(id_05, newValue, oldValue, cloumnId);
                            }
                        }
                    };
                    break;
                case '06':
                    var id_06 = str.substring(2, str.length);
                    var cloumnname_06 = row[key];
                    obj.editor = {
                        "type": "combobox",
                        "options": {
                            disabled: false,
                            method: 'GET',
                            url: g_url_head + "/configureView?id= " + id_06 + "&flag=1",
                            valueField: 'id',
                            textField: 'name',
                            panelHeight: 'auto',
                            panelMaxHeight: 150,
                            editable: true,
                            onSelect: function (result) {
                                if (result.id != cloumnname_06) {
                                    var cloumnValue = result.id;
                                    cloumnname_06 = result.name;
                                    if (cloumnValue == '') {
                                        layer.msg('视图更新内容为空！');
                                        return;
                                    } else if (cloumnId == '') {
                                        layer.msg('该视图无主键，不能进行更新操作！');
                                        return;
                                    } else {
                                        $.ajax({
                                            type: "GET",
                                            url: g_url_head + '/configureView',
                                            data: {id: id_06, flag: 2, cloumnValue: cloumnValue, cloumnId: cloumnId},
                                            dataType: "json",
                                            async: false,
                                            success: function (r) {
                                                if (r[0].success > 0) {
                                                    layer.msg('视图更新成功！');
                                                    // $("#dialogpg").dialog("close");
                                                    datagrid_refresh(editor.getValue());
                                                    arr = [];
                                                } else {
                                                    layer.msg('视图更新出错，请联系管理员！');
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    };
                    break;
                case '07':
                    var id_07 = str.substring(2, str.length);
                    var selectType = id_07.substring(0, 1);
                    var selectId = id_07.substring(1, id_07.length);
                    cloumnDetailSelectId = selectId;
                    if (selectType == '1') {
                        cloumnDetailTemp = selectId;
                        strValue = key.substring(0, index);
                        var cloumnname_071 = row[key];
                        obj.editor = {
                            "type": "combobox",
                            "options": {
                                disabled: false,
                                method: 'GET',
                                url: g_url_head + "/configureView?id= " + selectId + "&flag=1",
                                valueField: 'name',
                                textField: 'name',
                                panelHeight: 'auto',
                                panelMaxHeight: 150,
                                editable: true,
                                onSelect: function (result) {
                                    cloumnDetailResultId = result.id;
                                    if (result.name !== cloumnname_071) {
                                        var cloumnValue = result.name;
                                        cloumnname_071 = result.name;
                                        if (cloumnValue == '') {
                                            layer.msg('视图更新内容为空！');
                                            return;
                                        } else if (cloumnId == '') {
                                            layer.msg('该视图无主键，不能进行更新操作！');
                                            return;
                                        } else {
                                            $.ajax({
                                                type: "GET",
                                                url: g_url_head + '/configureView',
                                                data: {
                                                    id: cloumnDetailTemp,
                                                    flag: 2,
                                                    cloumnValue: cloumnValue,
                                                    cloumnId: cloumnId
                                                },
                                                dataType: "json",
                                                async: false,
                                                success: function (r) {
                                                    if (r[0].success > 0) {
                                                        layer.msg('视图中一级下拉框更新成功！');
                                                        // $("#dialogpg").dialog("close");
                                                        datagrid_refresh(editor.getValue());
                                                        arr = [];
                                                    } else {
                                                        layer.msg('视图更新出错，请联系管理员！');
                                                    }
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                        };
                    } else {
                        var cloumnname_072 = row[key];
                        obj.editor = {
                            "type": "xuchao",
                            "options": {
                                "id": strValue,
                                "cloumnDetailResultId": cloumnDetailResultId,
                                "cloumnname_072": cloumnname_072,
                                "selectId": selectId,
                                "cloumnId": cloumnId
                            }
                        };
                    }
                    break;
                case '10':
                    obj.editor = {
                        "type": "textbox",
                        "options": {
                            required: true,
                            multiline: true,
                            height: "50px",
                            onChange: function (newValue, oldValue) {
                                var row_10 = $('#tablepg').propertygrid('getSelected');
                                if (row_10 != null) {
                                    var key_10 = row_10.name;
                                    var index_10 = key_10.lastIndexOf("_");
                                    var str_10 = key_10.substring(index_10 + 1, key_10.length);
                                    var id_10 = str_10.substring(2, str_10.length);
                                }
                                if (event.ctrlKey == true && event.keyCode == 13) {
                                    isUpdateView(id_10, newValue, oldValue, cloumnId);
                                }
                            }
                        }
                    };
                    break;
                case '11':
                    obj.editor = {
                        "type": "numberbox",
                        "options": {
                            required: true,
                            precision: 2,
                            onChange: function (newValue, oldValue) {
                                if (event.keyCode == 13) {
                                    var row_11 = $('#tablepg').propertygrid('getSelected');
                                    if (row_11 != null) {
                                        var key_11 = row_11.name;
                                        var index_11 = key_11.lastIndexOf("_");
                                        var str_11 = key_11.substring(index_11 + 1, key_11.length);
                                        var id_11 = str_11.substring(2, str_11.length);
                                    }
                                    isUpdateView(id_11, newValue, oldValue, cloumnId);
                                }
                            }
                        }
                    };
                    break;
                case '12':
                    obj.editor = {
                        "type": "textbox",
                        "options": {
                            required: true,
                            multiline: true,
                            height: "240px",
                            onChange: function (newValue, oldValue) {
                                var row_12 = $('#tablepg').propertygrid('getSelected');
                                if (row_12 != null) {
                                    var key_12 = row_12.name;
                                    var index_12 = key_12.lastIndexOf("_");
                                    var str_12 = key_12.substring(index_12 + 1, key_12.length);
                                    var id_12 = str_12.substring(2, str_12.length);
                                }
                                if (event.ctrlKey == true && event.keyCode == 13) {
                                    isUpdateView(id_12, newValue, oldValue, cloumnId);
                                }
                            }
                        }
                    };
                    break;
                case '13'://特殊更新视图->先（级联）删除视图再创建视图
                    obj.editor = {
                        "type": "textbox",
                        "options": {
                            required: true,
                            multiline: true,
                            height: "240px",
                            onChange: function (newValue, oldValue) {
                                var row_13 = $('#tablepg').propertygrid('getSelected');
                                if (row_13 != null) {
                                    var key_13 = row_13.name;
                                    var index_13 = key_13.lastIndexOf("_");
                                    var str_13 = key_13.substring(index_13 + 1, key_13.length);
                                    var id_13 = str_13.substring(2, str_13.length);
                                }
                                if (event.ctrlKey == true && event.keyCode == 13) {
                                    isUpdateView(id_13, newValue, oldValue, cloumnId);
                                }
                            }
                        }
                    };
                    break;
                default:
                    var id_default = str.substring(2, str.length);
                    obj.editor = {
                        "type": "validatebox",
                        "options": {
                            required: true
                        }
                    };
            }
        } else {
            obj.value = "<div class='textEllipsis_cloumndetail'>" + row[key] + "</div>";
        }
        arr.push(obj);
    }
    $("#dialogpg").dialog("open");
    $('#tablepg').propertygrid({
        columns: [[
            {field: 'name', title: '属性', width: 100, sortable: true},
            {field: 'value', title: '值', width: 300, resizable: false}
        ]],
        data: arr,
        showGroup: true,
        scrollbarSize: 0,
        enableHeaderContextMenu: true,
        enableHeaderClickMenu: false,
    });
}

$.extend($.fn.datagrid.defaults.editors, {
    xuchao: {
        init: function (container, options) {
            var input = $('<input id="' + options.id + '" type="text">').appendTo(container);
            var cloumnname_072 = options.cloumnname_072;
            var id_072 = options.selectId;
            var cloumnId = options.cloumnId;
            $('#' + options.id).combobox({
                disabled: false,
                method: 'GET',
                url: g_url_head + "/configureView?id= " + cloumnDetailSelectId + "&flag=1&foreign=" + cloumnDetailResultId,
                valueField: 'name',
                textField: 'name',
                panelHeight: 'auto',
                panelMaxHeight: 150,
                editable: true,
                onSelect: function (result) {
                    if (result.name != cloumnname_072) {
                        var cloumnValue = result.name;
                        cloumnname_072 = result.name;
                        if (cloumnValue == '') {
                            layer.msg('视图更新内容为空！');
                            return;
                        } else if (cloumnId == '') {
                            layer.msg('该视图无主键，不能进行更新操作！');
                            return;
                        } else {
                            $.ajax({
                                type: "GET",
                                url: g_url_head + '/configureView',
                                data: {id: id_072, flag: 2, cloumnValue: cloumnValue, cloumnId: cloumnId},
                                dataType: "json",
                                async: false,
                                success: function (r) {
                                    if (r[0].success > 0) {
                                        layer.msg('视图更新成功！');
                                        // $("#dialogpg").dialog("close");
                                        datagrid_refresh(editor.getValue());
                                        arr = [];
                                    } else {
                                        layer.msg('视图更新出错，请联系管理员！');
                                    }
                                }
                            })
                        }
                    }
                }
            });
            return input.combobox(options);
        },
        destroy: function (target) {
            $(target).combobox('destroy');
        },
        getValue: function (target) {
            return $(target).combobox('getValue');
        },
        setValue: function (target, value) {
            $(target).combobox('setValue', value);
        },
        resize: function (target, width) {
            $(target).combobox('resize', width);
        }
    }
});

function isUpdateView(id, newValue, oldValue, cloumnId) {
    if (id == 13) {
        viewUpdate(id, newValue, oldValue, cloumnId, 3);
    } else {
        viewUpdate(id, newValue, oldValue, cloumnId, 2);
    }
}

function viewUpdate(id, newValue, oldValue, cloumnId, flag) {
    if (oldValue !== '') {
        var cloumnValue = newValue;
        if (cloumnValue == '') {
            layer.msg('视图更新内容为空！');
            return;
        } else if (cloumnId == '') {
            layer.msg('该视图无主键，不能进行更新操作！');
            return;
        } else {
            $.ajax({
                type: "GET",
                url: g_url_head + '/configureView',
                data: {id: id, flag: flag, cloumnValue: cloumnValue, cloumnId: cloumnId},
                dataType: "json",
                async: false,
                success: function (r) {
                    if (r[0].success > 0) {
                        layer.msg('视图中字段更新成功！');
                        // $("#dialogpg").dialog("close");
                        datagrid_refresh(editor.getValue());
                        arr = [];
                    } else {
                        layer.msg('视图更新出错，请联系管理员！');
                    }
                }
            })
        }
    }
}