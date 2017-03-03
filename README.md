# jquery.editableTreegrid
基于treegrid开发的可编辑表格插件

## 功能

- 树形结构，可以自由添加和删除行和子行;
- 每个单元格可自由编辑，支持`input`,`select`;
- 自动排列的索引单元格`index`;
- ​行的增减和单元格修改事件;
- 直接获取整个表格的json格式;

## 使用

1. 初始化

```js
    let selector='test-table';
    let settings={
        heads:[
            {name:'序号',type:'index'},
            {name:'姓名',type:'input'},
            {name:'性别',type:'select'}
        ]
        
    }
    let testTable=EditableTreegrid(selector,settings);
```

1. 配置

## 方法

- 插件基于TreeGrid jQuery plugin,支持其所有方法，详见 http://maxazan.github.io/jquery-treegrid
- ​