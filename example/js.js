$(function(){
    window.deviceIOGPIOInput=new EditableTreegrid('#device-io-gpio-in',{
        heads: [
            {name: '序号', type: 'input', style: {width: '10%'}},
            {name: 'ID', type: 'hidden', style: {width: '10%'}},
            {name: '类型', type: 'hidden', style: {width: '15%'}},
            {name: '输入输出', type: 'select', style: {width: '15%'}},
            {name: '名称', type: 'input', style: {width: '10%'}},
            {name: '添加', type: 'operate', buttons: {addRoot: {name: '添加'}}, style: {width: '10%'}},],
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
            {name: '序号', type: 'input', style: {width: '10%'}},
            {name: 'ID', type: 'hidden', style: {width: '10%'}},
            {name: '类型', type: 'hidden', style: {width: '15%'}},
            {name: '输入输出', type: 'select', style: {width: '15%'}},
            {name: '名称', type: 'input', style: {width: '10%'}},
            {name: '添加', type: 'operate', buttons: {addRoot: {name: '添加'}}, style: {width: '10%'}},],
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
})