import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
//********合作案清單的介面***********
class DownloadFile extends Component {
  
  //account 使用者的地址
  //cooperations 合作案的list
  constructor(props){
    super(props)
    this.state = {
      account: '',
      datasetUrls:[]
    }
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
    let datasetLen=0;
    let cooJson = this.props.location.state.cooperationJson
    datasetLen = cooJson['alreadyUpload'].length
    for (var i = 0; i < datasetLen; i++) {
      //call 智能合約中的cooperations 來獲取該合作案
      let datasetUrl = cooJson['alreadyUpload'][i][1]
      this.setState({
        datasetUrls: [...this.state.datasetUrls, datasetUrl]
      })
    }
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
                <th scope="col">idx</th>
                <th scope="col">Download</th>
            </tr>
          </thead>
          <tbody id="request">
            { this.state.datasetUrls.map((datasetUrl, key) => {
              return(
                <tr key={key}>
                    <th scope="row">{key} </th>
                    <td>
                        <a href={datasetUrl} download>Click to download</a>
                    </td>
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


export default DownloadFile;