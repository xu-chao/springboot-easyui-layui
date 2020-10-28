var excelType = null;//判断excel的导入哪个表标识
var excelFileFlag = 0;//判断是否第一次
//酒店物料查看 开启窗口动作
function openDQExcelimplBefore(type, name) {
    excelType = type;
    $("#excelimpldivdq").dialog("open").dialog("setTitle", name);
    $('#excelimpldivdq').window('center');//使Dialog居中显示
}

function openExcelimplBefore(type, name) {

    //初始化脚本
    layui.use('laydate', function () {
        var laydate = layui.laydate;
        //日期范围
        laydate.render({
            elem: '#gpDateRange'
            , theme: 'molv'
            , range: true
        });
    })
    excelType = type;
    $("#excelimpldiv").dialog("open").dialog("setTitle", name);
    var gpsystem_nos = null;
    var gpDateRange = null;
    $('#excelimpldiv').window('center');//使Dialog居中显示
    if (excelFileFlag == 0) {
        excelFileFlag = 1;
        // layui.use('upload', function () {
        //     var $ = layui.jquery
        //         , upload = layui.upload;
        // $("#excelimplup").click(function(){
        //     gpDateRange = $("#gpDateRange").val()
        //     if(gpDateRange==""){
        //         layer.msg('请填写 日期范围');
        //         return false;
        //     }
        // });
        // upload.render({
        //     elem: '#excelimplop'
        //     , url: g_url_head + "/api/excelImpl/excelin" //单文件上传
        //     ,data:{excelType:excelType,gpDateRange:gpDateRange}
        //     , auto: false
        //     , accept: 'file' //普通文件
        //     //,multiple: true
        //     , bindAction: '#excelimplup'
        //     , before: function (obj) {
        //
        //     }
        //     , done: function (res) {
        //         if (res == 1) {
        //             layer.msg('上传成功');
        //             $("#gpDateRange").val("");
        //         } else {
        //             layer.msg('上传失败');
        //         }
        //     }
        // });
        // })
    }

}

function updqExcelFile() {
    var oMyForm = new FormData();
    // var fileObj = $("#contractFile")[0].files[0];
    var filePathName = $("#contractDQFile").filebox('getValue');
    if (filePathName == "") {
        layer.msg("请选择要上传的文件");
        return false;
    }
    var files = $("#contractDQFile").next().find('input[type=file]')[0].files;
    if (files[0].size > 1024 * 1024 * 20) {
        layer.msg("上传文件不能大于20M！");
        return;
    }
    var usernamec = getUserName();
    // data = {excelType: excelType, gpDateRange: gpDateRange}
    oMyForm.append("file", files[0]);
    oMyForm.append("gpDateRange", '');
    oMyForm.append("usernamec", usernamec);
    oMyForm.append("excelType", excelType);
    $.ajax({
        url: g_url_head + "/api/excelImpl/excelin",//单文件上传
        type: 'POST',
        cache: false,
        data: oMyForm,
        dataType: "text",
        processData: false,
        contentType: false,
        async: false,
        xhrFields: {
            withCredentials: true
        },
    }).done(function (res) {
        var ret = JSON.parse(res);
        if (ret.success) {
            layer.msg(ret.result);
            resetdqExcelForm()
        } else {
            layer.msg(ret.result);
        }
    }).fail(function (res) {
        layer.msg('上传失败');
    });
}

function upExcelFile() {
    var oMyForm = new FormData();
    // var fileObj = $("#contractFile")[0].files[0];
    var filePathName = $("#contractFile").filebox('getValue');
    if (filePathName == "") {
        layer.msg("请选择要上传的文件");
        return false;
    }
    if (excelType == 1) {
        var files = $("#contractFile").next().find('input[type=file]')[0].files;
        if (files[0].size > 1024 * 1024 * 20) {
            layer.msg("上传文件不能大于20M！");
            return;
        }
        var gpDateRange = $("#gpDateRange").val()
        if (gpDateRange == "") {
            layer.msg('请填写 日期范围');
            return false;
        }
        var usernamec = getUserName();
        // data = {excelType: excelType, gpDateRange: gpDateRange}
        oMyForm.append("file", files[0]);
        oMyForm.append("gpDateRange", gpDateRange);
        oMyForm.append("usernamec", usernamec);
        oMyForm.append("excelType", excelType);
    }


    $.ajax({
        url: g_url_head + "/api/excelImpl/excelin",//单文件上传
        type: 'POST',
        cache: false,
        data: oMyForm,
        dataType: "text",
        processData: false,
        contentType: false,
        async: false,
        xhrFields: {
            withCredentials: true
        },
    }).done(function (res) {
        var ret = JSON.parse(res);
        if (ret.success) {
            layer.msg(ret.result);
            $('#form1').form('clear');
        }
        // else if(res=="2"){
        //     layer.msg('日期范围小于上次日期范围');
        // }
        else {
            layer.msg(ret.result);
        }
    }).fail(function (res) {
        layer.msg('上传失败');
    });
}

function resetdqExcelForm() {
    $('#excelimpldivdq').dialog('close');
    $('#form2').form('clear');
}
function resetExcelForm() {
    $('#excelimpldiv').dialog('close');
    $('#form1').form('clear');
    $("#gpDateRange").val("");
};