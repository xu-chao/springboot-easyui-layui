$('#distribution').click(function () {

    var index = layer.open({
        type: 1,
        title: '用户分配',
        content: $('#view-member-div'),
        id: 'TWork',
        area: ['900px', '600px'],//宽高不影响最大化
        success: function (layero, index) {
            layui.use(['tableEdit'], function (exports) {
                var table = layui.table, tableEdit = layui.tableEdit, $ = layui.$;
                var params = [];

                var paramsdept = [];
                $.ajax({
                    type: "post",
                    url: g_url_head + '/configureFunc',
                    dataType: 'json',
                    data: {id: 24},
                    success: function (data) {
                        $.each(data, function (i, item) {//layui下拉框识别 name和value
                            paramsdept.push({"name": item.id, "value": item.name});
                        });
                    }
                });

                if (username == "superadmin") {
                    $.ajax({
                        type: "post",
                        url: g_url_head + '/configureFunc',
                        dataType: 'json',
                        data: {id: 18},
                        success: function (data) {
                            $.each(data, function (i, item) {//layui下拉框识别 name和value
                                params.push({"name": item.id, "value": item.name});
                            });
                        }
                    });
                    var cols = table.render({
                        elem: '#view-member-table'
                        , id: 'usermenutable'
                        , url: g_url_head + '/userview'
                        , limit: 10//默认为10
                        , height: 452
                        , page: true
                        , cols: [[
                            {field: 'username', width: 100, title: '用户名', sort: true} //sort：true页面可进行排序操作
                            , {field: 'operators_name', title: '中文名', event: 'operators_name', config: {type: 'input'}}
                            , {field: 'role', title: '角色'}
                            , {field: 'cityname', title: '所属城市'}
                            , {
                                field: 'menu_name',
                                title: '绑定菜单',
                                width: 200,
                                event: 'menu_name',
                                config: {"type": "select", "data": params, enabled: true},
                                templet: function (d) {
                                    var str = [];
                                    d.menu_name.forEach(function (e) {
                                        str.push(e.value)
                                    });
                                    return str.join(' || ');
                                }
                            }, {
                                field: 'deptname',
                                title: '部门名称',
                                event: 'deptname',
                                config: {type: "select", "data": paramsdept},
                                templet: function (d) {
                                    if (d.deptname) {
                                        if (d.deptname.value) {
                                            return d.deptname.value;
                                        }
                                        return d.deptname;
                                    }
                                    return ''
                                }
                            }
                        ]]
                    }).config.cols;
                    /**
                     * 参数cols是table.render({})中的cols属性值
                     * aop代理是基于event点击事件进行操作的，
                     * 因此cols中务必开启event点击事件！
                     **/
                    var aopTable = tableEdit.aopObj(cols); //获取一个aop对象
                    /**
                     * 注意：
                     * 1、 aopTable.on('tool(xxx)',function (obj) {})
                     * 2、 table.on('tool(yyy)',function (obj) {})
                     * 如果1中的xxx与2中的yyy字符串相同时，
                     * 不能同时用，用了会造成后调用者覆盖前调用者。
                     * 应该直接用1来代替2，因为1中包含了2中的事件。
                     * 如果不相同，则可以同时使用。
                     **/
                    aopTable.on('tool(tableEvent)', function (obj) {
                        var field = obj.field; //单元格字段
                        var value = obj.value; //修改后的值
                        var data = obj.data; //当前行旧数据
                        var event = obj.event; //当前单元格事件属性值
                        var update = {};
                        update[field] = value;
                        //把value更新到行中
                        if (event == "deptname") {
                            $.ajax({
                                type: "post",
                                url: g_url_head + '/changeUserAnyOne',
                                dataType: 'json',
                                data: {username: data.username, anyField: "deptname", anyValue: value.name},
                                success: function (data) {
                                    if (data.success == 1) {
                                        obj.update(update);
                                        layer.msg("保存成功");
                                    } else {
                                        layer.msg("保存失败");
                                    }
                                }
                            })
                        } else if (event == "menu_name") {
                            var menuArr = "";
                            value.forEach(function (element, index) {
                                menuArr += element.name + ";";
                            })
                            $.ajax({
                                type: "post",
                                url: g_url_head + '/saveMenuUser',
                                dataType: 'json',
                                data: {username: data.username, menuArr: menuArr},
                                success: function (data) {
                                    if (data.success == 1) {
                                        obj.update(update);
                                        layer.msg("保存成功");
                                    } else {
                                        layer.msg("保存失败");
                                    }
                                }
                            })
                        }else if (event == "operators_name") {
                            // operators_name,operators_username
                            var sqlValue =  data.username+ ";" + value;
                            $.ajax({
                                type: "post",
                                url: g_url_head + '/configureSave',
                                dataType: 'json',
                                data: {id: 53, sqlValue: sqlValue},
                                success: function (data) {
                                    if (data.success == 1) {
                                        obj.update(update);
                                        layer.msg("保存成功");
                                    } else {
                                        layer.msg("保存失败");
                                    }
                                }
                            })
                        }

                        /**
                         *说白了，此obj与table.on('tool(tableEvent)',function (obj) {})
                         *中的obj对象是同一个，所以可以如此操作。
                         *
                         * */
                    });
                } else {
                    $.ajax({
                        type: "post",
                        url: g_url_head + '/configureAjax',//读取函数
                        data: {id: 43, foreign: cityname},
                        dataType: 'json',
                        success: function (data) {
                            $.each(data, function (i, item) {//layui下拉框识别 name和value
                                params.push({"name": item.menu_id, "value": item.menu_name});
                            });
                        }
                    });
                    var cols = table.render({
                        elem: '#view-member-table'
                        , id: 'usermenutable'
                        , url: g_url_head + '/userViewByCitytId?cityname=' + cityname
                        , limit: 10//默认为10
                        , height: 452
                        , page: true
                        , cols: [[
                            {field: 'username', width: 100, title: '用户名', sort: true} //sort：true页面可进行排序操作
                            , {field: 'operators_name', title: '中文名', event: 'operators_name', config: {type: 'input'}}
                            , {field: 'role', title: '角色'}
                            // , {field: 'cityname', title: '所属城市'}
                            , {
                                field: 'deptname', title: '所属部门',
                                event: 'dept_name',
                                config: {"type": "select", "data": paramsdept},
                                templet: function (d) {
                                    if (d.deptname) {
                                        return d.deptname
                                    }
                                }
                            },
                            {
                                field: 'menu_name',
                                title: '绑定菜单',
                                width: 200,
                                event: 'menu_name',
                                config: {"type": "select", "data": params, enabled: true},
                                templet: function (d) {
                                    var str = [];
                                    d.menu_name.forEach(function (e) {
                                        str.push(e.value)
                                    });
                                    return str.join(' || ');
                                }
                            }
                            // , {
                            //     field: 'menu_name',
                            //     title: '绑定菜单',
                            //     width: 200,
                            //     event: 'menu_name',
                            //     config: {"type": "select", "data": params},
                            //     templet: function (d) {
                            //         var str = [];
                            //         if (d.menu_name.name) {
                            //             return d.menu_name.value
                            //         } else {
                            //             //如果是数组 则循环
                            //             d.menu_name.forEach(function (e) {
                            //                 str.push(e.value)
                            //             });
                            //             return str.join(' || ');
                            //         }
                            //     }
                            // }
                        ]]
                    }).config.cols;
                    /**
                     * 参数cols是table.render({})中的cols属性值
                     * aop代理是基于event点击事件进行操作的，
                     * 因此cols中务必开启event点击事件！
                     **/
                    var aopTable = tableEdit.aopObj(cols); //获取一个aop对象
                    /**
                     * 注意：
                     * 1、 aopTable.on('tool(xxx)',function (obj) {})
                     * 2、 table.on('tool(yyy)',function (obj) {})
                     * 如果1中的xxx与2中的yyy字符串相同时，
                     * 不能同时用，用了会造成后调用者覆盖前调用者。
                     * 应该直接用1来代替2，因为1中包含了2中的事件。
                     * 如果不相同，则可以同时使用。
                     **/
                    aopTable.on('tool(tableEvent)', function (obj) {
                        var field = obj.field; //单元格字段
                        var value = obj.value; //修改后的值
                        var data = obj.data; //当前行旧数据
                        var event = obj.event; //当前单元格事件属性值
                        var update = {};
                        update[field] = value;
                        //把value更新到行中

                        var menuArr = value.name;
                        if (event == "dept_name") {
                            data = {
                                tableName: "sys_user",
                                anyFieldValue: "deptname = '" + value.name + "'",
                                foreignName: "username",
                                foreignValue: data.username
                            }
                            $.ajax({
                                type: "post",
                                url: g_url_head + '/configureUpdate',
                                dataType: 'json',
                                data: data,
                                success: function (data) {
                                    if (data.success == 1) {
                                        layer.msg("保存成功");
                                    } else {
                                        layer.msg("保存失败");
                                    }
                                }
                            })
                        } else if (event == "menu_name") {
                            var menuArr = "";
                            value.forEach(function (element, index) {
                                menuArr += element.name + ";";
                            })
                            $.ajax({
                                type: "post",
                                url: g_url_head + '/saveMenuUser',
                                dataType: 'json',
                                data: {username: data.username, menuArr: menuArr},
                                success: function (data) {
                                    if (data.success == 1) {
                                        obj.update(update);
                                        layer.msg("保存成功");
                                    } else {
                                        layer.msg("保存失败");
                                    }
                                }
                            })
                        }else if (event == "operators_name") {
                            // operators_name,operators_username
                            var sqlValue =  data.username+ ";" + value;
                            $.ajax({
                                type: "post",
                                url: g_url_head + '/configureSave',
                                dataType: 'json',
                                data: {id: 53, sqlValue: sqlValue},
                                success: function (data) {
                                    if (data.success == 1) {
                                        obj.update(update);
                                        layer.msg("保存成功");
                                    } else {
                                        layer.msg("保存失败");
                                    }
                                }
                            })
                        }
                    });
                }


                $('#usersearch').click(function () {
                    var demoReload = $('#demoReload');
                    var nameReload = $('#nameReload');
                    //执行重载
                    table.reload('usermenutable', {
                        page: {
                            curr: 1 //重新从第 1 页开始
                        }
                        , where: {
                            searchId: demoReload.val(),
                            searchName: nameReload.val()
                        }
                    }, 'data');
                });
                $('#resetsearch').click(function () {
                    $('#demoReload').val("");
                    $('#nameReload').val("");
                    //执行重载
                    table.reload('usermenutable', {
                        page: {
                            curr: 1 //重新从第 1 页开始
                        }
                        , where: {
                            searchId: "",
                            searchName: "",
                        }
                    }, 'data');
                });
            });
        },

        end: function () {

        }

    });


// //只需要加这一句就可以啦 窗口最大化
//         layer.full(index);
});

