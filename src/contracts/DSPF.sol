pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;
contract DSPF {
  //平台管理者帳號
  address public manager;
  mapping (address => bool) public members;
  mapping (address => string) public memberHash;
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

  //計算資料申請的總數，當作資料要求的ID
  uint public datasetCnt =0;
  
  //計算資料申請的總數，當作資料要求的ID
  uint public cooperationCnt =0;

  //註冊平台成員
  function register(string memory _memHash) public {
    members[msg.sender]=true;
    memberHash[msg.sender]=_memHash;
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

  //創建提案
  function createCooperation(string memory _cooperationHash) public memberOnly{
    cooperationHash[cooperationCnt] = _cooperationHash;
    cooperationCnt++;
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
  function distributePay(address payable[] memory members, uint256[] memory amount,uint256 totalAmount) public{
      require(address(this).balance>=totalAmount,"Insufficient balance in faucet for withdrawal request");
      for(uint i = 0;i<members.length;i++) 
        members[i].transfer(amount[i]);
  }
}
