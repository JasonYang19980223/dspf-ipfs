import React, { Component } from 'react';
import web3 from '../Load/web3.js'
//import { create } from 'ipfs-http-client'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import { create } from 'ipfs-http-client'
const ipfs = create('https://ipfs.infura.io:5001') // (the default in Node.js)

//ipfs api
//const ipfs=create({host:'ipfs.infura.io',port:'5001',apiPath: '/api/v0'});

//********加入合作案的介面***********
class JoinCooperation extends Component {

  constructor(props){
    //account 使用者的地址
    //columns 組織能提供的欄位
    super(props)
    this.state = {
      account:'',
      columns:[{
        index:Math.random(),
        colName:''
      }]
    }    
    this.handleCol = this.handleCol.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  //進入頁面前先進行初始化，設定使用者地址，並確認是否為管理者
  async componentWillMount() {
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] })
    const pm = await platform.methods.manager().call();
    console.log(pm);
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
    console.log(this.props.location.state.cooperationJson)
    this.setState({
      cooperationJson:this.props.location.state.cooperationJson
    })
    if(await platform.methods.members(this.state.account).call()){
      let memHash =await platform.methods.memberHash(this.state.account).call()
      await this.getMemJson(memHash)
    }
  }

  async getMemJson(ipfshash){
    let request = require('request');
    await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let importedJSON = JSON.parse(body);
        console.log(importedJSON);
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
  async getJson(ipfshash){
    let request = require('request');
    await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let importedJSON = JSON.parse(body);
        console.log(importedJSON);
        this.setState({memberJson:importedJSON});
      }
      else
        console.log('error')
    }.bind(this));
  }
  //送出確認
  async handleClick(e) {
    let createrHash = await platform.methods.memberHash(this.state.account).call()
    this.getJson(createrHash);

    this.state.cooperationJson['memberDataset'].push([this.state.account,parseInt(await platform.methods.datasetCnt().call(),16)])
    console.log(this.state.cooperationJson)

    this.state.memberJson['cooperations'].push(this.state.cooperationJson['ID'])
    let newMemJson = this.state.memberJson
    let datasetJson = {
      "ID": parseInt(await platform.methods.datasetCnt().call(),16),
      "cooID": this.state.cooperationJson['ID'],
      "ownerAddress": this.state.account,
      "columns":this.state.columns
    }
    //call 智能合約的 addCooperationMem param: 合作案ID
    //加入合作案
    let memJsonObj =JSON.stringify(newMemJson);
    let cooperationJsonObj = JSON.stringify(this.state.cooperationJson);
    let datasetJsonObj = JSON.stringify(datasetJson);

    console.log("Submitting file to ipfs...")

    let ipfsCooperation = await ipfs.add(Buffer.from(cooperationJsonObj))
    let ipfsDataset = await ipfs.add(Buffer.from(datasetJsonObj))
    let ifpsMem = await ipfs.add(Buffer.from(memJsonObj))
    
    console.log(ipfsCooperation['path'])
    console.log(ipfsDataset['path'])
    this.setState({Hash:ipfsCooperation['path']})


    platform.methods.updateCooperation(this.state.cooperationJson['ID'],ipfsCooperation['path']).send({from:this.state.account})
    platform.methods.createDataset(ipfsDataset['path']).send({ from: this.state.account })
    platform.methods.updateMember(ifpsMem['path']).send({ from: this.state.account })
    //call 智能合約的 setDataset param: 設定對應的合作案ID
    //新增資料集
    //await platform.methods.setDataset(this.props.location.state.cooperationID).send({from:this.state.account})

    //call 智能合約的 datasetCnt
    //判斷資料集ID
    // let dataid = await platform.methods.datasetCnt().call()

    // //紀錄組織能提供的欄位上區塊鏈
    // let columns = this.state.columns
    // for( let i = 0 ;i<columns.length;i++){
    //   //call 智能合約的 addColumn param: 欄位對應的資料集的ID
    //   //設定資料集對應的欄位
    //   await platform.methods.addColumn(dataid-1,columns[i]['name']).send({from:this.state.account})
    // }
  }

  //console顯示設定欄位，用來Debug
  async show(){
    let columns = this.state.columns
    for( let i = 0 ;i<columns.length;i++){
      console.log(columns[i]['name'])
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
          <h2> Upload To Chain </h2>
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

export default JoinCooperation;