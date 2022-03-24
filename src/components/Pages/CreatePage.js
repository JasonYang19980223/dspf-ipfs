import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Create from './Create.js'
import platform from '../Load/platform.js'
import Nbar from '../Nbar.js';


//********創建成員的介面***********
class CreatePage extends Component {
  //account 使用者的地址
  //manager 發布合約的地址
  //name 組織註冊的名稱
  //phone 組織註冊的電話
  //email 組織註冊的信箱
  //isLogIn 該地址是否已成為成員
  //memJson 用來傳遞當前登入成員資訊的Json
  constructor(props){
    super(props)
    this.state = {
      account: '',
      manager:'',
      name:'',
      phone:'',
      email:'',
      isLogIn:false,
      memJson:''
    }    
  }

  //進入頁面前先進行初始化，設定使用者地址，判斷是否為管理者
  //呼叫function check來判定是否已註冊成員
  async componentWillMount() {
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0] })

    const pm = await platform.methods.manager().call();
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
    await this.check()

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

  //呼叫合約中的members這個mapping來判定該組織是否已成為成員
  async check(){
    let log =await platform.methods.members(this.state.account).call()
    this.setState({isLogIn:log})
    //若已成為成員，頁面顯示成員的基本資料
    if(this.state.isLogIn){
      let request = require('request');
      let memhash = await platform.methods.getMember().call({ from: this.state.account })
      this.setState({ memHash:memhash})
      await request(`https://ipfs.io/ipfs/${memhash}`, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          let importedJSON = JSON.parse(body);
          this.setState({name: importedJSON['orgName']})
          this.setState({phone : importedJSON['phone']})
          this.setState({email : importedJSON['email']})
        }
        else
          console.log('error')
      }.bind(this));
    }
  }

  //頁面互動顯示程式碼
  render() {
    let page;
    //利用isLogIn變數來決定顯示的介面為何
    if(this.state.isLogIn!==true){
      //顯示Create.js
      page=<Create/>;
    }
    else{
      page=(
        <div>
          <Nbar account={this.state.account} manager={this.state.manager}memJson={this.state.memJson}/>
          <div stlye={{margin:"5px"}}>
            <h1>You are already a member</h1>
            <h2>Name:{this.state.name}</h2>
            <h2>Phone:{this.state.phone}</h2>
            <h2>Email:{this.state.email}</h2>
            <h2>Address:{this.state.account}</h2>
          </div>
        </div>
      );
    }
    return(
      <div>
        {page}
      </div>
    );
  }
}


export default CreatePage;