$('#newUser').click(function () {
    var parkData = [];
    var depetData = [];
    var url = "";
    if (username == "superadmin") {
        url = g_url_head + '/configureAjax?id=34';
    } else {
        url = g_url_head + '/configureAjax?id=34&foreign=' + cityname;
    }
    $.ajax({
        type: "GET",
        url: g_url_head + '/configureAjax?id=24',
        dataType: "json",
        async: false,
        success: function (data) {
            data.forEach(function (value) {
                var map = {"name": value.department, "value": value.id};
                depetData.push(map);
            })

        }, error: function () {
            alert("部门加载失败")
        }
    });
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        async: false,
        success: function (data) {
            data.forEach(function (value) {
                var map = {"name": value.park_name, "value": value.park_pinyin};
                parkData.push(map);
            })

        }, error: function () {
            alert("所属公园加载失败")
        }
    });
    var demo3 = xmSelect.render({
        el: '#userpark',
        radio: true,
        clickClose: true,
        filterable: true,
        initValue: [cityname],
        model: {
            label: {
                type: 'text',
                text: {
                    //左边拼接的字符
                    left: '',
                    //右边拼接的字符
                    right: '',
                    //中间的分隔符
                    separator: ', ',
                },
            }
        },
        data: parkData
    });
    var demo4 = xmSelect.render({
        el: '#userdeptment',
        radio: true,
        clickClose: true,
        filterable: true,
        initValue: [deptname],
        model: {
            label: {
                type: 'text',
                text: {
                    //左边拼接的字符
                    left: '',
                    //右边拼接的字符
                    right: '',
                    //中间的分隔符
                    separator: ', ',
                },
            }
        },
        data: depetData
    });
    if (username == "superadmin") {
        demo3.update({disabled: false});
    } else {
        demo3.update({disabled: true});
    }

    var index1 = layer.open({
        type: 1,
        area: ['500px', '600px'],
        offset: "auto",
        title: '表分配',
        content: $('#view-member-user'),
        id: 'TWorkTree'
        , btn: ['确定', '关闭'] //只是为了演示
        , yes: function () {
            var g_flag = false;
            var username = $('#view-member-user input[name="username"]').val();
            var password = $('#view-member-user input[name="password"]').val();
            var chinesename = $('#view-member-user input[name="chinesename"]').val();
            var userpark = demo3.getValue('valueStr');
            var userdeptment = demo4.getValue('valueStr');
            if ($.trim(username) == "") {
                layer.msg("用户名不能为空");
                return false;
            }
            var reg = new RegExp("^[0-9]*$");
            if (!reg.test(username)) {
                layer.msg("用户名必须纯数字");
                return false;
            }
            if (username.length != 6) {
                layer.msg("用户名长度必须为6");
                return false;
            }
            if ($.trim(password) == "") {
                layer.msg("密码不能为空");
                return false;
            }
            if ($.trim(chinesename) == "") {
                layer.msg("中文名不能为空");
                return false;
            }
            $.ajax({
                type: "GET",
                url: g_url_head + '/configureAjax',
                data: {id: 52, foreign: username},
                dataType: "json",
                async: false,
                success: function (r) {
                    if (r.length > 0) {
                        g_flag = true;
                    } else {
                        g_flag = false;
                    }
                }
            })
            if (g_flag) {
                layer.msg("已经存在该用户");
                return false;
            }
            //username,password,role,cityname,deptname
            var sqlValue = username + ";" + password + ";" + "admin" + ";" + userpark + ";" + userdeptment;
            var data = {id: 52, sqlValue: sqlValue};

            $.ajax({
                type: "GET",
                url: g_url_head + '/configureSave',
                data: data,
                dataType: "json",
                async: false,
                beforeSend: function () {
                    layer.load();
                },
                success: function (r) {
                    layer.closeAll('loading');
                    if (r.success) {
                        var sqlValue = username + ";" +  chinesename;
                        var data = {id: 53, sqlValue: sqlValue};
                        $.ajax({
                            type: "GET",
                            url: g_url_head + '/configureSave',
                            data: data,
                            async: false,
                            dataType: "json",
                            success: function (r) {
                                if (r.success) {
                                    layer.confirm('添加成功!', {
                                        closeBtn: 0,//不显示关闭按钮
                                        btn: ['确认'] //按钮
                                    }, function () {
                                        layer.close(layer.index);
                                        layer.close(index1);
                                        $("#userAdd")[0].reset();
                                        layui.form.render();
                                        $('#resetsearch').click();
                                    });
                                } else {
                                    layer.confirm('添加失败!', {
                                        closeBtn: 0,//不显示关闭按钮
                                        btn: ['确认'] //按钮
                                    }, function () {
                                        layer.close(layer.index);
                                    });
                                }
                            }
                        })

                    } else {
                        layer.confirm('添加失败!', {
                            closeBtn: 0,//不显示关闭按钮
                            btn: ['确认'] //按钮
                        }, function () {
                            layer.close(layer.index);
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