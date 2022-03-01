import React from 'react';
import {
 Navbar,
 Nav,
} from "react-bootstrap";//導入需要的component
import { NavLink } from 'react-router-dom';

export default function Nbar (props) {
    return (
      <Navbar bg="light" expand="lg">
         <Navbar.Brand href="/">Data sharing platform</Navbar.Brand>
         <Navbar.Toggle aria-controls="basic-navbar-nav" />
         <Navbar.Collapse id="basic-navbar-nav">
           <Nav className="mr-auto">
            <NavLink to="/CreatePage" activeStyle={{color:"blue"}} style={{color:"black",margin:"5px"}}>Create member</NavLink>
            <NavLink to="/CreateCooperation"   activeStyle={{color:"blue"}} style={{color:"black",margin:"5px"}}>Create Cooperation</NavLink>
            <NavLink to={{pathname:"/MemberInform",state:{ memJson:props.memJson}}}   activeStyle={{color:"blue"}} style={{color:"black",margin:"5px"}}  >Member information</NavLink>
            <NavLink to="/CooperationList"   activeStyle={{color:"blue"}} style={{color:"black",margin:"5px"}}>Cooperation list</NavLink>
            {/* {props.manager&&<NavLink to="/PendingList"  activeStyle={{color:"blue"}} style={{color:"black",margin:"5px"}}>Pending list</NavLink>} */}
           </Nav>
            <ul className="navbar-nav px-3">
              <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                <small className="text-black"><span id="account">{props.account}</span></small>
              </li>
            </ul>
         </Navbar.Collapse>
      </Navbar>    
    );
}