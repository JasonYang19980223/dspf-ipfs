import React, { Component } from 'react';
import Nbar from '../Nbar.js';
import web3 from '../Load/web3.js'
import platform from '../Load/platform.js'

//********創建主頁畫面***********
class HomePage extends Component {
  //account 使用者的地址
  //memJson 用來傳遞當前登入成員資訊的Json
  constructor(props){
    super(props)
    this.state = {
      account:'',
      //成員的Json file
      memJson:'',
      alarm:false
    } 
  }

  //進入頁面前先進行初始化，用來顯示使用者的地址及確定是否為管理者
  async componentWillMount() {
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    if(accounts.length===0) this.setState({alarm:true})
    else{
      this.setState({ account: accounts[0] })
      const pm = await platform.methods.manager().call();
      if(this.state.account === pm){
        console.log('hi')
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
  //顯示主頁畫面
  render() {
    const imgStyle ={
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };
    if(this.state.alarm===true)
      return <h3 style={{textAlign:'center'}}>You must log in metamask first</h3>
    return (
      <div className="Home">
        <Nbar account={this.state.account} manager ={this.state.manager} memJson={this.state.memJson}/>
        <br/>
        <br/>
        <div style={imgStyle}>
          <img atyle={{margin:'10px'}}src={require('../../images/org.png')} height = '200px' weight = '200px' alt ="something wrong img cant show"/>
          <img src={require('../../images/joinIcon.png')}alt ="something wrong img cant show"/>
          <img atyle={{margin:'10px'}}src={require('../../images/org.png')} height = '200px' weight = '200px' alt ="something wrong img cant show"/>
        </div>
      </div>
    );
  }
}

export default HomePage;