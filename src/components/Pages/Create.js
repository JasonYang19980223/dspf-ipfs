import React, { Component } from 'react';
import web3 from '../Load/web3.js';
import platform from '../Load/platform.js'
import { create } from 'ipfs-http-client'
import Nbar from '../Nbar.js';

import '../CSS/Create.css'

// connect to ipfs daemon API server
const ipfs = create('https://ipfs.infura.io:5001') // (the default in Node.js)


class Create extends Component {
  constructor(props) {
    super(props)
    
    //memHash
    //acount 當前使用者帳號
    //manager 判斷當前是否為平台使用者
    //orgnizationName 組織名稱
    //phone 組織電話
    //email 組織信箱
    //memJson 用來傳遞當前登入成員資訊的Json
    this.state = {
      memHash: '',
      account:'',
      manager: '',
      orgnizationName:'',
      phone:'',
      email:'',
      memJson:''
    }
    this.handleName = this.handleName.bind(this);
    this.handlePhone = this.handlePhone.bind(this);
    this.handleEmail = this.handleEmail.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  async componentWillMount() {
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const pm = await platform.methods.manager().call();
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
  }
  //設定組織名稱
  handleName(e) {
    this.setState({orgnizationName: e.target.value});
  }

  //設定組織手機
  handlePhone(e) {
    this.setState({phone: e.target.value});
  }

  //設定組織信箱
  handleEmail(e) {
    this.setState({email: e.target.value});
  }
  //將成員資訊上傳IPFS
  async handleClick(e) {
    
    let orgJson = {
      "orgName": this.state.orgnizationName,
      "phone": this.state.phone,
      "email": this.state.email,
      "cooperations":[]
    };
    let jsonObj = JSON.stringify(orgJson);
    console.log("Submitting file to ipfs...")
    let cid = await ipfs.add(Buffer.from(jsonObj))
    console.log(cid['path'])
    await platform.methods.register(cid['path']).send({ from: this.state.account }).on('confirmation', (reciept) => {
      window.location.reload()
    })
    console.log('hi')
  }
  
  render() {
    const styleInput={
      border:'2px solid'
    };
    return (
      <div>
        <Nbar account={this.state.account} manager={this.state.manager}memJson={this.state.memJson}/> 
        <h1 style={{textAlign:'center'}}>Create Account</h1>
          <div className="container">
            <form className='child' style={{margin:'5px'}}>
              <label>
                <input type="text" placeholder="orginization name" style={styleInput} onChange={ this.handleName } />
              </label>
              <br/>
              <label>
                <input type="text" placeholder="phone" style={styleInput} onChange={ this.handlePhone } />
              </label>
              <br/>
              <label>
                <input type="text" placeholder="email" style={styleInput} onChange={ this.handleEmail } />
              </label>
              <br/>
              <label>
                <input
                  type="button"
                  value="confirm"
                  style={{cursor:'pointer'}}
                  onClick={this.handleClick}
                />
              </label>
              <br/>
            </form>
          </div>
      </div>
    );
  }
}

export default Create;
