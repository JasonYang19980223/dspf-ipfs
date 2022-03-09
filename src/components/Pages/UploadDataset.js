import React, { Component } from 'react';
import web3 from '../Load/web3.js'
//import { create } from 'ipfs-http-client'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import { create } from 'ipfs-http-client'
const ipfs = create('https://ipfs.infura.io:5001') // (the default in Node.js)

//ipfs api
//const ipfs=create({host:'ipfs.infura.io',port:'5001',apiPath: '/api/v0'});

//********上傳資料集的介面***********
class UploadDataset extends Component {

    constructor(props){
      //account 使用者的地址
      //columns 組織能提供的欄位
      super(props)
      this.state = {
        account:'',
        file:'',
        fileUrl:''
      }    
      this.handleOnSubmit=this.handleOnSubmit.bind(this);
      this.handleOnChange=this.handleOnChange.bind(this);
      this.handleClick=this.handleClick.bind(this);
    }
  
    //進入頁面前先進行初始化，設定使用者地址，並確認是否為管理者
    async componentWillMount() {
      const accounts = await web3.eth.getAccounts();
      this.setState({ account: accounts[0] })
      const pm = await platform.methods.manager().call();
      //console.log(pm);
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

    async handleClick (e){
        this.state.cooperationJson['alreadyUpload'].push([this.state.account,this.state.fileUrl])
        let cooperationJsonObj = JSON.stringify(this.state.cooperationJson);
        let ipfsCooperation = await ipfs.add(Buffer.from(cooperationJsonObj))
        console.log(this.state.cooperationJson)
        console.log(this.state.fileUrl)
        await platform.methods.updateCooperation(this.state.cooperationJson['ID'],ipfsCooperation['path']).send({from:this.state.account})
    }

    async handleOnChange (e){
        try {
            await this.setState({file:e.target.files[0]})
            console.log(this.state.file['name'])
        } catch (error) {
            console.log('Error uploading file: ', error)
        }  
    }

    async handleOnSubmit (e){
        try {
            let added = await ipfs.add(this.state.file)
            console.log('hhi')
            let url = `https://ipfs.infura.io/ipfs/${added.path}?file=${this.state.file['name']}`
            this.setState({fileUrl:url})
        } catch (error) {
            console.log('Error uploading file: ', error)
        }  
    }
  
  
    //顯示輸入框和對應function
    render() {
      return (
        <div>
          <Nbar account={this.state.account} manager={this.state.manager}memJson={this.state.memJson}/>
          <div>   
            <div>
              <h2>Upload encryped result </h2>  
                <input name="file" type="file" onChange={this.handleOnChange}/>
                <button onClick={this.handleOnSubmit}>Upload File</button>
              <br/>
              <br/>
              <br/>
          </div>
          <div>
            <h2> Update to chain </h2>
            <label>
              <input
                type="button"
                value="confirm"
                style={{cursor:'pointer'}}
                onClick={this.handleClick}
              />
            </label>
            </div>
          </div>
        </div>
      );
    }
  }

export default UploadDataset;
