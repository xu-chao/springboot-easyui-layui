var createViewAjax;
var editorView;
$(function () {
    editorView = CodeMirror.fromTextArea(document.getElementById("viewCode"), {
        mode: "text/c-mysql", //实现SQL代码高亮
        lineNumbers: true,
        theme: "default",
        keyMap: "default",
        extraKeys: {"Tab": "autocomplete"},
        hint: CodeMirror.hint.sql,
        lineWrapping: true,         //是否换行
        foldGutter: true,           //是否折叠
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"], //添加行号栏，折叠栏
        hintOptions: {
            tables: tablewords
        }
    });

    editorView.setSize('height', $(window).height() - 125);

    editorView.on("keyup", function (cm, event) {
        if (!cm.state.completionActive &&
            ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 52 || event.keyCode == 219 || event.keyCode == 190)) {
            CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
        }
    });
});
function createView() {
    var element = layui.element;
    element.tabChange('result', 'createView');
    editorView.setSize('height', '0px');
    editorView.setSize('height', $(window).height() - 125);
}

function viewnameDialogOpen() {
    $("#createViewnameDiv").dialog("open").dialog("setTitle", "创建视图并保存");
}

/**
 * 提交对话框
 */
function createViewnameSubmit() {
    var viewSql = "";
    var allViewSql = editorView.getValue();
    if ($.trim(allViewSql) === "") {
        return false;
    }
    var flag = false;
    var str;
    allViewSql = allViewSql.replace(/彑/g, "'");
    var viewSplit = allViewSql.split(" ");
    $.each(viewSplit, function (index, word) {
        var w = word.toLowerCase();
        if (index == 0) {
            if (!(w == "select")) {//如果不是以select开头
                str = "不是以select开头";
                flag = true;
                return false;
            }
        } else {
            if ((w === "into") || w == "update" || w == "delete" || w == "alter"
                || w == "insert" || w == "create" || w == "table"
                || w == "drop" || w == "show" || w == "lock" || w == "truncate"
                || w == "database" || w == "dropdb" || w == "references" || w == "trigger"
                || w == "connect" || w == "temporary" || w == "execute"
                || w == "usage" || w == "grant" || w == "commit" || w == "rollback") {
                flag = true;
                str = "含敏感字符串:" + w;
                return false;
            }
        }
    });
    if(flag){
        layer.alert(str, {
            skin: 'layui-layer-molv'
            , closeBtn: 1
            , anim: 1
            , btn: ['确定']
            , icon: 5
            , yes: function (index) {
                layer.close(index);
            }
        });
        return;
    }
    viewSql = allViewSql;
    var viewname = '';
    viewname = $('#viewname').textbox('getValue');
    if(viewSql == ''){
        layer.msg("未创建视图SQL语句！");
        return;
    }else if(viewname == ''){
        layer.msg("视图名为空！");
        return;
    } else {
        loadCreateView(viewSql, viewname,function (r) {
            if (r[0].success == 1) {
                layer.msg('视图创建成功！');
                resetcreateViewnameForm();
                var sqlGo = "SELECT * FROM pg_public_view WHERE 记录id = '" + viewname + "'";
                editor.setValue(sqlGo);
                $("#execute").click();
            }else {
                layer.msg("视图创建失败！");
            }
        });
    }
}

/**
 * 清空对话框
 */
function resetcreateViewnameForm() {
    $('#createViewnameDiv').dialog('close');
    $('#createViewnameFrom').form('clear');
};

/**
 * 异步加载数据
 */
function loadCreateView(sql, viewname, callback) {
    var url = g_url_head + '/chaxunSystem?role=' + role + '&_t=' + new Date().getTime();
    createViewAjax = $.ajax({
        type: "GET",
        url: url,
        data: {sql: sql, viewname:viewname},
        dataType: "json",
        //async:false,
        beforeSend: function () {
            loadingView();
        },
        success: function (r) {
            completeView();
            callback(r);
        },
        error: function (r) {
            completeView();
            if (r.success == '0') {
                layer.alert('对不起，无法连接服务器，请检查您的计算机硬件以及网络连接是否正常！');
            }
        }
    });
}

/**
 * 加载中...
 */
function loadingView() {
    $("#stopViewImg").attr("src", "image/stop1.png");
    $("#loadingView").show();
}

/**
 * 完成
 */
function completeView() {
    $("#loadingView").hide();
    $("#stopViewImg").attr("src", "image/stop0.png");
}

/**
 * ajax加载停止
 */
function stopViewLoadData() {
    if (createViewAjax) {
        createViewAjax.abort();
    }
}

/**
 * 导入导出功能
 */
function viewImport() {
    createSql("hqft-sql-" + new Date().getTime() + ".sql",editorView.getValue());
    return;
}
function viewExport() {
    $("#viewExportDiv").dialog("open");
}
function viewExportAll() {
    var file = $('#viewExportAllFile').filebox('getValue');
    var suffix = /\.[^\.]+$/.exec(file);
    if(suffix != '.sql'){
        layer.msg("请导入sql文件！");
        return;
    }else {
        var files = $("#viewExportAllFile").next().find('input[type=file]')[0].files;
        var reader = new FileReader();
        reader.onload = function() {
            if(reader.result) {
                editorView.setValue(reader.result);
                $("#viewExportDiv").dialog("close");
                resetviewExportForm();
            }else {
                layer.msg("无法读取到sql文件内容！");
                return;
            }
        };
        reader.readAsText(files[0]);
    }
}
function resetviewExportForm() {
    $('#viewExportDiv').dialog('close');
    $('#viewExportFrom').form('clear');
};

/**
 * 视图格式化
 */
$('#formatView').click(function () {
    var range = getSelectedRange();
    editorView.autoFormatRange(range.from, range.to);
    function format() {
        var str = sqlFormatter.format(editorView.getValue(), {language: 'sql'});
        editorView.setValue(str);
    }
    format();
});

/**
 * 视图清空
 */ 
$('#deleteView').click(function () {
    editorView.setValue("");
});

var createViewTmp = function () {
    editorView.refresh();
};
setTimeout(createViewTmp, 100);

/**
 * 生成sql文件并下载
 */
function createSql(filename,content,contentType) {
    if (!contentType) contentType = 'application/octet-stream';
    var a = document.createElement('a');
    var blob = new Blob([content], { 'type': contentType });
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

/**
 * 预览视图
 */  
function viewReview() {
    var reviewSql = editorView.getValue();
    if(reviewSql == ''){
        layer.msg("视图为空，不能进行预览！");
        return;
    }else {
        editor.setValue(reviewSql);
        $("#execute").click();
    }
}