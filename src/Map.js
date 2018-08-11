import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery';


export default class Map extends Component {
  state = {
    locations: [{
      name: 'Buckingham Fountain',
      location: {
          lat: 41.8757887,
          lng: -87.61897499999998
      }
  },
  {
      name: 'Soldier Field',
      location: {
          lat: 41.8622646,
          lng: -87.61663820000001
      }
  },
  {
      name: 'Shedd Aquarium',
      location: {
          lat: 41.8675569,
          lng: -87.61316110000001
      }
  },
  {
      name: 'Navy Pier',
      location: {
          lat: 41.8917065,
          lng: -87.60848069999997
      }
  },
  {
      name: 'Adler Planetarium',
      location: {
          lat: 41.8663303,
          lng: -87.60637209999999
      }
  }
  
 
],
    query: '',
    markers: [],
    currentContent: '',
    infowindow: new this.props.google.maps.InfoWindow(),
    highlightedIcon: null
  }

  componentDidMount() {
    this.loadMap()
    this.onclickLocation()
   
  }

  componentWillUpdate (nextProps, nextState) {
    //you'll see the changing state value in here
    // console.log('Your prev cont state: ' + this.state.currentContent);
    // console.log('Your next cont state: ' + nextState.currentContent);
}

  loadMap() {
    if (this.props && this.props.google) {
      const {google} = this.props
      const maps = google.maps

      const mapRef = this.refs.map
      const node = ReactDOM.findDOMNode(mapRef)

      const mapConfig = Object.assign({}, {
        center: {lat: 41.8795845, lng: -87.62371329999996},
        zoom: 15,
        mapTypeId: 'roadmap'
      })

      this.map = new maps.Map(node, mapConfig)
      this.addMarkers()
    }
  }

  onclickLocation = () => {
    const that = this
    const {infowindow} = this.state

    const displayInfowindow = (event) => {
      const {markers} = this.state
      const markerInd =
        markers.findIndex(marker => marker.title.toLowerCase() === event.target.innerText.toLowerCase())
      that.populateInfoWindow(markers[markerInd], infowindow)
    }
    document.querySelector('.locations-list').addEventListener('click', function (event) {
      if (event.target && event.target.nodeName === "LI") {
        displayInfowindow(event)
      }
    })
  }

  handleValueChange = (event) => {
    this.setState({query: event.target.value})
  }

  addMarkers = () => {
    const {google} = this.props
    let {infowindow} = this.state
    const bounds = new google.maps.LatLngBounds()

    this.state.locations.forEach((location, ind) => {
      const marker = new google.maps.Marker({
        position: {lat: location.location.lat, lng: location.location.lng},
        map: this.map,
        title: location.name
      })

      marker.addListener('click', () => {
        this.populateInfoWindow(marker, infowindow)
        this.toggleBounce(marker);
      })
      this.setState((state) => ({
        markers: [...state.markers, marker]
      }))
      bounds.extend(marker.position)
    })
    this.map.fitBounds(bounds)
  }

  callWikiAPI(infowindow, marker) {
    // var that = this;
    const URL = "https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=Belgium&limit=5"
    // const URL = `https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=${markerTitle}&format=json&callback=wikiCallback`
    console.log(URL)

    // fetch(URL).then(function(response){
    //   console.log(response);
    // }).then(function(data) {
    //   console.log(data);
    // });

    var wikiurl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
            marker.title + '&format=json&callback=wikiCallback';

        $.ajax({
            url: wikiurl,
            dataType: "jsonp",
            success: (response) => {
              // Get some info
              console.log(this)
              var markerWikiInfo = (response[2]);
              console.log(markerWikiInfo)
              this.setState({currentContent: markerWikiInfo[0]})
              infowindow.setContent(`<h3>${marker.title}</h3><h5>${this.state.currentContent}</h5>`)
              infowindow.open(this.map, marker)
              // Make sure the marker property is cleared if the infowindow is closed.
              infowindow.addListener('closeclick', function () {
                infowindow.marker = null
              })
          },
            error:(xhr, ajaxOptions, thrownError) => {
              alert(xhr.status);
              alert(thrownError);
          }
        });
  }

  populateInfoWindow = (marker, infowindow) => {
    const defaultIcon = marker.getIcon()
    const {highlightedIcon, markers} = this.state
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
      // reset the color of previous marker
      if (infowindow.marker) {
        const ind = markers.findIndex(marker => marker.title === infowindow.marker.title)
        markers[ind].setIcon(defaultIcon)
      }
      // change marker icon  of clicked marker
     
      infowindow.marker = marker
      this.callWikiAPI(infowindow, marker)
      
    }
  }

  toggleBounce(marker) {
    marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
    setTimeout(()=> {
      marker.setAnimation(null);
    },750)
  }

  render() {
    const {locations, query, markers, infowindow} = this.state
    if (query) {
      locations.forEach((l, i) => {
        if (l.name.toLowerCase().includes(query.toLowerCase())) {
          markers[i].setVisible(true)
        } else {
          if (infowindow.marker === markers[i]) {
            // close the info window if marker removed
            infowindow.close()
          }
          markers[i].setVisible(false)
        }
      })
    } else {
      locations.forEach((l, i) => {
        if (markers.length && markers[i]) {
          markers[i].setVisible(true)
        }
      })
    }
    return (
      <div>
        <div className="container">
          <div className="text-input">
            <input role="search" type='text'
                   value={this.state.value}
                   onChange={this.handleValueChange}/>
            <ul className="locations-list">{
              markers.filter(marker => marker.getVisible()).map((marker, i) =>
                (<li key={i} tabIndex={i + 1}>{marker.title}</li>))
            }</ul>
          </div>
          <div role="application" className="map" ref="map">
          </div>
        </div>
      </div>
    )
  }
}