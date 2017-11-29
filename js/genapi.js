layui.use('element', function(){
    var newAPITabNum = 10
    var newAPITpl = newAPItpl.innerHTML
    var paramEncryptTpl = paramEncrypttpl.innerHTML

    var $ = layui.jquery
    var element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
    var laytpl = layui.laytpl;
    var form = layui.form;
    var table = layui.table;

    //触发事件
    var active = {
        newAPI: function(){
            //新增一个Tab项
            element.tabAdd('index-tab', {
                title: '新建API'
                ,content: '<div id="view'+newAPITabNum+'"></div>'
                ,id: newAPITabNum//新增API的tab-id为1开头
            });
            var data = { //数据
                "title":"Layui常用模块"
                ,"list":[{"modname":"弹层","alias":"layer","site":"layer.layui.com"},{"modname":"表单","alias":"form"}]
            }
            var view = document.getElementById('view'+newAPITabNum);
            laytpl(newAPITpl).render('{}', function(html){
                view.innerHTML = html;
            });
            form.render();
            element.tabChange('index-tab', newAPITabNum);
            newAPITabNum++;
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

    $('.site-demo-active').on('click', function(){
        var othis = $(this), type = othis.data('type');
        active[type] ? active[type].call(this, othis) : '';
    });

    $('.site-nav-active').on('click', function(){
        var othis = $(this), type = othis.data('type');
        active[type] ? active[type].call(this, othis) : '';
    });

    //Hash地址的定位
    var layid = location.hash.replace(/^#index-tab=/, '');
    element.tabChange('index-tab', layid);

    element.on('tab(index-tab)', function(elem){
        location.hash = 'index-tab='+ $(this).attr('lay-id');
    });

    element.on('tabDelete(index-tab)', function(data){

    });

    //监听指定开关
    form.on('switch(switchTest)', function(data){
        //layer.tips('温馨提示：请注意开关状态的文字可以随意定义，而不仅仅是ON|OFF', data.othis)
        var paramEncryptView = document.getElementById('paramEncryptView');
        if(this.checked){
            laytpl(paramEncryptTpl).render('{}', function(html){
                paramEncryptView.innerHTML = html;
            });
        } else {
            paramEncryptView.innerHTML = '';
        }
        form.render('select');
    });
});