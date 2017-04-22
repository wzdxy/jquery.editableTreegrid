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
        levels:[

        ]
    }
    let testTable=EditableTreegrid(selector,settings);
```

## 配置
1. 表头`heads`
    ```js
    {name:'类型',type:'hidden'}	//隐藏的列
    {name:'addChild',type:'operate',style: {width: '15%'},
        buttons:{
            btn1:{name:'添加接口',callback:addIOs},
            btn2:{name:'绑定接口',callback:connectIOs}
        }
    }
    ```
    - 类型`type`:
        - `hidden` : 隐藏的列
        - `operate` : 有按钮的表头
   
    - 样式`style`
        - `width` : 宽度
    - 其他参数
        - `options` : {Object} 按钮定义
            - 使用自定义函数 : `{myBtn:{name:'添加接口',callback:addIOs}}`
            - 使用内置操作 : `buttons:{addRoot:{name:'添加组'}}}`
2. 级别 `levels`
    ```js
    levels: [
        [
            {name: 'property', type: 'select', options: deviceTypeOptions,dataType:'number'},
            {name: 'portIndex', type: 'input',dataType:'number'},
        ]
    ```
    - 类型`type`
        - `index` :  索引(从0开始)
        - `select` : 下拉选择,`options`为选项
        - `readonly` : 只读的单元格
        - `operate` : 有按钮的单元格,`buttons`为按钮定义
        - `timestamp` : 添加本行数据的时间戳
    ```js
        {name: 'index', type: 'index',dataType:'number'},   //index 索引(从0开始)
        {name: 'property', type: 'select', options: [{name: 'SDI', value: 0},{name: 'IP', value: 1}]},
        {name: 'portIndex', type: 'input',dataType:'number'},   //input 可编辑的单元格
        {name: 'SwitchPort', type: 'readonly',default:0},       //readonly 只读的单元格
        {name: 'syncname',type:'input',onchange:tdView,action:{url:'/edit',method:'POST',params:['streamid']},data:['streamId']},
        {name: 'deleteRow', type: 'operate',buttons: {delete: {name:'删除'}}}     //有按钮的单元格
    ```
    - 其他参数
        - `options` : `{Array}` 下拉框的选项
        - `buttons` : `{Object}` 
            - `buttons: {delete: {name:'删除'}}`
        - `dataType` : 输出的数据类型
            - `number` : 获取表格数据时将强制转化为Number类型
        - `onchange` : `{function}`本行数据被修改时执行的函数, 适用于`select` 和 `input`,函数可以接收两个参数 : `本单元格的DOM`和`修改后的值`
        - `onclick` : `{function}` 点击单元格时执行的函数
        - `action` : `{Object}` 动态向后端发送修改请求, 适用于`input`
        - `data` : `{String}` 发送请求的数据键名, 
3. 表格的"回调" `callback`
    ```js
        callback: {
            addRow: syncIpChannelOptions,
            deleteRow:syncIpChannelOptions
        }
    ```
    - `addRow` : 添加一行时执行, 函数接收一个参数 `新增行的 DOM`
    - `deleteRow` : 删除一行时执行, 函数接收一个参数 : `被删除的行的 DOM`
4. 其他选项 
    `selectChangeSync` 绑定一个`select`和`input`,使`input`同步显示一些信息
## 方法

1. 插件基于TreeGrid jQuery plugin,支持其所有方法，详见 http://maxazan.github.io/jquery-treegrid
2. 内置方法
    - `getData` : 获取整个表格的 JSON 格式数据
    - `loadData` : 将 JSON 格式的数据加载到表格
    - `init` : 初始化一个空白的表格
    - `freshSelectOptions` : 刷新一个位置的下拉菜单(动态更新选项)
        ```js
        let options=[];
        for(let i=0;i<10;i++){
            options.push({name:i+1,value:i+1});
        }
        ipStreamEditableTable.freshSelectOptions(0,5,options,'channel');
        ```
    - `changeDataOfCol` : 修改一列的数据
    - `getDataOfCol` : 获取一列的数据, 返回数据组成的数组
    - `getDataOfRow` : 获取一行的数据,返回对象
    