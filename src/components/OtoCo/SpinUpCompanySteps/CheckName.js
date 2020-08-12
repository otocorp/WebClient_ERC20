// React
import React, {useEffect, createRef} from 'react';

// Redux Hook
import {useMappedState,useDispatch} from 'redux-react-hook';
import { useHistory } from "react-router-dom";

// Semantic UI for React
import { Input, Label, Button, Message, Dropdown } from 'semantic-ui-react'

import axios from 'axios';

export default () => { 

    const dispatch = useDispatch();
    const history = useHistory();
    const {selectedCompanyName, jurisdictionSelected, jurisdictionName, jurisdictionOptions, jurisdictionStreet, availableName} = useMappedState(({welcomePanelState}) => welcomePanelState);

    let compName = ""

    const closeLoading = () => {
        dispatch({type: 'Close Welcome Board Loading'});
    }

    const handleInputChange = (e, data) => {
        compName = e.target.value;
    }

    const handleJurisdictionChange = (e, data) => {
        let name = data.options.find( o => { return o.value == data.value }).text;
        dispatch({type: 'Select Jurisdiction', value: data.value, name: name, street: data.street})
        dispatch({type: 'Enter Company Name on Welcome Board', value: compName})
    }

    const clickDashboardHandler = async (e) => {
        dispatch({type: 'Hide Error Msg on Welcome Board'});
        closeLoading();
        dispatch({ type: "Welcome Board Go To Step N", N: 'dashboard' });
        history.push("/dashboard");
    }

    const validate_input = () => {
        if(compName === "") return false;
        return true;
    }

    const clickCheckHandler = async (e) => {
        
        //console.log('selected', selectedCompanyName,'input', compName)
        if (compName == '') compName = selectedCompanyName;
        dispatch({type: 'Enter Company Name on Welcome Board', value: compName})
        if(!validate_input()) {
            dispatch({
                type: 'Show Error Msg on Welcome Board', 
                title: "Company name is required!", 
                msg: "Please enter the company name you want to spin up."
            });
            return;
        }
    
        dispatch({type: 'Open Welcome Board Loading'});
        dispatch({type: 'Hide Error Msg on Welcome Board'});

        //console.log('selected', selectedCompanyName,'input', compName)
        axios.get(`https://api.opencorporates.com/v0.4.8/companies/search?q=${encodeURIComponent(compName + " LLC")}&jurisdiction_code=${jurisdictionSelected}`)
        .then(function({data}){

             if (data.results.total_count === 0) dispatch({type: 'Store Available Company Name'});
             else dispatch({type: 'Show Error Msg on Welcome Board', title: "Sorry! " + compName + " has used in " + jurisdictionName + ".", msg: "Please Enter Another Company Name."});
            
             closeLoading();
            
         }).catch(function(resp){
             dispatch({type: 'Show Error Msg on Welcome Board', title: "Sorry, Please try again later.", msg: "Ooooops, Service is busy now."});
             closeLoading();
         });
        //setTimeout(() => {
        //    dispatch({type: 'Store Available Company Name'});
        //    closeLoading();
        //}, 1000);
    }

    const clickNextHandler = (e) => {
        if(availableName) dispatch({ type: "Welcome Board Go To Step N", N: 1 });
    }

    const clickBackHandler = (e) => {
        dispatch({ type: "Resume Welcome Board" });
    }

    const CheckNameForm = () => (
        <div>
            <div style={{minHeight: '200px'}}>
            <Input 
                type='text' 
                className="checkname-input-container" 
                labelPosition='right' 
                id="check_name"
                defaultValue={selectedCompanyName}
                placeholder='Search...'
                onChange={handleInputChange}
            >
                <input className="placeholder" />
                <Label basic>&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;LLC&nbsp;&nbsp;&nbsp;&nbsp;|
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Dropdown
                        placeholder={jurisdictionName}
                        inline
                        onChange={handleJurisdictionChange}
                        options={jurisdictionOptions}
                        defaultValue={jurisdictionSelected}
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                </Label>
            </Input>
            <Message negative style={{display: "none"}}>
                <Message.Header>Sorry! This name has been used.</Message.Header>
                <p>Please Enter Another Company Name.</p>
            </Message>
            <Message negative style={{display: "none"}}>
                <Message.Header>Sorry! Please try again later.</Message.Header>
                <p>Search API service is busy.</p>
            </Message>
            <p className="normal-text">Enter your company name exactly as you want it registered.</p>
            <p className="normal-text">Click <b>`Check`</b> to verify if your preferred name is available.</p>
            <p className="normal-text">Click <b>`My Dashboard`</b> if you want to manage your deployed LCCs.</p>
            </div>
            <p className="align-right">
                <Button id="btn-check-nmae" className="primary" type="submit" onClick={clickDashboardHandler}>My Dashboard</Button>
                <Button id="btn-check-nmae" className="primary" type="submit" onClick={clickCheckHandler}>Check</Button>
            </p>
        </div>
    )

    const AvailableResult = () => (
        <div>
            <div style={{minHeight: '200px'}}>
                <p className="normal-text">Congrats! <b>{availableName}</b> is available for registration with <b>{jurisdictionName}</b> State Registry.</p>
                <p className="normal-text"><b>{availableName}</b>  will have its registered address at: <br/> <b>{jurisdictionStreet[jurisdictionSelected]}</b></p>
                <p className="normal-text">Click `<b>Next</b>` to proceed or go `Back` to try a different name.</p>
            </div>
            <p className="align-right">
                <Button id="btn-check-nmae" className="primary" onClick={clickBackHandler}>Back</Button>
                <Button id="btn-check-nmae" className="primary" onClick={clickNextHandler}>Next</Button>
            </p>
        </div>
    )

    const CheckNamePanel = () => {

        if(availableName === "") return <CheckNameForm />;

        return <AvailableResult />;
    }

    return (
        <CheckNamePanel />
    );
    
}
