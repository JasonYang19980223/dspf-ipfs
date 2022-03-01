import React, { Component } from 'react';
import web3 from '../Load/web3.js';
import contract from '../Load/platform.js'
import { create } from 'ipfs-http-client'
import Nbar from '../Nbar.js';
// connect to ipfs daemon API server
const ipfs = create('https://ipfs.infura.io:5001') // (the default in Node.js)


class Create extends Component {

  async componentWillMount() {
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    this.setState({ contract })
    const pm = await contract.methods.manager().call();
    if(this.state.account === pm){
      this.setState({manager:true});
    }
    else
      this.setState({manager:false});
  }

  constructor(props) {
    super(props)

    this.state = {
      memHash: '',
      account: null,
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
    this.handleGet = this.handleGet.bind(this);
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
    await contract.methods.register(cid['path']).send({ from: this.state.account })
  }

  async handleGet(e) {
    let memHash = await contract.methods.memberHash(this.state.account).call()
    console.log(memHash)
    let request = require('request');
    await request(`https://ipfs.io/ipfs/${memHash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let importedJSON = JSON.parse(body);
        console.log(importedJSON)
        this.setState({
          memJson:importedJSON
        })
      }
      else
        console.log('error')
    }.bind(this));
  }

  //QmT7qMC1ietmdH4W8CE54ezKnYrhcEvJMMUTTwkXe8kpwZ
  render() {
    const styleInput={
      border:'2px solid'
    };
    return (
      <div>
        <Nbar account={this.state.account} manager={this.state.manager}memJson={this.state.memJson}/>
        <form style={{margin:'5px'}}>
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
          <label>
            <input
              type="button"
              value="get"
              style={{cursor:'pointer'}}
              onClick={this.handleGet}
            />
          </label>
          <br/>
        </form>
      </div>
    );
  }
}

export default Create;