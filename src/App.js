import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import axios from 'axios';

const UserPoolId = 'xxx';
const ClientId = 'yyy';
const ApiGatewayUrl = 'zzz';

const userPool = new CognitoUserPool({
  UserPoolId: UserPoolId,
  ClientId: ClientId,
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      accessToken: '',
      isAuthenticated: false,
      isLoginFailed: false,
    };
  };

  // is used by both login and password reset
  onSuccess = (result) => {
    console.log("onSuccess");
    console.log(result);
    this.setState({
      accessToken: result.idToken.jwtToken, // the token used for subsequent, authorized requests
      isAuthenticated: true,
      isLoginFailed: false,
    });
  };

  // is used by both login and password reset
  onFailure = (error) => {
    console.log("onFailure");
    console.log(error);
    this.setState({
      isAuthenticated: false,
      isLoginFailed: true,
      statusCode: '',
    });
  };

  onSubmit = (event) => {
    event.preventDefault();

    let cognitoUser = new CognitoUser({
      Username: this.state.username,
      Pool: userPool,
    });

    const authenticationDetails = new AuthenticationDetails({
      Username: this.state.username,
      Password: this.state.password,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: this.onSuccess,
        onFailure: this.onFailure,
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          console.log("newPasswordRequired");
          console.log(userAttributes);

          // not interesting for this demo - add a bogus e-mail and append an X to the initial password
          userAttributes['email'] = 'justtesting@email.com';
          cognitoUser.completeNewPasswordChallenge(this.state.password + 'X', userAttributes, this);
        },
    });
  };

  onDrop = (files) => {

    // first get the pre-signed URL
    axios.get(ApiGatewayUrl, {headers: {Authorization: this.state.accessToken}}).then((response) => {

      // now do a PUT request to the pre-signed URL
      axios.put(response.data, files[0]).then((response) => {
        this.setState({
          statusCode: response.status,
        });
      });
    });
  };

  render() {
    return (
      <div>
        <h1>Login to upload files</h1>
        <form onSubmit={this.onSubmit}>
          <input type='text' value={this.state.username} onChange={(event) => this.setState({username: event.target.value})} placeholder='username' /><br />
          <input type='password' value={this.state.password} onChange={(event) => this.setState({password: event.target.value})} placeholder='password' /><br />
          <input type='submit' value='Login' />
        </form>
        <p style={{color: 'red', display: this.state.isLoginFailed ? 'block' : 'none'}}>Credentials incorrect</p>
        <div style={{display: this.state.isAuthenticated ? 'block' : 'none'}}>
          <Dropzone onDrop={this.onDrop}>
            <p>Drop your files here or click to select one.</p>
          </Dropzone>
          <p>Status Code: {this.state.statusCode}</p>
        </div>
      </div>
    );
  };
};
