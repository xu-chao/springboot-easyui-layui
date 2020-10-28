function resetFile() {
    $("#f_fliename").textbox('setText', '');
    $("#f_filetype").textbox('setText', '');
    $("#f_filepeople").textbox('setText', '');
    searchFile();
}
function searchFile() {
    var exesql = "";
    var andwhere = "";
    exesql = temp_exeSql;
    if ((exesql.indexOf("where") != -1) || (exesql.indexOf("WHERE") != -1)) {
        andwhere = " and ";
    } else {
        andwhere = " where ";
    }
    var f_fliename = $("#f_fliename").textbox('getText');
    var f_filetype = $("#f_filetype").textbox('getText');
    var f_filepeople = $("#f_filepeople").textbox('getText');

    if (f_fliename != '') {
        f_fliename = " AND 文件名 LIKE '%" + f_fliename + "%'";
    }
    if (f_filetype != '') {
        f_filetype = " AND 文件格式 LIKE '%" + f_filetype + "%'";
    }
    if (f_filepeople != '') {
        f_filepeople = " AND 管理人 LIKE '%" + f_filepeople + "%'";
    }
    var alland = f_fliename + f_filetype + f_filepeople;
    alland = alland.substr(5, alland.length);
    if(alland==""){
        andwhere = "";
    }
    exesql += andwhere+alland
    editor.setValue(exesql);
    g_page = 1;
    datagrid_refresh(editor.getValue());
}