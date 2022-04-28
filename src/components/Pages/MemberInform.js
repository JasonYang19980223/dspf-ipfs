import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import history from '../../History';
import { Link } from 'react-router-dom';
import ReactLoading from 'react-loading';
//********成員基本資訊和參與了什麼合作案的介面***********
class MemberInform extends Component {
  
  constructor(props){
    //account 使用者的地址
    //name 該組織的名稱
    //phone 該組織的電話
    //email 該組織的信箱
    //cooperations 該組織參與的合作案列表
    super(props)
    this.state = {
      account:'',
      name:'',
      phone:'',
      email:'',
      cooperations:[],
      isLogIn:false,
      isLoading:true,
      alarm:false
    }
    this.getInit= this.getInit.bind(this);
    this.getCooJson= this.getCooJson.bind(this);
  }

  //進入頁面前先進行初始化，設定使用者地址，並確認是否為管理者 
  //call getInit() 來獲取該成員參與的合作案 
  async componentWillMount() {
    //判斷該組織是否已成為成員
    const accounts = await web3.eth.getAccounts()

    if(accounts.length===0) this.setState({alarm:true})
    else{
      this.setState({ account: accounts[0] })
      this.setState({isLogIn: await platform.methods.members(accounts[0]).call()})
      this.setState({waitinglog:await platform.methods.watingVerified(accounts[0]).call()})
      const pm = await platform.methods.manager().call();
      if(this.state.account === pm){
        this.setState({manager:true});
      }
      else
        this.setState({manager:false});
      console.log(this.state.isLogIn)
      console.log(this.state.waitinglog)
      if(this.state.isLogIn||this.state.waitinglog){
        await this.getInit()
      }
    }

  }

  //由IPFS獲得參與的合作案資訊
  async getCooJson(ipfshash,i,coolen){
    let request = require('request');
    
    await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let importedJSON = JSON.parse(body);
        this.setState({
          cooperations: [...this.state.cooperations,importedJSON]
        })
        if(i===coolen-1){
          this.setState({isLoading:false})
        }
      }
      else
        console.log('error')
    }.bind(this));
  }

  //獲取該成員參與的合作案
  async getInit(){
    if(this.state.isLogIn||this.state.waitinglog){
      //獲取合作案
      console.log(this.props.location.state.memJson)
      if(this.props.location.state.memJson!==''){
        let cooLen = this.props.location.state.memJson['cooperations'].length
        if(cooLen === 0) this.setState({isLoading:false})
        for(let i = 0;i<cooLen;i++){
          let cooHash = await platform.methods.getCooperation(this.props.location.state.memJson['cooperations'][i]).call()
          await this.getCooJson(cooHash,i,cooLen)
        }
      }
    }

  }

  //點擊button: col跳轉到MemberCols 判斷提供了什麼欄位
  //param: 合作案ID、成員地址
  async handleCol(cooID,memaddress) {
    let path = "/MemberCols"; 
    history.push({
      pathname:path,
      state:{
        cooperationID:cooID,
        memberAddress:memaddress
      }
    });
  }

  render() {
    if(this.state.alarm===true)
      return <h3 style={{textAlign:'center'}}>You must log in metamask first</h3>
    if(this.state.isLoading){
      return <ReactLoading className='loader' type ={'bars'}/>
    }
    return (
      <div>
        <Nbar account={this.state.account} manager ={this.state.manager}memJson={ this.props.location.state.memJson}/>
        <h3>Account: {this.state.account}</h3>
        <br/>
        <h3>Name: { this.props.location.state.memJson['orgName']}</h3>
        <br/>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">cooperation</th>
              <th scope="col">period</th>
              <th scope="col">upload</th>
              <th scope="col">data</th>
              <th scope="col">result</th>
            </tr>
          </thead>
          <tbody id="request">
            { this.state.cooperations.map((coo, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{coo['ID']}</th>
                  <td>{coo['target']}</td>
                  <td>{coo['openPeriod']}</td>
                  <td><Link to={{ 
                        pathname: "/UploadDataset", 
                        state:{ cooperationJson:coo}
                        }}>
                        upload file
                      </Link></td>
                  <td>                    
                    <Link to={{ 
                      pathname: "/MemberCols", 
                      state:{
                          cooperationJson:coo,
                          memAddress:this.state.account
                        }
                      }}>
                      col
                    </Link>
                  </td>
                  {coo['result']===''?<td>waiting</td>:<td>
                        <a href={coo['result']} download>Click to download</a>
                    </td>}
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


export default MemberInform;