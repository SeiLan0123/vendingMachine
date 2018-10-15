window.onload = function () {
  var mapDiv = document.getElementById("map-canvas");

  map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(35.9, 136.35),
    zoom: 13,
  });

  if (navigator.geolocation) {
    this.navigator.geolocation.watchPosition(success, error);
  }
  else {
    alert("位置情報が取得できません");
  }

  var query = ` prefix  geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
        prefix jrrk: <http://purl.org/jrrk#>
        prefix schema: <http://schema.org/>
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        prefix odp:             <http://odp.jig.jp/odp/1.0#>
        prefix ic:              <http://imi.go.jp/ns/core/rdf#>

        select distinct ?lat ?lng ?label ?co { ?s a odp:VendingMachine;
        odp:location ?label;
        geo:lat ?lat;
        geo:long ?lng.
        optional{?s odp:classified[odp:brand[rdfs:label ?co]].} } limit 1000
    `;


  var endpointSparql = "https://sparql.odp.jig.jp/api/v1/sparql";


  querySparql(endpointSparql, query, function (data) {
    console.log(data);

    var items = data.results.bindings;
    var spotCounter = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];

      var lat = item.lat.value;
      var lng = item.lng.value;
      var label = item.label.value;
      var brand = item.co ? item.co.value : "";
      console.log(brand)

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        icon: {
          url: "images/orange.png",
          size: new google.maps.Size(100, 100),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(15, 15),
        },
        map: map
      });
      marker.item = item;
      google.maps.event.addListener(marker, "click", function (e) {
        text.innerHTML = this.item.label.value + "<p>";
        text.innerHTML += this.item.co ? this.item.co.value : "";
        text.innerHTML += "</p>";

        map.panTo(this.getPosition());
      });

    }

  });

};
var create = function (tag) {
  var res = document.createElement(tag);
  return res;
};

var querySparql = function (baseurl, q, callback) {
  var url = baseurl + "?query=" + encodeURIComponent(q) + "&output=json" + "&callback=" + getCallbackMethod(callback);
  jsonp(url);
};
var getCallbackMethod = function (callback) {
  var scallback = "_cb_" + (Math.random() * 1000000 >> 0);
  window[scallback] = function (data) {
    window[scallback] = null;
    callback(data);
  };
  return scallback;
};

var jsonp = function (url) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.setAttribute("src", url);
  script.setAttribute("type", "text/javascript");
  head.appendChild(script);
};
function abs(val) {
  return val < 0 ? -val : val;
};

var currentPos = function () {
  //alert("genzaichi")
  map.panTo(currentPosition);
}

var success = function (position) {
  var data = position.coords;
  console.log(data);
  var lat = data.latitude;
  var lng = data.longitude;
  currentPosition = new google.maps.LatLng(lat, lng);


}

var error = function () {
  console.log("errors");
}
var map;
