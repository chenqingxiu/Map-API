//....................View...................
var map;
var markers = [];
var placeMarkers = [];

// 创建地图
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 24.474382, lng: 118.094345},
    zoom: 12,
    mapTypeControl: false
  });

  // 定义默认显示的地点
  var locations = [
    {title: '厦大白城', address: '厦门市思明区白城海滨', location: {lat: 24.431316, lng: 118.105921}},
    {title: '鼓浪屿', address: '厦门市思明区鼓浪屿', location: {lat: 24.444903, lng: 118.070708}},
    {title: '集美学村', address: '厦门市集美区', location: {lat: 24.577778, lng: 118.096104}},
    {title: '火山公园', address: '漳州市漳浦县前亭镇', location: {lat: 24.317455, lng: 118.012103}},
    {title: '东山岛', address: '漳州市东山县', location: {lat: 23.701262, lng: 117.430061}},
    {title: '南靖土楼', address: '漳州市南靖县书洋镇', location: {lat: 24.627268, lng: 117.110287}},
    {title: '开元寺', address: '泉州市西街176号', location: {lat: 24.913104, lng: 118.586314}},
    {title: '清源山', address: '泉州市丰泽区', location: {lat: 24.954023, lng: 118.607567 }},
    {title: '崇武古城', address: '泉州市惠安县', location: {lat: 24.874358, lng: 118.930575}},
  ];

  // 定义标记样式
  var defaultIcon = makeMarkerIcon('09f');
  var highlightedIcon = makeMarkerIcon('FF3');

  // 引用地点信息创建标记
  for (var i = 0; i < locations.length; i++) {
    // 获取坐标
    var position = locations[i].location;
    var title = locations[i].title;
    var address = locations[i].address;
    // 创建标记
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      address: address,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // 将标记数组markers中
    markers.push(marker);
    // 点击标记弹出信息窗口
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // 鼠标移进移出时变换标记颜色
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  // 显示所有标记
  showListings();

  // 创建信息窗口
  var largeInfowindow = new google.maps.InfoWindow();

  // 创建搜索输入框
  var searchBox = new google.maps.places.SearchBox(
      document.getElementById('places-search'));
  searchBox.setBounds(map.getBounds());
}

// 无法加载时提示错误
function mapErrorHandler(){
  alert("failed to get google map");
}

// 点击标记显示具体地址
function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    // 清空信息窗口的内容
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    // 设置点击标记时的窗口内容
    infowindow.setContent('<div>' + marker.title + '</div>' +
          '<div>' + marker.address + '</div>');
    infowindow.open(map, marker);
  }
}

// 在地图上显示标记
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  var starItem;
  var endItem;
//根据不同城市显示标记
  switch(selectCity.selectedIndex){
    case 0:
    starItem = 0;
    endItem = markers.length;
    break;
    case 1:
    starItem = 0;
    endItem = 3;
    break;
    case 2:
    starItem = 3;
    endItem = 6;
    break;
    default:
    starItem = 6;
    endItem = markers.length;
  }
  for (var i = starItem; i < endItem; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// 隐藏标记
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
};

// 定义标记样式
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// 点击"go"执行搜索
function textSearchPlaces() {
  var bounds = map.getBounds();
  hideMarkers(markers);
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
    query: document.getElementById('places-search').value,
    bounds: bounds
  },function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    }
  });
}

// 为搜索结果创建标记
function createMarkersForPlaces(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.place_id
    });
    // 点击标记显示窗口信息
    var placeInfoWindow = new google.maps.InfoWindow();
    marker.addListener('click', function() {
      if (placeInfoWindow.marker == this) {
        console.log("This infowindow already is on this marker!");
      } else {
        getPlacesDetails(this, placeInfoWindow);
      }
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}

//为标记的信息窗口获取信息
function getPlacesDetails(marker, infowindow) {
      var service = new google.maps.places.PlacesService(map);
      service.getDetails({
        placeId: marker.id
      }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          infowindow.marker = marker;
          var innerHTML = '<div>';
          if (place.name) {
            innerHTML += '<strong>' + place.name + '</strong>';
          }
          if (place.formatted_address) {
            innerHTML += '<br>' + place.formatted_address;
          }
          if (place.formatted_phone_number) {
            innerHTML += '<br>' + place.formatted_phone_number;
          }
          if (place.opening_hours) {
            innerHTML += '<br><br><strong>Hours:</strong><br>' +
                place.opening_hours.weekday_text[0] + '<br>' +
                place.opening_hours.weekday_text[1] + '<br>' +
                place.opening_hours.weekday_text[2] + '<br>' +
                place.opening_hours.weekday_text[3] + '<br>' +
                place.opening_hours.weekday_text[4] + '<br>' +
                place.opening_hours.weekday_text[5] + '<br>' +
                place.opening_hours.weekday_text[6];
          }
          if (place.photos) {
            innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
          }
          innerHTML += '</div>';
          infowindow.setContent(innerHTML);
          infowindow.open(map, marker);
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      });
    }

//....................ViewModel开始...................
var selectCity = document.getElementById('select-city');
var wikiElem = document.getElementById('wikipedia-links');
var wikiArray = [];

var viewModel = ({
// 建立各城市热点列表
  xmHotList: [
    {name:'厦大白城', id:0},
    {name:'鼓浪屿', id:1},
    {name:'集美学村', id:2},
  ],
  zzHotList: [
    {name:'火山公园', id:3},
    {name:'东山岛', id:4},
    {name:'南靖土楼', id:5},
  ],
  qzHotList: [
    {name:'开元寺', id:6},
    {name:'清源山', id:7},
    {name:'崇武古城', id:8},
  ],
  // 监测城市切换的操作
  xmItem: ko.observable(true),
  zzItem: ko.observable(true),
  qzItem: ko.observable(true),
  link: ko.observableArray(wikiArray),
  // 点击列表后，隐藏已存在的标记，新添加列表地点对应的标记
  showClickMarker: function() {
    hideMarkers(markers);
    markers[this.id].setMap(map);
  },
// 选择城市后呈现对应的列表、标记，并显示维基查询结果
  changeMarker: function(){
    hideMarkers(markers);
    showListings();
    wikiFun();
    viewModel.xmItem(selectCity.selectedIndex==1 || selectCity.selectedIndex==0);
    viewModel.zzItem(selectCity.selectedIndex==2 || selectCity.selectedIndex==0);
    viewModel.qzItem(selectCity.selectedIndex==3 || selectCity.selectedIndex==0);
  }
});

//绑定
ko.applyBindings(viewModel);

//实现维基百科查询及显示结果
function wikiFun(){
  wikiElem.innerHTML = "";
  var cityStr = selectCity.options[selectCity.selectedIndex].value;
  var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityStr + '&format=json&callback=wikiCallback';
  // 数据出错时出现提示s
  var wikiRequestTimeout = setTimeout(function(){
    alert("failed to get wikipedia resources");
  }, 10000);
  // AJAX，实现维基百科搜索
  $.ajax({
    url:wikiUrl,
    dataType:"jsonp",
    success:function(response){
      var articleList = response[1];
      wikiArray = [];
      for (var i = 0; i < 5; i++){
        articleStr = articleList[i];
        wikiArray.push({name:'http://en.wikipedia.org/wiki/' + articleStr, titles:articleStr});
      };
      // 清除用于提示错误的定时器
      clearTimeout(wikiRequestTimeout);
      // 显示维基百科返回的查询结果
      viewModel.link(wikiArray);
    }
  });
}
