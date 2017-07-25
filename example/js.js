$(function(){
    window.deviceIOGPIOInput=new EditableTreegrid('#device-io-gpio-in',{
        heads: [
            {name: '序号', type: 'input'},
            {name: 'ID', type: 'hidden'},
            {name: '类型', type: 'hidden', style: {width: '15%'}},
            {name: '输入输出', type: 'select', style: {width: '15%'}},
            {name: '名称', type: 'input'},
            {name: '添加', type: 'operate', buttons: {addRoot: {name: '添加'}}},],
        levels: [
            [
                {name: 'portIndex', type: 'index',dataType:'number'},
                {name: 'Identify', type: 'readonly',dataType:'number'},
                {name: 'property', type: 'readonly',default:7},
                {name: 'type', type: 'select',default:0,options:[{name:'输入',value:0},{name:'输出',value:1}]},
                {name: 'label', type: 'input'},
                {name: 'deleteRow', type: 'operate', buttons: {delete: {name: '删除'}}}
            ]
        ],
    }).init();
    window.deviceIOGPIOOutput=new EditableTreegrid('#device-io-gpio-out',{
        heads: [
            {name: '序号', type: 'input'},
            {name: 'ID', type: 'hidden'},
            {name: '类型', type: 'hidden', style: {width: '15%'}},
            {name: '输入输出', type: 'select', style: {width: '15%'}},
            {name: '名称', type: 'input'},
            {name: '添加', type: 'operate', buttons: {addRoot: {name: '添加'}}},],
        levels: [
            [
                {name: 'portIndex', type: 'index',dataType:'number'},
                {name: 'Identify', type: 'readonly',dataType:'number'},
                {name: 'property', type: 'readonly',default:7},
                {name: 'type', type: 'select',default:1,options:[{name:'输入',value:0},{name:'输出',value:1}]},
                {name: 'label', type: 'input'},
                {name: 'deleteRow', type: 'operate', buttons: {delete: {name: '删除'}}}
            ]
        ],
    }).init();

    window.table2=new EditableTreegrid("#table-on-delete-and-add",{
        heads: [
            {name: '序号', type: 'input'},
            {name: 'ID', type: 'input'},    
            {name: '添加', type: 'operate', buttons: {addRoot: {name: '添加'}}},],
        levels: [
            [
                {name: 'index', type: 'index',dataType:'number'},
                {name: 'name', type: 'input'},
                {name: 'deleteRow', type: 'operate', buttons: {delete: {name: '删除'}}}
            ]
        ],
        callback:{
            addRow:function(newRow){toastr.success('Add a row')},
            deleteRow:function(){toastr.success('Delete a row')}
        }
    }).init().loadData([
        {name:'Tom'},{name:'Ming'},{name:'LiLei'},
    ]);

    window.table2=new EditableTreegrid("#table-with-data-changed",{
        heads: [
            {name: '序号', type: 'input'},
            {name: 'ID', type: 'input'},    
            {name: '添加', type: 'operate', buttons: {addRoot: {name: '添加'}}},],
        levels: [
            [
                {name: 'index', type: 'index',dataType:'number'},
                {name: 'name', type: 'input',onchange:function(curTd,value,oldValue){toastr.success('<b>'+oldValue+'</b> changed to <b>'+value+'</b>')}},
                {name: 'deleteRow', type: 'operate', buttons: {delete: {name: '删除'}}}
            ]
        ],
    }).init().loadData([
        {name:'Tom'},{name:'Ming'},{name:'LiLei'},
    ]);

    window.table3=new EditableTreegrid("#table-get-data",{
        heads: [
            {name: '序号', type: 'input'},
            {name: 'Name', type: 'input'},
            {name: 'age', type: 'input'},
            {name: '添加', type: 'operate', buttons: {addRoot: {name: '添加'}}}],
        levels: [
            [
                {name: 'index', type: 'index',dataType:'number'},
                {name: 'name', type: 'input'},
                {name: 'age', type: 'input',dataType:'number'},
                {name: 'deleteRow', type: 'operate', buttons: {delete: {name: '删除'}}}
            ]
        ],
    }).init().loadData([
        {name:'Tom',age:22},{name:'Ming',age:23},{name:'LiLei',age:33},
    ]);
});