<template>
    <div class="here-map">
        <div ref="map" v-bind:style="{ width: width, height: height }"></div>
    </div>
</template>

<script>
/* eslint-disable */

/* function addDraggableMarker (map, marker, behavior) {
  // disable the default draggability of the underlying map
  // when starting to drag a marker object:

  map.addEventListener('dragstart', function (ev) {
    var target = ev.target
    if (target instanceof H.map.Marker) {
      behavior.disable()
    }
  }, false)

  // re-enable the default draggability of the underlying map
  // when dragging has completed
  map.addEventListener('dragend', function (ev) {
    var target = ev.target
    if (target instanceof mapsjs.map.Marker) {
      behavior.enable()
    }
  }, false)

  // Listen to the drag event and move the position of the marker
  // as necessary
  map.addEventListener('drag', function (ev) {
    var target = ev.target, pointer = ev.currentPointer
    if (target instanceof mapsjs.map.Marker) {
      target.setPosition(map.screenToGeo(pointer.viewportX, pointer.viewportY))
    }
  }, false)
} */

export default {
  name: 'HereMap',
  data () {
    return {
      map: {},
      platform: {},
      behavior: {},
      ui: {},
      circle: {},
      clusteringLayer: {}
    }
  },
  props: {
    appId: String,
    appCode: String,
    lat: String,
    lng: String,
    width: String,
    height: String,
    range: Number,
    actualLocation: Object
  },
  methods: {
    initializeMap (){
      this.map = new H.Map(
        this.$refs.map,
        this.platform.createDefaultLayers().normal.map,
        {
          zoom: 17,
          center: { lng: this.lng, lat: this.lat }
        }
      )
    },
    addMarker () {
      this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map))
      this.ui = H.ui.UI.createDefault(this.map, this.platform.createDefaultLayers())
      let marker = new H.map.Marker({lat:this.lat, lng:this.lng})
      marker.draggable = true
      this.map.addObject(marker)
    },
    createCircle () {
      let circle = new H.map.Circle(
        // The central point of the circle
        {lat:this.lat, lng:this.lng},
        // The radius of the circle in meters
        this.range,
        {
          style: {
            strokeColor: 'rgba(55, 85, 170, 0.6)', // Color of the perimeter
            lineWidth: 2,
            fillColor: 'rgba(0, 128, 0, 0.7)'  // Color of the circle
          }
        }
      )
      return circle
    },
    addRangeCircle (circle) {
      this.map.addObject(circle)
    },
    updateRangeCircle (circle) {
      this.map.removeObject(this.circle)
      this.map.addObject(circle)
      this.circle = circle
    },
    addCluesteredDataProvider (latitude, longitude) {
      let dataPoints = [new H.clustering.DataPoint(latitude, longitude)]
      let clusteredDataProvider = new H.clustering.Provider(dataPoints, {
        clusteringOptions: {
          eps: 32,
          minWeight: 2
        }
      })
      this.clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider)
      this.map.addLayer(this.clusteringLayer)
    },
    updateClusteredDataProvider (latitude, longitude) {
      this.map.removeLayer(this.clusteringLayer)
      this.addCluesteredDataProvider(latitude, longitude)
    }
  },
  watch: {
    range: function (newVal, oldVal) {
      this.range = newVal
      this.updateRangeCircle (this.createCircle())
    },
    actualLocation: {
      handler (newVal) {
        this.actualLocation.latitude = newVal.latitude
        this.actualLocation.longitude = newVal.longitude 
        this.updateClusteredDataProvider(newVal.latitude, newVal.longitude)
      },
      deep: true
    }
  },
  created () {
    this.platform = new H.service.Platform({
      'app_id': this.appId,
      'app_code': this.appCode,
      useHTTPS: true
    })
  },
  mounted () {
    this.initializeMap()
    this.addMarker()
    this.circle = this.createCircle();
    this.addRangeCircle(this.circle)
    if(this.actualLocation.latitude !=0 && this.actualLocation.longitude != 0)
    this.addCluesteredDataProvider(this.actualLocation.latitude, this.actualLocation.longitude)
    // addDraggableMarker(this.map, marker, this.behavior)
  }
}
</script>
