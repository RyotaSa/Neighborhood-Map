// Initial position of the map
var map;
function initMap() {
    var initPlace = {lat: 35.69730365157654, lng: 139.8259416299095};
    map = new google.maps.Map(document.getElementById('map'), {
        center: initPlace,
        zoom: 13,
    });
    ko.applyBindings(new ViewModel());
}

// Googlemap Error handling
// function mapError() {
//     document.getElementById("map").innerHTML = "<h3>Sorry, Google Maps is not working.</h3>";
//     // console.log("Google maps error.");
// }

function mapError(){
    alert("Sorry, Google Maps is not working.");
}

// Locations where show some spots
var locations = [
    {
        name: "Oshima",
        lat: 35.6795574,
        lng: 139.8695606,
        id: "518f16fb498e4ddbcf6657b6"
    },
    {
        name: "Taisho-ken",
        lat: 35.661018,
        lng: 139.87327490000007,
        id: "4f641d41e4b0fd165c6efd9d"
    },
    {
        name: "Haru",
        lat: 35.7197537,
        lng: 139.78332269999999,
        id: "500fc84de4b017f65b09e070"
    },
    {
        name: "卍riki",
        lat: 35.6658611,
        lng: 139.8579757,
        id: "536a2163498e28609368ee25"
    },
    {
        name: "Chibakiya",
        lat: 35.6623187,
        lng: 139.87532699999997,
        id: "4ba6f387f964a520787939e3"
    },
    {
        name: "Tsukiji-Ebikin",
        lat: 35.6639707,
        lng: 139.77155879999998,
        id: "52f297b4498e89209b290587"
    },
    {
        name: "Mengyo",
        lat: 35.6942232,
        lng: 139.81182680000006,
        id: "568a04de498e9126623aef95"
    },
    {
        name: "Kyushu-Jyangara",
        lat: 35.7008024,
        lng: 139.7706495,
        id: "4b5d29e9f964a5202e5529e3"
    }
];

// Accessing data outside an Ajax request
var Place = function (data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.id = ko.observable(data.id);
    this.marker = ko.observable();
    this.phone = ko.observable('');
    this.address = ko.observable('');
    this.rating = ko.observable('');
    this.url = ko.observable('');
    this.canonicalUrl = ko.observable('');
    this.photoPrefix = ko.observable('');
    this.photoSuffix = ko.observable('');
    this.contentString = ko.observable('');
};

// Show the associated markers on the map
var ViewModel = function () {
    var self = this;
    this.placeLists = ko.observableArray([]);
    locations.forEach(function (placeItem) {
        self.placeLists.push(new Place(placeItem));
    });

    var infowindow = new google.maps.InfoWindow({
        maxWidth: 200,
    });

    var marker;
    self.placeLists().forEach(function (placeItem) {

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        placeItem.marker = marker;

        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + placeItem.id() +
            '?client_id=C4YPVCLZE5W45XLJP5GGJ0VRWNVRJ1SL1M1XSNOJOVMVGER1&client_secret=PFSKVCGP0P4LBEAJEKIV0EYB3OBVX0CXX1NTGIAFGONMQCEG&v=20180218',
            dataType: "json",
            success: function (data) {
                var result = data.response.venue;

                var contact = result.hasOwnProperty('contact') ? result.contact : '';
                if (contact.hasOwnProperty('formattedPhone')) {
                    placeItem.phone(contact.formattedPhone || '');
                }

                var location = result.hasOwnProperty('location') ? result.location : '';
                if (location.hasOwnProperty('address')) {
                    placeItem.address(location.address || '');
                }

                var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
                if (bestPhoto.hasOwnProperty('prefix')) {
                    placeItem.photoPrefix(bestPhoto.prefix || '');
                }

                if (bestPhoto.hasOwnProperty('suffix')) {
                    placeItem.photoSuffix(bestPhoto.suffix || '');
                }

                var rating = result.hasOwnProperty('rating') ? result.rating : '';
                placeItem.rating(rating || 'none');

                var url = result.hasOwnProperty('url') ? result.url : '';
                placeItem.url(url || '');

                placeItem.canonicalUrl(result.canonicalUrl);

                var contentString = '<div id="iWindow"><h5>' + placeItem.name() + '</h5><div id="pic"><img src="' +
                        placeItem.photoPrefix() + '110x110' + placeItem.photoSuffix() +
                        '" alt="Image Location"></div><p>Information from Foursquare:</p><p>' +
                        placeItem.phone() + '</p><p>' + placeItem.address() + '</p><p>Rating: ' + placeItem.rating() +
                        '</p><p><a href=' + placeItem.url() + '>' + placeItem.url() +
                        '</a></p><p><a target="_blank" href=' + placeItem.canonicalUrl() +
                        '>Foursquare Page</a></p><p><a target="_blank" href=https://www.google.com/maps/dir/Current+Location/' +
                        placeItem.lat() + ',' + placeItem.lng() + '>Directions</a></p></div>';

                google.maps.event.addListener(placeItem.marker, 'click', function () {
                    infowindow.open(map, this);
                    placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        placeItem.marker.setAnimation(null);
                    }, 500);
                    infowindow.setContent(contentString);
                    map.setCenter(placeItem.marker.getPosition());
                });
            },
            error: function (e) {
                infowindow.setContent('<h5 style=" color: red; ">Foursquare data is unavailable. Please try refreshing later.</h5>');
            }
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, this);
            placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                placeItem.marker.setAnimation(null);
            }, 500);
        });
    });

    self.showInfo = function (placeItem) {
        google.maps.event.trigger(placeItem.marker, 'click');
        self.hideElements();
    };

    self.toggleNav = ko.observable(false);
    this.navStatus = ko.pureComputed (function () {
        return self.toggleNav() === false ? 'nav' : 'navClosed';
        }, this);

    self.hideElements = function (toggleNav) {
        self.toggleNav(true);
        return true;
    };

    self.showElements = function (toggleNav) {
        self.toggleNav(false);
        return true;
    };
    self.visible = ko.observableArray();
    self.placeLists().forEach(function (place) {
        self.visible.push(place);
    });

    self.userInput = ko.observable('');
    //  Show each place on the list
    self.filterMarkers = function () {
        var searchInput = self.userInput().toLowerCase();
        self.visible.removeAll();
        self.placeLists().forEach(function (place) {
            place.marker.setVisible(false);
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                self.visible.push(place);
            }
        });
        self.visible().forEach(function (place) {
            place.marker.setVisible(true);
        });
    };

};