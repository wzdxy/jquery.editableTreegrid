function EditableTreegrid(selector,settings) {                 //构造函数
    this.selector = selector;
    this.ele=$(selector);
    this.colNum = 0;
    this.thead=this.ele.find('thead:eq(0)');
    this.heads=settings.heads;
    this.levels=settings.levels;
    this.createTableHead();
    this.depth=settings.levels.length;
    this.initCallback=settings.initCallback;
    this.selectSyncOpt=settings.selectSyncOpt;
    this.callback=settings.callback;
    return this;
}

EditableTreegrid.prototype = {
    /**
     * 从数据填充整个表格
     * @param data
     * @param async
     */
    loadData:function (data,async) {
        let This=this;
        this.ele.find('tbody').remove();
        let $tbody=$("<tbody></tbody>");
        let groupCount=data.length;                 //level数量
        let childCount=0;                           //行数量
        let Timer=[];
        for(let i=0,m=data.length;i<m;i++){
                let $row=this.createRow(data[i],1,i+1,0);
                $tbody.append($row);
                Timer.push({i:new Date().getTime()});
            if(!data[i].Children)continue;
            for(let j=0,n=data[i].Children.length;j<n;j++){
                let item=data[i].Children[j];
                let $row=This.createRow(item,2,childCount+groupCount+1,i+1);
                $tbody.append($row);
                childCount++;
            }
        }
        Timer.push({'body-before':new Date().getTime()});
        this.ele.append($tbody);
        Timer.push({'body-after':new Date().getTime()});
            This.refresh();
        console.table(Timer);
        return this;
    },
    /**
     * 初始化一个空白的表格
     * @return {EditableTreegrid}
     */
    init:function () {
        this.ele=$(this.selector);
        this.ele.addClass('editable-treegrid table tree table-condensed');
        if(this.depth==1)this.ele.addClass('table-without-tree');
        this.ele.html('<thead></thead><tbody></tbody>');
        this.thead=this.ele.find('thead:eq(0)');
        this.createTableHead();
        this.refresh();
        if(typeof this.initCallback == 'function')this.initCallback();
        return this;
    },
    /**
     * 刷新各种功能
     * @return {EditableTreegrid}
     */
    refresh: function () {
        this.ele.treegrid();
        this.ele.find('td.select-td>select').selectpicker('refresh');   //刷新下拉列表的bs样式
        this.bindAddRootNode();                                         //添加组的按钮
        this.bindAddChildNode();                                        //添加子元素的按钮
        this.bindDeleteCurNode();                                       //删除行的按钮
        this.addEditBtn();                                              //编辑功能
        this.hidecol();                                                 //隐藏列
        this.refreshIndex();                                            //刷新索引
        if(this.selectSyncOpt!=undefined)this.selectChangeSync(this.selectSyncOpt);
        return this;
    },
    /**
     * 获取表格的数据
     * @return {Array}
     */
    getData: function () {
        let data = [];
        if(this.ele.length==0)return [];
        let roots = this.ele.treegrid('getRootNodes');
        roots.each(function (idx,groupRow) {
            let group=this.depth==1?{}:{'Children':[]};
            let level=this.levels[0];
            for(let i=0,m=level.length;i<m;i++){
                let tdType=level[i].type;
                if(['readonly','select','input','index','timestamp'].indexOf(tdType)==-1)continue;
                let tdName=level[i].name;
                let $td=$(groupRow).find('td:eq('+i+')');
                group[tdName]=this.getTdValue(tdType,$td,level[i]);
                if($(groupRow).find('input[type=radio]').length!=0){
                    group['Selected']=$(groupRow).find('input[type=radio]:checked').length;
                }
            }
            let $Nodes=$(groupRow).treegrid('getChildNodes');
            $Nodes.each(function (idx,nodeRow) {
                let node={};
                let level=this.levels[1];
                for(let i=0,m=level.length;i<m;i++){
                    let tdType=level[i].type;
                    if(['readonly','select','input','index','timestamp'].indexOf(tdType)==-1)continue;
                    let tdName=level[i].name;
                    let $td=$(nodeRow).find('td:eq('+i+')');
                    node[tdName]=this.getTdValue(tdType,$td,level[i]);
                }
                group.Children.push(node);
            }.bind(this));
            data.push(group);
        }.bind(this));
        return data;
    },

    /**
     * 获取一个单元格的数据
     * @param type
     * @param ele
     * @param td
     * @return {string}
     */
    getTdValue:function (type,ele,td) {
        let value='';
        switch (type){
            case 'select':{
                value=ele.find('select').selectpicker('val');
                break;
            }
            case 'input':
            case 'index':
            case 'timestamp':
            case 'readonly':{
                value=ele.find('span.td-v').html();break;
            }
            case 'parent':{
                break;
            }
        }
        if(typeof ele.data('map')=='object'){
            let map=ele.data('map');
            for(k in map){
                if(map[k]==value){
                    value=k;break;
                }
            }
        }
        if(typeof td.map=='function'){
            value = td['map'](value,true);            //输出时给true
        }
        if(ele.data('datatype')!=undefined){
            value=this.parseType(value,ele.data('datatype'));
        }
        return value;
    },
    /**
     * 刷新某个下拉菜单
     * @param level
     * @param index
     * @param options
     * @param name
     * @param targetTd 可选参数，如果有第五个参数，则只更新 targetTd 里的 select
     */
    freshSelectOptions:function (level,index,options,name,targetTd) {
        this.levels[level][index].options=options;
        $selects=!targetTd?this.ele.find('[data-name='+name+'] select'):$(targetTd).find('select');      // 暂存现在的选项值
        let valArray=[];
        $selects.each(function (idx,ele) {
            valArray[idx]=$(ele).selectpicker('val');
            if(this.levels[level][index].link){
                this.freshLinkSelect($(ele),this.levels[level][index]);
            }
        }.bind(this));
        $selects.empty();
        for(let i=0,m=options.length;i<m;i++){      // 更改 options
            let opt=options[i];
            let $opt=$selects.find('option:eq('+i+')');
            if($opt.length!=0)$opt.html(opt.name).attr('value',opt.value);
            else {
                $opt=$('<option value='+opt.value+'>'+opt.name+'</option>');
                $selects.append($opt);
            }
            for(attr in opt){
                if(attr != 'name'&&attr!='value') $opt.attr('data-'+attr,opt[attr]);
            }
            // if(i==m-1)$opt.nextAll('option').remove();
        }
        $selects.each(function (idx,ele) {              // 恢复选项值
            $(ele).selectpicker('val',valArray[idx]);
        });
        $selects.selectpicker('refresh');
        $selects.selectpicker('render');

        return this;
    },
    /**
     * 刷新联动下拉菜单
     * @param $select
     * @param tds_i
     */
    freshLinkSelect:function ($select,tds_i) {
        let parentSelectedVal=$select.selectpicker('val');
        for(let j=0,n=tds_i.options.length;j<n;j++){
            if(parentSelectedVal==tds_i.options[j].value){
                let childOptions=tds_i.options[j].children;
                let targetTd=$select.parents('tr').find('td')[tds_i.link.col];
                this.freshSelectOptions(tds_i.link.level,tds_i.link.col,childOptions,tds_i.link.name,targetTd);
            }
        }
    },
    /**
     * 刷新索引
     * @returns {boolean}
     */
    refreshIndex:function () {
        if(this.ele.length==0)return false;
        let $rootsIndexTd=this.ele.treegrid('getRootNodes').find('td.index-td');
        $.each($rootsIndexTd,function (idx) {
            $(this).find('span.td-v').html(idx+1);
        });
    },
    /**
     * 创建表头<thead>标签
     */
    createTableHead:function () {
        this.thead=this.ele.find('thead:eq(0)');
        $tr=$('<tr></tr>');
        for(let i=0,m=this.heads.length;i<m;i++){
            let th=this.heads[i];
            let $th=$('<th></th>').html(th.name);
            if(th.style!=undefined){
                for(let name in th.style){
                    $th.css(name,th.style[name]);
                }
            }
            if(th.type=='hidden')$th.addClass('hide-col');
            if(th.type=='operate')
                $th.empty().append(this.createOperateTd(th.name,th.buttons).children()).addClass('operate-th');
            $tr.append($th);
        }
        this.thead.html($tr);
        return $tr;
    },
    /**
     * 创建一个行
     * @param data
     * @param level
     * @param id
     * @param parent 如果是顶级节点写0
     */
    createRow:function (data,level,id,parent) {
        let This=this;
        let $row=$('<tr></tr>').addClass('node-level-'+level+' treegrid-'+id+' treegrid-parent-'+(parent!=0?parent:""));
        let idx=0;
        let tds=This.levels[level-1];
        for(let i=0,m=tds.length;i<m;i++){
            let td=tds[i];
            let $td;
            let name=td.name;
            let value=data[name];
            if(typeof td.map=='object')                   //如果有映射，则使用map中的值
                value=td.map[data[name]];
            else if(typeof td.map=='function')
                value = td['map'](value,false);       //加载时给false
            if(value==undefined)value=td.default||'';       //如果value未定义，使用默认值
            switch(td.type){
                case 'select':{
                    $td=this.createSelectTd(name,tds[i].options,value);
                    if(td.link){                        //如果有联动下拉菜单
                        $td.bind('change',function (e) {
                            This.freshLinkSelect($td.find('select.td-v'),td);
                        });
                    }
                    if(td.onchange){
                        $td.find('select').bind('change',function (e) {
                            td['onchange']($td,$(this).selectpicker('val'));
                        });
                    }
                    break;
                }
                case 'input':{
                    $td=this.createInputTd(name,value);break;
                }
                case 'readonly':{
                    $td=this.createReadonlyTd(name,value);break;
                }
                case 'operate':{
                    $td=this.createOperateTd(name,td.buttons);break;
                }
                case 'parent':{
                    $td=this.createParentTd();break;
                }
                case 'index':{
                    $td=this.createIndexTd(name,level);break;
                }
                case 'timestamp':{
                    if(value=='')value=new Date().getTime();
                    $td=this.createTimestampTd(name,value);break;
                }
                default:{
                    $td=this.createEmptyTd();break;
                }
            }
            if(td.radio!=undefined){                        //如果带有radio属性，则添加radio
                let $radio=$('<input type="radio" class="grid-radio-'+level+'" name="'+td.radio.name+'"'+(data.Selected==1?" checked ":"")+'/>&nbsp;')
                $td.prepend($radio);
            }
            if(td.map!=undefined){          //如果有kv映射
                if(typeof td.map =='object')
                    $td.attr('data-map',JSON.stringify(td.map));
                else if(typeof td.map=='function')
                    $td.attr('data-map',td.map.name);
            }
            if(td.action!=undefined){
                $td.attr({'data-url':td.action.url,'data-method':td.action.method,'data-postparams':JSON.stringify({params:td.action.params})});
                for(let j=0;j<td.action.params.length;j++){
                    let paramName=td.action.params[j];
                    $td.attr('data-'+paramName,data[paramName]);
                }
            }
            if(td.dataType!=undefined){
                $td.attr('data-datatype',td.dataType);
            }
            if(td.onclick!=undefined){
                $td.bind('click',function (e) {
                    td['onclick'](this);
                })
            }
            if(td.hover!=undefined){
                $td.css('cursor',td.hover);
            }
            $td.attr({'data-level':level,'data-col':i,'data-type':td.type});
            $row.append($td);
            if(value=='' && td.type)$td.find('select').selectpicker('val','');
            idx++;
        }
        return $row;
    },
    /**
     * 添加一个行
     * @param data
     * @param level
     * @param id
     * @param parent
     */
    addRow:function (data,level,id,parent) {
        let $row=this.createRow(data,level,id,parent);
        let parentNode = this.ele.find('tr.treegrid-'+parent);
        let allChild=[];
        if(parentNode.length) {
            let allChild = parentNode.treegrid('getChildNodes');
            if (allChild.length == 0) {                                         //如果父级为空，直接添加在父级后
                parentNode.after($row[0]);
            } else {                                                          //否则添加在本组最后
                allChild[allChild.length - 1].after($row[0]);
            }
        }else{
            parentNode=this.ele.find('tbody');
            parentNode.append($row[0]);
        }

        this.refresh();
    },
    /**
     * 绑定 删除当前行 按钮
     */
    bindDeleteCurNode:function(){                                                                    //删除行
        let This=this;
        this.ele.find('button.delete-node-btn').unbind('click');                    //先移除所有同名事件
        this.ele.find('button.delete-node-btn').bind('click', function (e) {
            let curNode = $(e.target).parents('tr')[0];
            $(curNode).treegrid('getChildNodes').css('background-color','rgba(200,0,0,0.3)');
            $(curNode).css('background-color','rgba(200,0,0,0.3)').hide(150,function () {
               this.remove();
               $(this).treegrid('getChildNodes').remove();
               This.refreshIndex();                                            //刷新索引
               if(This.callback&&This.callback.deleteRow)This.callback['deleteRow'](curNode);
            });
        }.bind(this));
    },
    /**
     * 添加子项的按钮
     */
    bindAddChildNode: function () {
        this.ele.find('button.add-child-row-btn').unbind('click');                  //先移除所有同名事件
        this.ele.find('button.add-child-row-btn').bind('click', function (e) {
            let curNode = $(e.target).parents('tr')[0];                                       //当前父级
            let newId=this.getNewId();                                                          //新id
            let newNode=this.createRow({},2,newId,$(curNode).treegrid('getNodeId'));            //生成新空白行
            let allChild = $(curNode).treegrid('getChildNodes');
            if (allChild.length == 0) {                                         //如果父级为空，直接添加在父级后
                $(curNode).after(newNode);
            } else {                                                          //否则添加在本组最后
                allChild[allChild.length - 1].after(newNode[0]);
            }
            this.refresh();
        }.bind(this));
    },
    /**
     * 添加根项的按钮
     */
    bindAddRootNode: function () {
        this.ele.find('button.add-root-row-btn').unbind('click');
        this.ele.find('button.add-root-row-btn').bind('click',function (e) {
            $(e.target);
            let allNodes=$(this.selector).treegrid('getAllNodes');
            let lastNode=allNodes[allNodes.length-1];
            let newId=this.getNewId();
            let newRoot=this.createRow({},1,newId,0);
            if(allNodes.length!=0){
                $(lastNode).after(newRoot);
            }else{
                this.ele.find('tbody').append(newRoot);
            }
            this.refresh();
            if(this.callback&&this.callback.addRow)this.callback['addRow'](newRoot);
        }.bind(this));
    },
    createIndexTd:function (name,level) {
        return $('<td class="index-td"><span class="td-v">0</span></td>').attr({'data-name':name,'data-indexof':level});
    },
    createTimestampTd:function (name,value) {
        return $('<td class="timestamp-td"><span class="td-v">'+value+'</span></td>').attr({'data-name':name});
    },
    /**
     * 生成Select单元格
     * @param options
     * @param name
     * @param selected
     * @return {void|jQuery|HTMLElement}
     */
    createSelectTd: function (name, options, selected) {
        if (!options)return console.error('row "' + name + '" has param "options" undefined');
        let $td = $('<td class="select-td"></td>').attr('data-name', name);
        let $select = $('<select class="td-v"></select>').css('width', '100%');
        for (let i = 0, m = options.length; i < m; i++) {
            let opt = options[i];
            let $opt = $('<option value=' + opt.value + '>' + opt.name + '</option>');
            for (attr in opt) {
                if (attr != 'name' && attr != 'value') $opt.attr('data-' + attr, opt[attr]);
            }
            $select.append($opt);
        }
        $td.append($select);
        $select.selectpicker('refresh');
        $select.selectpicker('val', selected);
        return $td;
    },

    /**
     * 生成input单元格
     * @param name
     * @param value
     * @return {*|jQuery}
     */
    createInputTd:function (name,value) {
        return $('<td class="editable-td"><span class="td-v">'+value+'</span></td>').attr('data-name',name);
    },
    /**
     * 生成readonly只读单元格
     * @param name
     * @param value
     * @return {void|jQuery|HTMLElement}
     */
    createReadonlyTd:function (name,value) {
        return $('<td class="readonly-td"><span class="td-v">'+value+'</span></td>').attr('data-name',name);
    },
    /**
     * 生成Operate单元格
     * @param name
     * @param buttons
     * @return {void|jQuery|HTMLElement}
     */
    createOperateTd:function (name,buttons) {
        let $td=$('<td class="operate-td"></td>');
        for(let type in buttons){
            let name=buttons[type].name;
            switch (type){
                case 'addChild':{
                    $td.append('<button type="button" class="add-child-row-btn btn btn-xs btn-info">'+name+'</button>');
                    break;
                }
                case 'addRoot':{
                    $td.append('<button type="button" class="add-root-row-btn btn btn-xs btn-info">'+name+'</button>');
                    break;
                }
                case 'delete':{
                    $td.append('<button type="button" class="delete-node-btn btn btn-xs btn-danger">'+name+'</button>');
                    break;
                }
                default:{
                    let $btn=$('<button type="button" class="btn btn-xs btn-info">'+name+'</button>').bind('click',buttons[type].callback);
                    $td.append($btn);
                }
            }
        }
        return $td;
    },
    /**
     * 生成empty空白单元格
     * @return {void|jQuery|HTMLElement}
     */
    createEmptyTd:function () {
        return $('<td></td>');
    },
    createChildTable:function (colNum,data) {
        for(let i=0,m=data.length;i<m;i++){

        }
    },
    createParentTd:function () {

    },
    /**
     * select变化时同步另一个input[level,srcName,destName,srcAttr]
     */
    selectChangeSync:function (param) {
        let level=param[0];
        let srcName=param[1];
        let destName=param[2];
        let srcAttr=param[3];
        let $srcSelect=this.ele.find('[data-name='+srcName+'] select');
        let $destSpan=this.ele.find('[data-name='+destName+'] span');

        $destSpan.each(function (idx,ele) {
            if($(ele).html()=='')$(ele).html($srcSelect.find('option').data(srcAttr));
        });

        $allGetwaySelect=$(this.selector).find('td.getway-select-td select');
        $srcSelect.unbind('change').bind('change',function (e) {
            let curTd=$(e.target).parents('td');
            let selectedAttr=curTd.find('select option:selected').data(srcAttr);
            let curTr=curTd.parents('tr');
            let $destInput=curTr.find('[data-name='+destName+']>span');
            $destInput.html(selectedAttr);
        });
    },

    /**
     * 给input类型添加编辑按钮
     */
    addEditBtn:function(){
        this.ele.find('span.td-edit-btn').remove();               //先清空所有编辑按钮
        let allEditable = this.ele.find('td.editable-td');            //所有可编辑的表格
        let editBtn = document.createElement('span');                         //重新创建编辑按钮
        $(editBtn).addClass('td-edit-btn fa fa-pencil');
        $(editBtn).bind('click', function (e) {                              //编辑按钮的点击事件
            let curTd = $(e.target).parents('td')[0];
            let curValueSpan = $(curTd).find('span.td-v');
            let editBox = $('<div class="edit-box"><input class="edit-td-input form-control" value="' + curValueSpan.html() + '" type="text"><span class="edit-td-submit fa fa-check" type="button"></span></div>');      //编辑框
            let input = $(editBox).find('input.edit-td-input')[0];
            let saveBtn = $(editBox).find('span.edit-td-submit')[0];

            $(input).bind('blur', function (e) {                             //失去焦点时保存
                this.editInputTd(curTd, input.value);
            }.bind(this));
            $(input).bind('keydown', function (e) {                          //按回车保存
                if (e.keyCode == 13)this.editInputTd(curTd, input.value);
            }.bind(this));
            $(saveBtn).bind('click', function (e) {                          //点击保存按钮保存
                this.editInputTd(curTd, input.value);
            }.bind(this));
            $(curTd).append(editBox);
            $(input).focus().select();                                      //自动给编辑框焦点并选中

        }.bind(this));
        allEditable.append(editBtn);
    },
    /**
     * 隐藏所有该隐藏的列
     */
    hidecol:function () {
        let allThs=this.ele.find('thead>tr>th');
        for(let i=0,m=allThs.length;i<m;i++){
            if($(allThs[i]).hasClass('hide-col')){
                $(this.selector).treegrid('getAllNodes').find('td:eq('+i+')').addClass('hide-td');
            }
        }
    },
    editInputTd:function(curTd,value){
        let level=$(curTd).data('level')-1;
        let col=$(curTd).data('col');
        let td=this.levels[level][col];
        if(td.validate && value!=''){
            let result=td.validate['test'](value);
            if(td.validate['callback'])td.validate['callback'](value,result,curTd);
            if (!result)return false;
        }
        if($(curTd).data('url')){
            this.postInputAction(curTd,value);
        }else{
            this.changeLocalValue(curTd,value);
        }
    },
    /**
     * 改变单元格中的数据
     * @param curTd
     * @param value
     * @return {number}
     */
    changeLocalValue:function(curTd, value){                                              //保存表格内容
        $(curTd).find('div.edit-box').remove();
        if(!$(curTd).length)return false;
        if (value == $(curTd).find('span.td-v' && value!='' &&value!=0).html())return 0;
        $(curTd).find('span.td-v').html(value);
        let level=$(curTd).data('level')-1;
        let col=$(curTd).data('col');
        if(this.levels[level][col]['onchange']){
            this.levels[level][col]['onchange'](curTd,value);
        }
    },
    /**
     *
     * @param curTd
     * @param value
     */
    postInputAction:function(curTd,value){
        if (value == $(curTd).find('span.td-v').html()){
            $(curTd).find('div.edit-box').remove();return 0;
        }
        let url=$(curTd).data('url');
        let data={
            name:$(curTd).data('name'),
            value:value,
        };
        let params=$(curTd).data('postparams').params;
        for(let i=0,m=params.length;i<m;i++){
            data[params[i]]=$(curTd).data(params[i]);
        }
        $(curTd).find('.edit-box span').removeClass('fa-check').addClass('fa-circle-o-notch');
        $.ajax({url:url,method:'POST',data:data,success:function (r) {
            this.changeLocalValue(curTd,value);
            $(curTd).find('.edit-box span').removeClass('fa-circle-o-notch').addClass('fa-check');
        }.bind(this)});
    },
    /**
     * 修改一列的数据
     * @param levelNum
     * @param colNum
     * @param data
     */
    changeDataOfCol:function (levelNum,colNum,data) {
        let This=this;
        let td=this.levels[levelNum][colNum];
        $tds=this.ele.find('td[data-level="'+(levelNum+1)+'"][data-col="'+colNum+'"]');
        for(let i=0;i<$tds.length;i++){ //TODO 修改一列的数据

        }
        // $.each($tds,function () {
        //
        //     data.push(this.getTdValue(td.type,$(this),td));
        // });
    },
    /**
     *  把表格内容整理成对象数组输出
     */
    getSlimData: function () {
        let data = [];
        let roots = $(this.selector).treegrid('getRootNodes');
        roots.each(function () {
            let group = {
                Name: $(this).find('span.td-v')[0].innerHTML,
                Selected:($(this).find('td.radio-td>input[name="io-group-radio"]:checked').length==0)?0:1,
                IO: [],

            };
            Nodes = $(this).treegrid('getChildNodes');
            Nodes.each(function () {
                spanItems = $(this).find('span.td-v');
                selectItems=$(this).find('select.td-v');
                group.IO.push({
                    Name: spanItems[0].innerHTML,
                    Count: spanItems[1].innerHTML,
                    CountType: spanItems[2].innerHTML,
                    Property: selectItems[0].value,
                    Type: selectItems[1].value,
                })
            });
            data.push(group);
        });
        console.log(data);
        return data;
    },

    /**
     * 获取一个或多个的数据，返回所有数据组成的数组
     * @param colNum {Number|Array}
     * @param level
     * @return {Array}
     */
    getDataOfCol:function (colNum,level) {
        if(typeof colNum=='object'){
            let Data=[];
            for(let i=0,m=colNum.length;i<m;i++){
                Data.push(this.getDataOfCol(colNum[i],level));
            }
            return Data;
        }
        let This=this;
        let data=[];
        let type=this.levels[level][colNum].type;
        let rows=this.ele.treegrid('getAllNodes').each(function () {
            if($(this).hasClass('node-level-'+(level+1))){
                let td=$(this).find('td')[colNum];
                data.push(This.getTdValue(type,$(td),This.levels[level][colNum]));
            }
        });
        return data;
    },

    getDataOfRow:function (tr) {
        let This=this;
        let data={};
        $(tr).find('td').each(function () {
            let type=$(this).data('type');
            let level=$(this).data('level')-1;
            let col=$(this).data('col');
            data[$(this).data('name')]=This.getTdValue(type,$(this),This.levels[level][col]);
        });
        return data;
    },

    countRootRows:function () {
        return this.ele.treegrid('getRootNodes').length;
    },
    /**
     * 生成一个新的ID
     * @return {*}
     */
    getNewId:function () {
        let newId=$(this.selector).treegrid('getAllNodes').length+1;
        while(this.ele.find('.treegrid-'+newId).length!=0){
            newId++;
        };
        return newId;
    },

    /**
     * 转化成对应的数字类型
     */
    parseType:function (val,type) {
        switch (type){
            case 'number':{
                return Number(val);
            }
        }
    }

};





