// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;
contract DSPF {
  //平台管理者帳號
  address public manager;
  mapping (address => bool) public members;
  mapping (uint => address) public idtoWait;
  mapping (address => bool) public watingVerified;

  mapping (address => string) public memberHash;

  mapping (uint => bool) public cooWaitingVerified;
  mapping (uint => string) public cooperationHash;
  mapping (uint => string) public datasetHash;


  //初始化平台管理者地址
  constructor(){
      manager = msg.sender;
  }

  //驗證是否為成員
  modifier memberOnly{
      require(members[msg.sender]==true);
      _;
  }
  //等待驗證的成員總數
  uint public waitingMemsCnt =0;
  
  //計算資料申請的總數，當作資料要求的ID
  uint public datasetCnt =0;
  
  //計算資料申請的總數，當作資料要求的ID
  uint public cooWaitingCnt =0;
  uint public cooperationCnt =0;


  //註冊平台成員
  function registerVerified(address addr) public {
    watingVerified[addr]=false;
    members[addr]=true;
  }
  //註冊等待驗證
  function waitingVerified(string memory _memHash) public {
    idtoWait[waitingMemsCnt]=msg.sender;
    watingVerified[msg.sender]=true;
    memberHash[msg.sender]=_memHash;
    waitingMemsCnt++;
  }

  //取得IPFS平台成員資訊
  function getMember() public view returns (string memory) {
    if(members[msg.sender])
      return memberHash[msg.sender];
    else
      return '';
  }

  //更新平台成員資訊
  function updateMember(string memory _memHash) public {
    memberHash[msg.sender]=_memHash;
  }

  //更新平台成員資訊
  function joinUpdateMember(address _addr,string memory _memHash) public {
    memberHash[_addr]=_memHash;
  }


  //創建提案
  function createCooperation(string memory _cooperationHash) public memberOnly{
    cooperationHash[cooperationCnt] = _cooperationHash;
    cooWaitingVerified[cooWaitingCnt]=true;
    cooWaitingCnt++;
    cooperationCnt++;
  }

  //審核提案
  function verifyCooperation(uint _cooperationID) public memberOnly{
    cooWaitingVerified[_cooperationID]=false;
  }

  //更新提案IPFS的hash
  function updateCooperation(uint cooperationID,string memory _cooperationHash) public memberOnly{
    cooperationHash[cooperationID] = _cooperationHash;
  }

  //取得提案ID對應的IPFS hash
  function getCooperation(uint cooperationID) public view returns (string memory) {
    return cooperationHash[cooperationID];
  }

  //創建資料提供者的資料資訊
  function createDataset(string memory _datasetHash) public memberOnly{
    datasetHash[datasetCnt] = _datasetHash;
    datasetCnt++;
  }

  //取得資料集ID對應的IPFS hash
  function getDataset(uint _datasetID) public view returns (string memory) {
    return datasetHash[_datasetID];
  }

  //透過加密貨幣參與提案
  function addCooperationWithEth() public payable memberOnly{}

  //回傳合約餘額
  function getContractBalance() public view returns(uint) {
    return address(this).balance;
  }

  //分派獎金
  function distributePay(address payable[] memory getEthmembers, uint256[] memory amount,uint256 totalAmount) public{
      require(address(this).balance>=totalAmount,"Insufficient balance in faucet for withdrawal request");
      for(uint i = 0;i<getEthmembers.length;i++) 
        getEthmembers[i].transfer(amount[i]);
  }
  function kill() public {
        if (msg.sender == manager) selfdestruct(payable(manager)); //銷毀合約並將合約內的金額轉回給合約建立者地址
  }
}
