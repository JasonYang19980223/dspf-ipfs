import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import history from '../../History';
import { Link } from 'react-router-dom';
//********合作案清單的介面***********
class ManageCooperation extends Component {
  
  //account 使用者的地址
  //cooperations 合作案的list
  constructor(props){
    super(props)
    this.state = {
      account: '',
      cooperations:[]
    }
    this.handleCooperation= this.handleCooperation.bind(this);
    this.handleJoin= this.handleJoin.bind(this);
  }

  //進入頁面前先進行初始化，設定使用者地址，並確認是否為管理者 
  //call getInit() 來獲取當前的所有合作案
  async componentWillMount() {
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const pm = await platform.methods.manager().call();
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
    await this.getInit();
        
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

  //獲取合作案清單
  async getInit(){
    //call 智能合約中的cooperationCnt 來判斷當前合作案的數量
    let coolen=0;
    coolen = await platform.methods.cooperationCnt().call()
    for (var i = 0; i < coolen; i++) {
      //call 智能合約中的cooperations 來獲取該合作案
      let cooperation = await platform.methods.getCooperation(i).call()
      await this.getCooJson(cooperation)
    }
  }

  //由IPFS讀取合作案JSON
  async getCooJson(ipfshash){
    let request = require('request');
    await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let importedJSON = JSON.parse(body);
        this.setState({
          cooperations: [...this.state.cooperations, importedJSON]
        })
      }
      else
        console.log('error')
    }.bind(this));
  }
  
  //點選button: target 跳轉到CooperationInform的介面
  //param: 合作案的ID
  async handleCooperation(cooID) {
    let path = "/CooperationInform"; 
    history.push({
      pathname:path,
      state:{
        cooperationID:cooID
      }
    });
  }

  //點選button: join to share 跳轉到joinCooperation的介面
  //param: 合作案的ID  
  async handleJoin(cooID) {
    let path = "/JoinCooperation"; 
    history.push({
      pathname:path,
      state:{
        cooperationID:cooID
      }
    });
  }

  render() {
    return (
      <div>
        <Nbar account={this.state.account} manager ={this.state.manager}memJson={this.state.memJson}/>
        <h3>Account: {this.state.account}</h3>
        <br/>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Target</th>
              <th scope="col">Host</th>
              <th scope="col">Period</th>
              <th scope="col">Open</th>
              <th scope="col">Join</th>
            </tr>
          </thead>
          <tbody id="request">
            { this.state.cooperations.map((cooperation, key) => {
              let join
              join= <td>
                      <Link to={{ 
                        pathname: "/JoinCooperation", 
                        state:{ cooperationJson:cooperation}
                        }}>
                        Join to share
                      </Link>
                      {/* <input
                        type="button"
                        value="Join to share"
                        style={{cursor:'pointer'}}
                        onClick={()=>this.handleJoin(cooperation['ID'])}
                      /> */}
                    </td>
              return(
                <tr key={key}>
                  <th scope="row">{cooperation['ID']} </th>
                  <td>
                    <Link to={{ 
                    pathname: "/CooperationInform", 
                    state:{ cooperationJson:cooperation}
                    }}>
                    {cooperation['target']}
                    </Link>
                    {/* <input
                      type = "button"
                      value={cooperation['target']}
                      style={{cursor:'pointer'}}
                      onClick={()=>this.handleCooperation(cooperation['ID'])}
                    /> */}
                  </td>
                  <td>{cooperation['host']}</td>
                  <td>{cooperation['openPeriod']}</td>
                  {cooperation['openOrNot']?<td>{cooperation['openOrNot'].toString()}</td>:<td>false</td>}
                  {join}
                </tr>
              )
            })}
          </tbody>
        </table>
        <br/>
      </div>
    );
  }
}


export default ManageCooperation;