import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'


//********該成員提供什麼欄位的介面***********
class RequestList extends Component {
  
  //account 使用者的地址
  //cols 該成員提供的欄位
  constructor(props){
    super(props)
    this.state = {
      account: '',
      cols:[]
    }
  }

  //進入頁面前先進行初始化，設定使用者地址，並確認是否為管理者 
  //call getInit() 來獲取該成員提供的欄位  
  async componentWillMount() {
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const pm = await platform.methods.manager().call();
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
    await this.getInit()

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

  async getInit(){
    //從合作案的JSON中獲得資料集的數量
    let datasetLen = this.props.location.state.cooperationJson['memberDataset'].length

    //從資料集中找出該成員提供的欄位
    for (let i = 0; i < datasetLen; i++){
      //資料集對應成員地址相符
      if(this.props.location.state.cooperationJson['memberDataset'][i][0]===this.props.location.state.memAddress){
        const datasetHash =  await platform.methods.getDataset(this.props.location.state.cooperationJson['memberDataset'][i][1]).call()
        await this.getDatasetJson(datasetHash)
        break;
      }
    }
  }

  //由IPFS獲取該資料集提供的欄位
  async getDatasetJson(ipfshash){
    let request = require('request');
    await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let datasetJSON = JSON.parse(body);
        let colLen =datasetJSON['columns'].length
        for(let i = 0; i < colLen; i++){
          this.setState({
            cols: [...this.state.cols, datasetJSON['columns'][i]['name']]
          })
        }
      }
      else
        console.log('error')
    }.bind(this));
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
              <th scope="col">Columns</th>
            </tr>
          </thead>
          <tbody id="request">
            { this.state.cols.map((col, key) => {
              return(
                <tr key={key}>
                  <td>{col}</td>
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


export default RequestList;