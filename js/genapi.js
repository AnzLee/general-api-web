var BaseURL = 'http://localhost:8012/api/';
var isFormat = false;

layui.use(['element','laytpl','form','table'], function(){
    var newAPITpl = newAPItpl.innerHTML
    var paramEncryptTpl = paramEncrypttpl.innerHTML
    var viewAPITpl = viewAPItpl.innerHTML
    var apiDatabaseTpl = apiDatabasetpl.innerHTML

    var $ = layui.jquery
    var element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
    var laytpl = layui.laytpl;
    var form = layui.form;
    var table = layui.table;

    var isDatabaseConn = false;

    //触发事件
    var active = {
        validDatabase: function () {
            var reg = /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/
            var dataName = $("input[name='dataName']")
                ,dataPath = $("input[name='dataPath']")
                ,dataType = $("select[name='dataType']")
                ,dataUsername = $("input[name='dataUsername']")
                ,dataPassword = $("input[name='dataPassword']")
            if(!reg.test(dataPath.val())){
                layer.tips('请输入正确的IP地址哦', dataPath);
            } else {
                var data = {
                    "dataName": dataName.val(),
                    "dataPath": dataPath.val(),
                    "dataType": dataType.val(),
                    "dataUsername": dataUsername.val(),
                    "dataPassword": dataPassword.val()
                }
                $.ajax({
                    url: BaseURL + "database",
                    type: 'post',
                    data: data,
                    dataType: 'json',
                    success: function(res) {
                        if(res.success) {
                            layer.msg("连接成功<br>", {time: 5000, btn: ['确定']});
                            isDatabaseConn = true;
                            for (var i = 0; i < res.tables.length; i++) {
                                var isExist = false;
                                var databaseTableSelect = $("select[name='databaseTable']")
                                $("select[name='databaseTable'] option").each(function() {
                                    var val = $(this).val();
                                    if (val == res.tables[i]) {
                                        isExist = true;
                                    }
                                })
                                if(!isExist){
                                    databaseTableSelect.append("<option value='" + res.tables[i] + "'>" + res.tables[i] + "</option>");
                                }
                            }
                            var apiDatabaseView = document.getElementById('apiDatabaseView');
                            laytpl(apiDatabaseTpl).render(data, function(html) {
                                apiDatabaseView.innerHTML = html;
                            })
                            form.render('select');
                        }else{
                            layer.msg("啊哦，出错了，请检查数据库配置<br>", {
                                time: 5000, //5s后自动关闭
                                btn: ['好的']
                            });
                        }
                    }
                })
            }
        }
        //新建API选项卡
        ,tabNewAPI: function() {
            if(document.getElementById('view'+10)){
                element.tabChange('index-tab', '10');
                location.hash = 'index-tab='+ 10;
            } else {
                activeNew('新建API', 'index-tab', 10, newAPITpl, data);
            }
        }
        //切回首页选项卡
        ,tabChangeIndex: function(){
            element.tabChange('index-tab', '0');
            location.hash = 'index-tab='+ 0;
        }
        //查看所有API
        ,tabViewAPI: function(){
            if(document.getElementById('view'+20)){
                element.tabChange('index-tab', '20');
                location.hash = 'index-tab='+ 20;
            } else {
                activeNew('所有API', 'index-tab', 20, viewAPITpl, {});
                table.render({
                    elem: '#viewAPI'
                    , url: 'test.json'
                    , cols: [[
                        {type: 'numbers'}
                        , {field: 'id', width: '8%', title: 'ID', sort: true, align: 'center'}
                        , {field: 'apiName', width: '8%', title: 'API名称', sort: true, align: 'center'}
                        , {field: 'apiProtocol', width: '8%', title: 'API协议', align: 'center'}
                        , {field: 'apiMethod', width: '8%', title: 'API格式', align: 'center'}
                        , {field: 'apiEncode', width: '8%', title: 'API编码', align: 'center'}
                        , {field: 'dataPath', width: '20%', title: '数据库地址', sort: true, align: 'center'}
                        , {field: 'paramNum', width: '10%', title: '参数个数', sort: true, align: 'center'}
                        , {field: 'responseType', width: '10%', title: '结果类型', sort: true, align: 'center'}
                        , {fixed: 'right', width: '16%', align:'center', toolbar: '#apiBar', title: '操作'}
                    ]]
                    , page: true
                });
            }
        }
        ,tabDelete: function(othis){
            //删除指定Tab项
            element.tabDelete('index-tab', '44'); //删除：“商品管理”
            othis.addClass('layui-btn-disabled');
        }
        ,tabChange: function(){
            //切换到指定Tab项
            element.tabChange('index-tab', '22'); //切换到：用户管理
        }
        ,format: function () {
            var temp = $('#apiContent').val();
            temp = temp.replace(/"/g,'~~');
            layer.open({
                type: 2 //iframe
                ,title: '格式化JSON'
                ,area: ['400px', '500px']
                ,shade: 0
                ,maxmin: true
                ,offset: [
                    $(window).height()*0.1
                    ,$(window).width()*0.65
                ]
                ,content: './template/formatjson.html#'+temp
                ,btn: ['关闭']
                ,btn1: function(){
                    layer.closeAll();
                }
                ,zIndex: layer.zIndex //重点1
                ,success: function(layero){
                    layer.setTop(layero); //重点2
                }
            });
        }
    };

    $('.site-nav-active').on('click', function(){
        var othis = $(this), type = othis.data('type');
        active[type] ? active[type].call(this, othis) : '';
    });

    //监听按钮
    $("body").delegate(".layui-btn", "click", function(){
        var othis = $(this), method = othis.data('method');
        active[method] ? active[method].call(this, othis) : '';
    });

    element.on('tab(index-tab)', function(elem){
        location.hash = 'index-tab='+ $(this).attr('lay-id');
    });

    element.on('tabDelete(index-tab)', function(data){
        var layid = location.hash.replace(/^#index-tab=/, '');
        if(layid==0){
        }else if(layid>9 && layid<20){
            //新增API面板关闭
        }
    });

    //监听指定开关
    form.on('switch(switchEncrypt)', function(data){
        //layer.tips('温馨提示：请注意开关状态的文字可以随意定义，而不仅仅是ON|OFF', data.othis)
        var layid = location.hash.replace(/^#index-tab=/, '');
        var paramEncryptView = document.getElementById('paramEncrypt'+layid);
        if(this.checked){
            paramEncryptView.innerHTML = paramEncryptTpl;
        } else {
            paramEncryptView.innerHTML = '';
        }
        form.render('select');
    });

    //自定义验证规则
    form.verify({
        title:[/[a-zA-Z_$][a-zA-Z0-9_$]*/, '请输入api名']
        ,pass: [/(.+){4,12}$/, '密码必须4到12位']
        ,content: function(value){
            layedit.sync(editIndex);
        }
        ,ip : [/((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/, '请输入ip地址']
    });

    //监听提交
    form.on('submit(submitAPI)', function(data){
        if(!isDatabaseConn){
            layer.msg('请先连接数据库<br/>（5秒后自动关闭）', {
                time: 3000, //5s后自动关闭
                btn: ['O的K']
            });
            return false;
        }
        if(isFormat || (($('#apiContent').val()=="") && (data.field.apiMethod="get"))){
            $.ajax({
                url:BaseURL+"api",
                data:data.field,
                type:'POST',
                dataType:'json',
                success:function(res){
                    if(res.content=='manager.message.success'){
                        data.elem.classList.add('layui-btn-disabled');
                        data.elem.disabled = true;
                        layer.msg('提交成功<br/>（5秒后自动关闭）', {
                            time: 5000, //5s后自动关闭
                            btn: ['太好了']
                        });
                    } else {
                        layer.msg('提交失败<br/>（5秒后自动关闭）', {
                            time: 5000, //5s后自动关闭
                            btn: ['我再找找问题','我等下再试试']
                        });
                    }
                },
                error:function (res) {
                    layer.msg('提交失败<br/>'+res.responseJSON.message+'<br/>（5秒后自动关闭）', {
                        time: 5000, //5s后自动关闭
                        btn: ['我再找找问题','我等下再试试']
                    });
                }
            })
        } else {
            layer.tips('请先完成验证哦！', $('#apiContent'));
        }
        return false;
    });

    //注销首页关闭按钮
    function removeX() {
        if($("li[lay-id='0']").children("i")){
            $("li[lay-id='0']").children("i").remove();
        }
    }

    //通用新增方法
    function activeNew(title,filter,id,template,data){
        //新增一个Tab项
        element.tabAdd(filter, {
            title: title
            ,content: '<div id="view'+id+'"></div>'
            ,id: id
        });
        var view = document.getElementById('view'+id);
        laytpl(template).render(data, function(html){
            view.innerHTML = html;
        });
        form.render();
        element.tabChange(filter, id);
        location.hash = 'index-tab='+ id;
        id++;
        removeX();
        return id;
    }

    //增加选择框点击事件监听方法（paramValueSelect、databaseTableSelect）
    function addSelect() {
        //点击选择参数值框paramValueSelect
        $("body").delegate("#paramValueSelect", 'click', function(){
            if($("select[name='databaseTable'] option").size()==1){
                layer.msg("请先连接至数据库<br>", {
                    time: 5000, //5s后自动关闭
                    btn: ['好的']
                });
            } else {
                if($("select[name='paramValue'] option").size()==1) {
                    layer.msg("请先选择数据表<br>", {
                        time: 5000, //5s后自动关闭
                        btn: ['好的']
                    });
                }
            }
        });
        //点击选择表框databaseTableSelect
        $("body").delegate("#databaseTableSelect", 'click', function(){
            if($("select[name='databaseTable'] option").size()==1){
                layer.msg("请先连接至数据库<br>", {
                    time: 5000, //5s后自动关闭
                    btn: ['好的']
                });
            }
        });
    }

    //监听选择数据表事件
    form.on('select(databaseTable)', function(data){
        var paramData = {
            path:$("input[name='apiDatabase.dataPath']").val(),
            type:$("input[name='apiDatabase.dataType']").val(),
            name:$("input[name='apiDatabase.dataName']").val(),
            tableName:data.value
        }
        $.ajax({
            url:BaseURL+"database/fields",
            data:paramData,
            type:'POST',
            dataType:'json',
            success:function(res){
                var paramValueSelect = $("select[name='paramValue']")
                paramValueSelect.html("<option value=\"\" selected=\"\">参数值</option>");
                for (var i = 0; i < res.fields.length; i++) {
                    var isExist = false;
                    $("select[name='paramValue'] option").each(function() {
                        var val = $(this).val();
                        if (val == res.fields[i]) {
                            isExist = true;
                        }
                    })
                    if(!isExist){
                        paramValueSelect.append("<option value='" + res.fields[i] + "'>" + res.fields[i] + "</option>");
                    }
                }
                form.render('select');
            }
        })
    });

    //监听选择参数类型事件
    form.on('select(paramType)', function(data){
        if("fromdata"==data.value){
            $("select[name='paramValue']").removeAttr("disabled");
            $("select[name='databaseTable']").removeAttr("disabled");
            addSelect();
            form.render('select');
        } else if("timestamp"==data.value){
            $("select[name='paramValue']").attr("disabled","disabled");
            $("select[name='databaseTable']").attr("disabled","disabled");
            $("body").undelegate("#paramValueSelect", 'click');
            $("body").undelegate("#databaseTableSelect", 'click');
            form.render('select');
        } else {

        }
    });

    addSelect();
    setInterval(removeX,0);
});