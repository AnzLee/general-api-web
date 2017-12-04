layui.use('element', function(){
    var newAPITabNum = 10
    var newAPITpl = newAPItpl.innerHTML
    var paramEncryptTpl = paramEncrypttpl.innerHTML
    var viewAPITpl = viewAPItpl.innerHTML

    var $ = layui.jquery
    var element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
    var laytpl = layui.laytpl;
    var form = layui.form;
    var table = layui.table;

    //触发事件
    var active = {
        //新建API选项卡
        tabNewAPI: function(){
            var data = {
                id:newAPITabNum
            };
            newAPITabNum = activeNew('新建API','index-tab',newAPITabNum,newAPITpl,data);
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
                        , {field: 'id', width: 80, title: 'ID', sort: true}
                        , {field: 'apiName', width: 120, title: 'API名称', sort: true}
                        , {field: 'apiProtocol', width: 120, title: 'API协议'}
                        , {field: 'apiMethod', width: 120, title: 'API格式'}
                        , {field: 'apiEncode', width: 120, title: 'API编码'}
                        , {field: 'dataPath', width: 200, title: '数据库地址', sort: true}
                        , {field: 'paramNum', width: 120, title: '参数个数', sort: true}
                        , {field: 'responseType', width: 120, title: '结果类型', sort: true}
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
    };

    $('.site-nav-active').on('click', function(){
        var othis = $(this), type = othis.data('type');
        active[type] ? active[type].call(this, othis) : '';
    });

    element.on('tab(index-tab)', function(elem){
        location.hash = 'index-tab='+ $(this).attr('lay-id');
    });

    element.on('tabDelete(index-tab)', function(data){

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

    //注销首页关闭按钮
    function removeX() {
        if($("li[lay-id='0']").children("i")){
            $("li[lay-id='0']").children("i").remove();
        }
    }

    //新增通用方法
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

    setInterval(removeX,0);
});
