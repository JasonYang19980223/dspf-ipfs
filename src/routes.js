import React, { Component } from "react";
import {  BrowserRouter,Switch, Route } from "react-router-dom";
import HomePage from './components/Pages/HomePage';
import CreatePage from "./components/Pages/CreatePage";
import CreateCooperation from "./components/Pages/CreateCooperation";
import MemberInform from "./components/Pages/MemberInform";
import CooperationList from "./components/Pages/CooperationList";
import JoinCooperation from "./components/Pages/JoinCooperation";
import CooperationInform from "./components/Pages/CooperationInform";
import MemberCols from "./components/Pages/MemberCols";
import ManageCooperation from "./components/Pages/ManageCooperation";
import UploadDataset from "./components/Pages/UploadDataset";
import UploadResult from "./components/Pages/UploadResult";
import DownloadFile from "./components/Pages/DownloadFile";

import history from './History';

export default class Routes extends Component {
    render() {
        return (
            <BrowserRouter history={history}>
                <Switch>
                    <Route path="/CreatePage"  exact component={CreatePage} />
                    <Route path="/CreateCooperation" component={CreateCooperation} />
                    <Route path="/MemberInform" component={MemberInform} />
                    <Route path="/CooperationList" component={CooperationList} />
                    <Route path="/JoinCooperation" component={JoinCooperation} />
                    <Route path="/CooperationInform" component={CooperationInform} />
                    <Route path="/MemberCols" component={MemberCols} />
                    <Route path="/ManageCooperation" component={ManageCooperation} />
                    <Route path="/UploadDataset" component={UploadDataset} />
                    <Route path="/UploadResult" component={UploadResult} />
                    <Route path="/DownloadFile" component={DownloadFile} />
                    <Route path="/" exact component={HomePage} />
                </Switch>
            </BrowserRouter>
        )
    }
}