import React, { Component } from 'react';
import { GoogleApiWrapper} from 'google-maps-react'
import './App.css';
import Map from './Map' 


class App extends Component {
  
  componentDidMount() {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    }
  }


  render() {                                                
    return (
      <div>
        <a className="menu" tabIndex='0'>
          
        </a>
        <h1 className="heading"> Chicago, Illinois </h1>        
        <Map google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey:"AIzaSyAtHersR4kaAxoEbnXFyGEUCETK0os9Ql8"
})(App)      
        
        
        
