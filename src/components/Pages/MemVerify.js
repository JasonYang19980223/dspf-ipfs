import React, { Component } from 'react';
import web3 from '../Load/web3.js'
import Nbar from '../Nbar.js';
import platform from '../Load/platform.js'
import ReactLoading from 'react-loading';

class MemVerify extends Component {
    constructor(props){
        super(props)
        this.state = {
          account: '',
          manager:'',
          memJson:'',
          waitingVerified:'',
          mems:[]
        }
        this.handleClick = this.handleClick.bind(this);
    }
    async componentWillMount() {
        const accounts = await web3.eth.getAccounts()
        if(accounts.length===0) this.setState({alarm:true})
        else{
            this.setState({ account: accounts[0] })
            const pm = await platform.methods.manager().call();
            if(this.state.account === pm){
                this.setState({manager:true});
            }
            else
                this.setState({manager:false});
            await this.getInit();
                
            //若成員已註冊，從IPFS抓取其JSON資料
            if(await platform.methods.members(this.state.account).call()||await platform.methods.watingVerified(this.state.account).call()){
                let memHash =await platform.methods.memberHash(this.state.account).call()
                await this.getMemJson(memHash)
            }
        }
    }
    async getInit(){
        //參與的成員數
        let waitingMem =await platform.methods.waitingMemsCnt().call();
        if(waitingMem===0) this.setState({isLoading:false});
        for (let i = 0; i < waitingMem; i++) {
          this.setState({isLoading:true});
          //成員資訊的ipfs hash
          let memAddr = await platform.methods.idtoWait(i).call();
          if(await platform.methods.watingVerified(memAddr).call()){
            let memhash = await platform.methods.memberHash(memAddr).call()
            await this.getMembersJson(memhash,memAddr,i,waitingMem)
          }
          else if(i===waitingMem-1){
            this.setState({isLoading:false});
          }
        }
    }
    async getMemJson(ipfshash){
        let request = require('request');
        await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            let importedJSON = JSON.parse(body);
            this.setState({
              memJson:importedJSON
            })
            this.setState({isLoading:false})
            
          }
          else
            console.log('error')
        }.bind(this));
      }
      
    //由IPFS獲取有透過欄位參與合作案的成員
    async getMembersJson(ipfshash,addr,i,waitingMem){
        let request = require('request');
        await request(`https://ipfs.io/ipfs/${ipfshash}`, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let memJSON = JSON.parse(body);
            this.setState({
                mems: [...this.state.mems, [memJSON['orgName'],memJSON['phone'],memJSON['email'],addr]]
            })
            if(i=== parseInt(waitingMem)-1){
                this.setState({isLoading:false})
            }
        }
        else
            console.log('error')
        }.bind(this));
    }
    async handleClick(addr) {
        await platform.methods.registerVerified(addr).send({ from: this.state.account }).on('confirmation', (reciept) => {
          window.location.reload()
        })
    }
    render(){
        if(this.state.alarm===true)
            return <h3 style={{textAlign:'center'}}>You must log in metamask first</h3>
        if(this.state.isLoading){
            return <ReactLoading className='loader' type ={'bars'}/>
        }
        return(
            <div>
                <Nbar account={this.state.account} manager ={this.state.manager}memJson={this.state.memJson}/>
                <table className="table">
                    <thead>
                        <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Email</th>
                        <th scope="col">Addr</th>
                        <th scope="col">verify</th>
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
                                <input
                                    type="button"
                                    value="verify mem"
                                    style={{cursor:'pointer'}}
                                    onClick={() => this.handleClick(mem[3])}
                                />
                            </td>
                            </tr>
                        )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}
export default MemVerify;