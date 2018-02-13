var BaseURL = 'http://localhost:8012/api/';
var isFormat = false;

//定时任务iframe Cron表达式赋值
function cronInput(id, cron) {
    document.getElementById('taskExTime'+id).value = cron;
    window.layer.closeAll();
}

layui.use(['element','laytpl','form','table'], function(){
    var newAPITpl = newAPItpl.innerHTML
    var newTaskTpl = newTasktpl.innerHTML
    var paramEncryptTpl = paramEncrypttpl.innerHTML
    var viewAPITpl = viewAPItpl.innerHTML
    var viewTaskTpl = viewTasktpl.innerHTML
    var apiDatabaseTpl = apiDatabasetpl.innerHTML
    var apiParamTpl = apiParamtpl.innerHTML
    var apiIframeTpl = apiIframetpl.innerHTML

    var $ = layui.jquery
    var element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
    var laytpl = layui.laytpl;
    var form = layui.form;
    var table = layui.table;
    var laydate = layui.laydate;

    var isDatabaseConn = false;
    var isParamEncrypt = false;

    //API添加页面database集
    var databaseList = [];
    //API添加页面param集
    var paramList = [];

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
                            for(var i=0;i<databaseList.length;i++){
                                if(databaseList[i].dataName == data.dataName){
                                    layer.tips('数据库已验证', dataName);
                                    return;
                                }
                            }
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
                                    databaseTableSelect.append("<option value='"+res.tables[i]+"#"+databaseList.length+"'>"+ res.tables[i]+"</option>");
                                }
                            }
                            var apiDatabaseView = document.getElementById('apiDatabaseView');
                            databaseList.push(data);
                            laytpl(apiDatabaseTpl).render(databaseList, function(html) {
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
        ,apiAddParam: function (othis) {
            var paramName = $("input[name='paramName']").val()
                ,paramType = $("select[name='paramType']").val()
                ,databaseTable
                ,paramValue
                ,isEncrypt = $("input[name='isEncrypt']")
                ,paramEncrypt;
            if(paramName==""){
                layer.tips("请填写参数名",$("input[name='paramName']"))
                return;
            }
            for(var i=0;i<paramList.length;i++){
                if(paramList[i].paramName == paramName){
                    layer.tips('参数名重复', $("input[name='paramName']"));
                    return;
                }
            }
            if(paramType=="fromdata"){
                databaseTable = $("select[name='databaseTable']").val();
                databaseTable = databaseTable.split('#')[0];
                paramValue = $("select[name='paramValue']").val();
                if(paramValue==""){
                    layer.tips("请先选择字段", othis);
                    return;
                }
            } else {
                databaseTable = "";
                paramValue = "";
            }
            paramEncrypt = isParamEncrypt ? $("select[name='paramEncrypt']").val() : "";
            var paramData = {
                "paramName": paramName,
                "paramType": paramType,
                "databaseTable": databaseTable,
                "paramValue": paramValue,
                "isEncrypt": isEncrypt,
                "paramEncrypt": paramEncrypt
            }
            var apiParamView = document.getElementById('apiParamView');
            paramList.push(paramData);
            laytpl(apiParamTpl).render(paramList, function(html) {
                apiParamView.innerHTML = html;
            })
        }
        //移除API参数
        ,apiRemoveParam: function (othis) {
            var index = othis.context.id.split("-")[1];
            paramList.splice(index,1);
            var apiParamView = document.getElementById('apiParamView');
            laytpl(apiParamTpl).render(paramList, function(html) {
                apiParamView.innerHTML = html;
            })
        }
        //新建API选项卡
        ,tabNewAPI: function() {
            if(document.getElementById('view'+10)){
                element.tabChange('index-tab', '10');
                location.hash = 'index-tab='+ 10;
            } else {
                var taskData = {};
                $.ajax({
                    url: BaseURL + "task/all",
                    type: 'get',
                    dataType: 'json',
                    success: function(res) {
                        taskData = {
                            "list":res.task
                        }
                        activeNew('新建API', 'index-tab', 10, newAPITpl, taskData);
                        databaseList = [];
                        paramList = [];
                    }
                })
            }
        }
        //新建任务选项卡
        ,tabNewTask: function() {
            if(document.getElementById('view'+30)){
                element.tabChange('index-tab', '30');
                location.hash = 'index-tab='+ 30;
            } else {
                var apiData = {};
                $.ajax({
                    url: BaseURL + "api/all",
                    type: 'get',
                    dataType: 'json',
                    success: function(res) {
                        apiData = {
                            "list":res.api
                        }
                        activeNew('新建任务', 'index-tab', 30, newTaskTpl, apiData);
                    }
                })
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
                    , url: '/api/api'
                    , cols: [[
                        {type: 'numbers'}
                        , {field: 'iD', width: '8%', title: 'ID', sort: true, align: 'center'}
                        , {field: 'apiName', width: '10%', title: 'API名称', sort: true, align: 'center'}
                        , {field: 'apiDescription', width: '8%', title: 'API描述', align: 'center'}
                        , {field: 'apiProtocol', width: '8%', title: 'API协议', align: 'center'}
                        , {field: 'apiMethod', width: '8%', title: 'API类型', align: 'center'}
                        , {field: 'apiEncode', width: '8%', title: 'API编码', align: 'center'}
                        , {field: 'apiUrl', width: '18%', title: 'API地址', sort: true, align: 'center'}
                        , {field: 'responseType', width: '12.8%', title: '任务组', sort: true, align: 'center'}
                        , {fixed: 'right', width: '16%', align:'center', toolbar: '#apiBar', title: '操作'}
                    ]]
                    , page: true
                });
            }
        }
        ,tabViewTask: function (othis) {
            if(document.getElementById('view'+60)){
                element.tabChange('index-tab', '60');
                location.hash = 'index-tab='+ 60;
            } else {
                var taskData = {};
                $.ajax({
                    url: BaseURL + "task/all",
                    type: 'get',
                    dataType: 'json',
                    success: function(res) {
                        taskData = {
                            "list":res.task
                        }
                        activeNew('任务详情', 'index-tab', 60, viewTaskTpl, taskData);
                        tip();
                        element.render();
                    }
                })
            }
        }
        ,tabIframeAPI: function (othis) {
            var tabid = 0;
            var tabTitle = ''
            var iframeUrl = ''
            switch(othis.context.id)
            {
                case 'apiTest':
                    tabid = 40;
                    tabTitle = 'API测试工具';
                    iframeUrl = '/api/swagger-ui.html'
                    break;
                case 'apiProp':
                    tabid = 50;
                    tabTitle = '性能监控'
                    iframeUrl = '/api/druid/index.html'
                    break;
                default:
                    tabid = 0;
            }
            if(document.getElementById('view'+tabid)){
                element.tabChange('index-tab', tabid);
                location.hash = 'index-tab='+ tabid;
            } else {
                laytpl(apiIframeTpl).render({url:iframeUrl}, function(html) {
                    apiIframeTpl = html;
                })
                activeNew(tabTitle, 'index-tab', tabid, apiIframeTpl, {});
                apiIframeTpl = apiIframetpl.innerHTML
            }
        }
        ,addParam: function (othis) {
            console.log(othis);
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
        },
        runTask: function (othis) {
            $.ajax({
                url: BaseURL + "task/run",
                type: 'post',
                data: {
                    id: othis.context.id.split('-')[1],
                    cron: $('#taskExTime' + othis.context.id.split('-')[1]).val()?$('#taskExTime' + othis.context.id.split('-')[1]).val():''
                },
                dataType: 'json',
                success: function (res) {
                    if (res.type == 'success') {
                        element.progress(othis.context.id, '100%');
                    } else if (res.type == 'error') {
                        layer.msg("运行失败<br>", {
                            time: 5000, //5s后自动关闭
                            btn: ['好的']
                        });
                        element.progress(othis.context.id, '0%');
                        othis.removeClass('layui-btn-disabled');
                    }
                }
            })
            var n = 0, timer = setInterval(function () {
                n = n + Math.random() * 10 | 0;
                if (n > 99) {
                    n = 99;
                    clearInterval(timer);
                }
                element.progress(othis.context.id, n + '%');
            }, 30);
            othis.addClass('layui-btn-disabled');
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

        }else if(layid==10){
            //新增API面板关闭
        }
    });

    //监听指定开关
    form.on('switch(switchEncrypt)', function(data){
        console.log(this)
        //layer.tips('温馨提示：请注意开关状态的文字可以随意定义，而不仅仅是ON|OFF', data.othis)
        var paramEncryptView = document.getElementById('paramEncrypt');
        if(this.checked){
            paramEncryptView.innerHTML = paramEncryptTpl;
            isParamEncrypt = true;
        } else {
            paramEncryptView.innerHTML = '';
            isParamEncrypt = false;
        }
        form.render('select');
    });

    //自定义验证规则
    form.verify({
        title:[/[a-zA-Z_$][a-zA-Z0-9_$]*/, '请输入api名']
        ,taskName:[/^[\u4e00-\u9fa5\w]{2,10}$/,'名字必须2到10个字符']
        ,pass: [/^\w{4,12}$/, '密码必须4到12位']
        ,content: function(value){
            layedit.sync(editIndex);
        }
        ,ip : [/((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/, '请输入ip地址']
    });

    //监听API表单提交
    form.on('submit(submitAPI)', function(data){
        console.log(data.field);
        if(!isDatabaseConn){
            layer.msg('请先连接数据库<br/>（5秒后自动关闭）', {
                time: 3000, //5s后自动关闭
                btn: ['O的K']
            });
            return false;
        }
        if(isFormat || (($('#apiContent').val()=="") && (data.field.apiMethod=="get"))){
            data.elem.classList.add('layui-btn-disabled');
            data.elem.disabled = true;
            $.ajax({
                url:BaseURL+"api",
                data:data.field,
                type:'POST',
                dataType:'json',
                success:function(res){
                    if(res.content=='manager.message.success'){
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

    ////监听Task表单提交
    form.on('submit(submitTask)', function(data){
        data.elem.classList.add('layui-btn-disabled');
        data.elem.disabled = true;
        $.ajax({
            url:BaseURL+"task",
            data:data.field,
            type:'POST',
            dataType:'json',
            success:function(res){
                if(res.content=='manager.message.success'){
                    layer.msg('提交成功<br/>（5秒后自动关闭）', {
                        time: 5000, //5s后自动关闭
                        btn: ['太好了']
                    });
                } else {
                    layer.msg('提交失败<br/>（5秒后自动关闭）', {
                        time: 5000, //5s后自动关闭
                        btn: ['我再找找问题','我等下再试试']
                    });
                    data.elem.classList.remove('layui-btn-disabled');
                    data.elem.disabled = false;
                }
            },
            error:function (res) {
                layer.msg('提交失败<br/>'+res.responseJSON.message+'<br/>（5秒后自动关闭）', {
                    time: 5000, //5s后自动关闭
                    btn: ['我再找找问题','我等下再试试']
                });
                data.elem.classList.remove('layui-btn-disabled');
                data.elem.disabled = false;
            }
        })
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
                layer.tips('请先连接至数据库', $('#validDatabase'));
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
                layer.tips('请先连接至数据库', $('#validDatabase'));
            }
        });
        //点击选择api框apiSelect
        $("body").delegate("#apiSelect", 'click', function(){
            if($("select[name='taskApi.id'] option").size()==1){
                layer.msg("没有可选择的API，请先添加API<br>", {
                    time: 5000, //5s后自动关闭
                    btn: ['好的']
                });
            }
        });
        //点击定时任务时间框taskExTime
        $("body").delegate(".taskExTime", 'click', function(odata){
            var temp = odata.target.placeholder
            layer.open({
                type: 2,
                title: '定时任务Cron表达式生成',
                shadeClose: true,
                shade: false,
                maxmin: true, //开启最大化最小化按钮
                area: ['893px', '600px'],
                content: './template/cron.html#'+odata.target.id.substring(10)+"&"+odata.target.placeholder
            });
        });
    }

    //任务列表API提示按键操作
    function tip() {
        // $('.step span').html('API列表');
        $('body').on('mouseleave','.showTip',function(){
            $('.tip-container').css({
                'opacity':0,
                'display': 'none'
            });
        });
        //任务列表显示API详情
        $('body').on('mouseenter','.showTip',function(othis){
            $('.tip-container-'+othis.currentTarget.classList[1].split('-')[1]).css({
                top: '50%',
                left: '55%',
                'opacity':1,
                'display': 'block'
            })
        });
    }

    //监听选择数据表事件
    form.on('select(databaseTable)', function(data){
        var paramData = {
            path:$("input[name='apiDatabase["+data.value.substring(data.value.indexOf("#")+1)+"].dataPath']").val(),
            type:$("input[name='apiDatabase["+data.value.substring(data.value.indexOf('#')+1)+"].dataType']").val(),
            name:$("input[name='apiDatabase["+data.value.substring(data.value.indexOf('#')+1)+"].dataName']").val(),
            tableName:data.value.substring(0,data.value.indexOf('#'))
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