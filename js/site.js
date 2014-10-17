function init() {
	var map = L.map('map').setView([0, 0], 5);
	L.tileLayer('http://{s}.tiles.mapbox.com/v3/examples.map-zr0njcqy/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18
	}).addTo(map);

	L.geoJson(geojson, {
    onEachFeature: onEachFeature
  }).addTo(map);

  function onEachFeature(feature, layer) {
    var caseStudy = feature.properties;
    if(feature.properties) {

      // create chapter list
      var list = document.getElementById('chapter-list');
      var chap = caseStudy.chapter,
          title = caseStudy.name,
          desc = caseStudy.description;
      var item = document.createElement('li');
      item.id=title;
      item.className='chapter';
      item.innerHTML='<h1>'+title+'</h1><h3>Chapter '+chap+'</h3><p>'+desc+'</p>';
      list.appendChild(item);

      // marker click event for showing chapter in sidebar
      layer.on('click', function(layer){
        chapterID = feature.properties.name;
        // scroll to chapter id
        var chapterTop = $('#'+chapterID).offset().top;
        console.log(chapterTop);
        $("#toc").animate({
          scrollTop: chapterTop
        }, 500); // you can set any time here
      });
    }
  }

  $('body').on('click', '.chapter', function(){
    id = $(this).attr('id');
    map.eachLayer(function(m) {
      var l = m._layers;
      if(l) {
        for(var key in l) {
          mid=l[key].feature.properties.name;
          if(mid==id) {
            map.panTo(l[key]._latlng);
          }
        }
      }
    });
  });

  var chapterInfo = [], // array of objects, one for each chapter
      fromTop = 0, // start at zero on page load
      current; // used for running map view update only if not current

  // create chapterInfo array with information to use later
  $.each($('#chapter-list li'), function(key, val){ 
    var h = $(val).outerHeight(); // includes padding, if margin is needed add "true" to parameters
    chapInfo = {
      'elem': val,
      'name': $(val).attr('id'),
      'height': h,
      'fromTop': fromTop
    };
    chapterInfo.push(chapInfo); // push to chapterInfo
    fromTop=fromTop+h; // update fromTop for next rendition to be relative to previous
  });

  $('#toc').scroll(function(e){
    var windowHeight = $(window).height();
    var top = $(this).scrollTop();
    // set threshold to be in the middle of window
    var threshold = top+(windowHeight/2);
    $.each(chapterInfo, function(key, val){
      if(threshold>val.fromTop && threshold<(val.fromTop+val.height)) {
        var id = $(val.elem).attr('id');
        map.eachLayer(function(m) {
          var l = m._layers;
          if(l) {
            for(var key in l) {
              mid=l[key].feature.properties.name;
              if(mid==id && id!==current) {
                updateMap(l[key]._latlng);
                current=id;
              }
            }
          }
        });
      }
    });
  });

  function updateMap(ll) {
    map.setView(ll, 5, true);
  }

}

window.onLoad = init();