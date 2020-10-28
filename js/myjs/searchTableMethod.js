function resetBeiJian() {
    $("#xiangmumc").textbox('setText', '');
    $("#beijianbm").textbox('setText', '');
    $("#beijianmc").textbox('setText', '');
    $("#xinghao").textbox('setText', '');
    searchBeiJian();
}
function resetquanju() {
    $("#quanjus").textbox('setText', '');
    searchquanjuetd();
}
function searchquanjuetd() {
    var exesql = "";
    var andwhere = "";
    exesql = temp_exeSql;
    if ((exesql.indexOf("where") != -1) || (exesql.indexOf("WHERE") != -1)) {
        andwhere = " or ";
    } else {
        andwhere = " where ";
    }
    var quanjus = $("#quanjus").textbox('getText');

    if (quanjus != '') {
        quanjus = " or 计划单号 LIKE '%" + quanjus + "%'"
            +" or 工程名称 LIKE '%" + quanjus + "%'"
            +" or 项目名称 LIKE '%" + quanjus + "%'"
            +" or 系统 LIKE '%" + quanjus + "%'"
            +" or 子项目 LIKE '%" + quanjus + "%'"
    }

    var alland = quanjus;
    alland = alland.substr(3, alland.length);
    if(alland==""){
        andwhere = "";
    }
    exesql += andwhere+alland
    editor.setValue(exesql);
    g_page = 1;
    datagrid_refresh(editor.getValue());
    // faultCount++;
}
function searchBeiJian() {
    var exesql = "";
    var andwhere = "";
    exesql = temp_exeSql;
    if ((exesql.indexOf("where") != -1) || (exesql.indexOf("WHERE") != -1)) {
        andwhere = " and ";
    } else {
        andwhere = " where ";
    }
    var xiangmumc = $("#xiangmumc").textbox('getText');
    var beijianbm = $("#beijianbm").textbox('getText');
    var beijianmc = $("#beijianmc").textbox('getText');
    var xinghao = $("#xinghao").textbox('getText');

    if (xiangmumc != '') {
        xiangmumc = " AND 项目名称 LIKE '%" + xiangmumc + "%'";
    }
    if (beijianbm != '') {
        beijianbm = " AND 备件编码 LIKE '%" + beijianbm + "%'";
    }
    if (beijianmc != '') {
        beijianmc = " AND 备件名称 LIKE '%" + beijianmc + "%'";
    }
    if (xinghao != '') {
        xinghao = " AND 型号 LIKE '%" + xinghao + "%'";
    }
    var alland = xiangmumc + beijianbm + beijianmc + xinghao;
    alland = alland.substr(5, alland.length);
    if(alland==""){
        andwhere = "";
    }
    exesql += andwhere+alland
    editor.setValue(exesql);
    g_page = 1;
    datagrid_refresh(editor.getValue());
    // faultCount++;
}