import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import LinkedInImageDefault from './signin_with_linkedin-buttons/Non-Retina/Sign-in-Large---Default.png';
import LinkedInImageHover from './signin_with_linkedin-buttons/Non-Retina/Sign-in-Large---Hover.png';

const LinkedIn = props => {
  const { hover, toggleButton, login } = props;

  return (
    <div>
      <div>
        <img 
          onClick={login}
          className="linkedin__button-hover"
          onMouseOver={toggleButton}
          onMouseLeave={toggleButton}
          src={!hover? LinkedInImageDefault : LinkedInImageHover}
          title="login with linkedin" 
          alt="login with linkedin"
         />
      </div>
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
      profile: null,
      hover: false,
    }

    // bind
    this.toggleButton = this.toggleButton.bind(this);
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

  toggleButton() {
    this.setState(prevState => {
      return {
        hover: !prevState.hover
      };
    });
  }

  login() {
    axios({
      url: '/login',
      method: 'GET',
    })
      .then(res => {
        console.log('response ', res)
        if(res.error) throw 'error fetching profile info';

        this.fetchProfileInfo(res.data.state, res.data.redirect_uri)
      })
      .catch(err => {
        console.log('error ', err)
      })
  }

  fetchProfileInfo(state, redirect_uri) {
    window.location.href =`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=7852nj8xbs8dab&redirect_uri=${redirect_uri}&state=${state}&scope=r_basicprofile r_emailaddress`
  }

  render() {
    return (
      <div className="App">
        <LinkedIn
          login={() => this.login()}
          hover={this.state.hover}
          toggleButton={this.toggleButton}
        />

        <Profile 
          userInfo={this.state.profile}
        />
      </div>
    );
  }
}

export default App;
