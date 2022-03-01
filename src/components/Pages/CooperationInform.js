import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import { Link } from 'react-router-dom';
//********合作案資訊的介面***********
class CooperationInform extends Component {
  
  constructor(props){

    //account 使用者的地址
    //mems 參與合作案的成員
    super(props)
    this.state = {
      account: '',
      mems:[],
      memJsons:[]
    }
    this.getInit= this.getInit.bind(this);
  }

  //進入頁面前先進行初始化，設定使用者地址，並確認是否為管理者 
  //call getInit() 來獲取該合作案參與的成員資訊
  async componentWillMount() {
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const pm = await platform.methods.manager().call();
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
    
    //獲取成員資訊
    await this.getInit()

    //若成員已註冊，從IPFS抓取其JSON資料
    if(await platform.methods.members(this.state.account).call()){
      let memHash =await platform.methods.memberHash(this.state.account).call()
      await this.getMemJson(memHash)
    }
  }

  //由IPFS讀取合作案JSON
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
    //由合作案的JSON初始化參與的成員
    this.setState({
      memsAddress:  this.props.location.state.cooperationJson['memberDataset']
    })

    //參與的成員數
    let memLen = this.state.memsAddress.length
    for (var i = 0; i < memLen; i++) {
      //成員資訊的ipfs hash
      let memhash = await platform.methods.memberHash(this.state.memsAddress[i][0]).call()
      await this.getMembersJson(memhash,i)
    }
  }

  //由IPFS獲取有參與合作案的成員
  async getMembersJson(ipfshash,i){
    let request = require('request');
    await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let memJSON = JSON.parse(body);
        this.setState({
          mems: [...this.state.mems, [memJSON['orgName'],memJSON['phone'],memJSON['email'],this.state.memsAddress[i][0]]]
        })
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
              <th scope="col">Name</th>
              <th scope="col">Phone</th>
              <th scope="col">Email</th>
              <th scope="col">Addr</th>
              <th scope="col">Member Columns</th>
            </tr>
          </thead>
          <tbody id="request">
            { this.state.mems.map((mem, key) => {
              return(
                <tr key={key}>
                  <td>{mem[0]}</td>
                  <td>{mem[1]}</td>
                  <td>{mem[2]}</td>
                  <td>{mem[3]}</td>
                  <td>
                    <Link to={{ 
                      pathname: "/MemberCols", 
                      state:{
                          cooperationJson:this.props.location.state.cooperationJson,
                          memAddress:mem[3]
                        }
                      }}>
                      col
                    </Link>
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


export default CooperationInform;