import React, { Component } from 'react';
import web3 from '../Load/web3.js'
//import { create } from 'ipfs-http-client'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import { create } from 'ipfs-http-client'
const ipfs = create('https://ipfs.infura.io:5001') // (the default in Node.js)

//********上傳探勘結果的介面***********
class UploadResult extends Component {

    constructor(props){
      //account 使用者的地址
      //file 管理者上船的結果檔案
      //fileUrl 探勘結果的hash地址
      //totalAmount 該提案獲得的eth總量
      //totalCols 該提案獲得的欄位總量
      //amount 每個成員提供的欄位數量
      //ethAmount 每個提供欄位成員能獲得的eth
      //accs 提供欄位的成員地址陣列
      //memJson 用來傳遞當前登入成員資訊的Json
      
      super(props)
      this.state = {
        account:'',
        file:'',
        fileUrl:'',
        totalAmount:0,
        totalCols:0,
        amount:[],
        ethAmount:[],
        accs:[],
        memJson:'',
        alarm:false
      }    
      this.handleClick=this.handleClick.bind(this);
      this.handleSend=this.handleSend.bind(this);
      this.handleOnSubmit=this.handleOnSubmit.bind(this);
      this.handleOnChange=this.handleOnChange.bind(this);
    }
  
    //進入頁面前先進行初始化，設定使用者地址，並確認是否為管理者
    async componentWillMount() {
      const accounts = await web3.eth.getAccounts();
      if(accounts.length===0) this.setState({alarm:true})
      else{
        this.setState({ account: accounts[0] })
        const pm = await platform.methods.manager().call();

        if(this.state.account === pm){
          this.setState({manager:true});
        }
        else
          this.setState({manager:false});

        this.setState({
          cooperationJson:this.props.location.state.cooperationJson
        })

        //貢獻欄位的帳號陣列
        let dataAccLen = this.state.cooperationJson['memberDataset'].length
        for(let i =0;i<dataAccLen;i++){
          this.setState({
            accs: [...this.state.accs, this.state.cooperationJson['memberDataset'][i][0]]
          })
          let datasetHash =  await platform.methods.getDataset(this.state.cooperationJson['memberDataset'][i][1]).call()
          await this.getDatasetJson(datasetHash)
        }


        // 計算加密貨幣總數
        let ethAccLen = this.state.cooperationJson['memberEth'].length
        let total = 0;
        for(let i =0;i<ethAccLen;i++){
          total+=parseInt(this.state.cooperationJson['memberEth'][i][1]);
        }

        this.setState({
          totalAmount:total
        })

        if(await platform.methods.members(this.state.account).call()||await platform.methods.watingVerified(this.state.account).call()){
          let memHash =await platform.methods.memberHash(this.state.account).call()
          await this.getMemJson(memHash)
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
        this.setState({
          amount: [...this.state.amount, colLen]
        })
        this.setState({
          totalCols: this.state.totalCols+colLen
        })
      }
      else
        console.log('error')
    }.bind(this));
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
        this.state.cooperationJson['result']=this.state.fileUrl
        
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
  
    async handleSend (e){
      let len = this.state.amount.length
      let ethAmount=[]
      for(let i = 0;i<len;i++){
        ethAmount.push(this.state.totalAmount*this.state.amount[i]/this.state.totalCols)
      }
      console.log(this.state.accs)
      console.log(this.state.totalAmount)
      console.log(ethAmount)
      await platform.methods.distributePay(this.state.accs,ethAmount,this.state.totalAmount).send({ from: this.state.account }).on('confirmation', (reciept) => {
        window.location.reload()
      })
    }
  
    //顯示輸入框和對應function
    render() {
      if(this.state.alarm===true)
        return <h3 style={{textAlign:'center'}}>You must log in metamask first</h3>
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
          <br></br>
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
            <br></br>
            <div>
            <h2> Send Ether to contributed-members </h2>
            <label>
              <input
                type="button"
                value="confirm"
                style={{cursor:'pointer'}}
                onClick={this.handleSend}
              />
            </label>
            </div>
          </div>
        </div>
      );
    }
  }

export default UploadResult;
