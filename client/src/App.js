import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

const LinkedIn = props => {
  return (
    <div>
      <div onClick={props.login}>Login with linkedIn</div>
    </div>
  )
}

const Profile = props => {
  const {userInfo} = props;
  if(!userInfo) return null;

  console.log(userInfo)
  const { emailAddress, firstName, lastName, location, pictureUrl }  = userInfo;
  return (
    <div>
      <div>{firstName}</div>
      <div>{lastName}</div>
      <img src={pictureUrl} />
      <div>{emailAddress}</div>
    </div>
  )
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      profile: null
    }
  }
  componentDidMount() {
    axios({
      url: '/login?profile=true',
      method: 'GET'
    })
      .then(res => {
        console.l
        this.setState({
          profile: res.data.profile
        })
      })
      .catch(err => {
        this.setState({
          err
        })
      })
  }

  login() {
    axios({
      url: '/login',
      method: 'GET',
    })
      .then(res => {
        console.log('response ', res)
        if(res.error) throw 'error fetching profile info';
        this.fetchProfileInfo(res.data.state)
      })
      .catch(err => {
        console.log('error ', err)
      })
  }

  fetchProfileInfo(state) {
    window.location.href =`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=7852nj8xbs8dab&redirect_uri=http://localhost:8080/auth/linkedin/callback&state=${state}&scope=r_basicprofile r_emailaddress`
  }

  render() {
    return (
      <div className="App">
        <LinkedIn
          login={() => this.login()}
        />

        <Profile 
          userInfo={this.state.profile}
        />
      </div>
    );
  }
}

export default App;
