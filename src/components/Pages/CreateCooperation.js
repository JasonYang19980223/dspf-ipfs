import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import { create } from 'ipfs-http-client'
const ipfs = create('https://ipfs.infura.io:5001') // (the default in Node.js)
//ipfs api
//const ipfs=create({host:'ipfs.infura.io',port:'5001',apiPath: '/api/v0'});

//********創建合作案的介面***********
class CreateCooperation extends Component {
  //account 使用者的地址
  //columns 組織能提供的欄位
  //primaryKey 組織選擇的探勘演算法
  //target 組織想探究的目的
  constructor(props){
    super(props)
    this.state = {
      account:'',
      columns:[{
        index:Math.random(),
        colName:''
      }],
      primaryKey:'',
      target:''
    }    
    this.handleCol = this.handleCol.bind(this);
    this.handlePrimaryKey = this.handlePrimaryKey.bind(this);
    this.handleTarget = this.handleTarget.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.show = this.show.bind(this);
  }


  //進入頁面後，設定使用者地址，並確認是否為管理者
  async componentWillMount() {
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] })
    const pm = await platform.methods.manager().call();
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
    //若成員已註冊，從IPFS抓取其JSON資料
    if(await platform.methods.members(this.state.account).call()){
      let memHash =await platform.methods.memberHash(this.state.account).call()
      await this.getMemJson(memHash)
    }
  }
  
  //由IPFS讀取成員JSON
  async getMemJson(ipfshash){
    let request = require('request');
    await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let importedJSON = JSON.parse(body);
        this.setState({
          memJson:importedJSON
        })
      }
      else
        console.log('error')
    }.bind(this));
  }

  //設定欄位
  handleCol(idx,e) {
    // 1. Make a shallow copy of the items
    let columns = [...this.state.columns];
    // 2. Make a shallow copy of the item you want to mutate
    let col = {...columns[idx]};
    // 3. Replace the property you're intested in
    col.name = e.target.value;
    // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
    columns[idx] = col;
    // 5. Set the state to our new copy
    this.setState({columns});
  }

  //設定探勘演算法
  handlePrimaryKey(e) {
    this.setState({primaryKey:e.target.value});
  }

  //設定目標
  handleTarget(e) {
    this.setState({target: e.target.value});
  }

  //新增欄位
  addCol(){
    this.setState(prevState=>({
      columns:[
        ...prevState.columns,
        {
          index:Math.random(),
          colName:''
        }
      ]
    }))
  }

  //刪除欄位
  clickOnDelete(record) {
    this.setState({
      columns: this.state.columns.filter(r => r !== record)
    });
  }

  //送出確認
  async handleClick(e) {
    //透過合約獲得成員資訊的Hash
    let createrHash = await platform.methods.memberHash(this.state.account).call()
    
    //獲取成員資訊JSON
    this.getMemJson(createrHash);

    //將成員地址和datasetID綁定
    let memberDatasets = [[this.state.account,parseInt(await platform.methods.datasetCnt().call(),16)]]
    
    //新建合作案資訊的JSON
    let cooperationJson = {
      "ID": parseInt(await platform.methods.cooperationCnt().call(),16),
      "target": this.state.target,
      "host": this.state.account,
      "memberDataset":memberDatasets
    };

    //將成員資訊中，餐與合作案的部分新增創建的合作案ID
    this.state.memJson['cooperations'].push(cooperationJson['ID'])
    
    //新增參與合作案過後的成員JSON
    let newMemJson = this.state.memJson

    //成員提供合作案的欄位資訊包成JSON
    let datasetJson = {
      "ID": parseInt(await platform.methods.datasetCnt().call(),16),
      "cooID": parseInt(await platform.methods.cooperationCnt().call(),16),
      "ownerAddress": this.state.account,
      "columns":this.state.columns
    }

    //將JSON Stringify
    let memJsonObj =JSON.stringify(newMemJson);
    let cooperationJsonObj = JSON.stringify(cooperationJson);
    let datasetJsonObj = JSON.stringify(datasetJson);
    
    //上傳至IPFS
    console.log("Submitting file to ipfs...")
    let ipfsCooperation = await ipfs.add(Buffer.from(cooperationJsonObj))
    let ipfsDataset = await ipfs.add(Buffer.from(datasetJsonObj))
    let ifpsMem = await ipfs.add(Buffer.from(memJsonObj))
    console.log("Submitting file to ipfs...")
    //將區塊鏈上的IPFS hash更新
    platform.methods.createCooperation(ipfsCooperation['path']).send({ from: this.state.account }).then((r) => {
      return this.setState({ cooperationHash: ipfsCooperation['path'] })
    })
    platform.methods.createDataset(ipfsDataset['path']).send({ from: this.state.account })
    platform.methods.updateMember(ifpsMem['path']).send({ from: this.state.account })
  }

  //console顯示設定欄位，用來Debug
  async show(){
    let columns = this.state.columns
    for( let i = 0 ;i<columns.length;i++){
      console.log(columns[i]['name'])
    }
    if(await platform.methods.members(this.state.account).call()){
      let memHash =await platform.methods.memberHash(this.state.account).call()
      await this.getMemJson(memHash)
    }
  }

  //顯示輸入框和對應function
  render() {
    const styleInput={
      border:'2px solid'
    };
    return (
      <div>
        <Nbar account={this.state.account} manager={this.state.manager}memJson={this.state.memJson}/>
        <div>
          <div>
            <h2> Create cooperation </h2>
              <label>
                <input type="text" placeholder="target" style={styleInput} onChange={ this.handleTarget } />
              </label>
              <br/>
              <label>
               <input type="text" placeholder="primary Key" style={styleInput} onChange={ this.handlePrimaryKey } />
              </label>
              <br/>
              <br/>
          </div>    
          <div>
            <h2> Set Column </h2>  
            {this.state.columns.map((val,idx)=>{
              return(
                <div key={val.index}>
                  <div className="col-row" >
                    <label>
                      <input type="text" placeholder="column" style={styleInput} onChange={(event)=>this.handleCol(idx,event)} />
                    </label>
                  </div>
                  <div className ="col p-4">
                    {idx===0?(
                      <button
                        onClick={() => this.addCol(idx)}
                        type="button"
                        className="btn btn-primary text-center"
                      >
                        add column
                      </button>
                      ):(
                        <button
                          className="btn btn-danger"
                          onClick={() => this.clickOnDelete(val)}
                        >
                          delete column
                        </button>
                      )}
                  </div>
                </div>
              )
            })}
            <br/>
            <br/>
            <br/>
        </div>
        <div>
          <h2> Upload To IPFS </h2>
          <label>
            <input
              type="button"
              value="confirm"
              style={{cursor:'pointer'}}
              onClick={this.handleClick}
            />
          </label>
          <label>
            <input
              type="button"
              value="show"
              style={{cursor:'pointer'}}
              onClick={this.show}
            />
          </label>
          </div>
        </div>
      </div>
    );
  }
}


export default CreateCooperation;