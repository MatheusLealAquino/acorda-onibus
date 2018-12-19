<template>
    <div class="here-map">
        <div ref="map" v-bind:style="{ width: width, height: height }"></div>
    </div>
</template>

<script>

/* function addDraggableMarker (map, marker, behavior) {
  // disable the default draggability of the underlying map
  // when starting to drag a marker object:

  map.addEventListener('dragstart', function (ev) {
    var target = ev.target
    // eslint-disable-next-line
    if (target instanceof H.map.Marker) {
      behavior.disable()
    }
  }, false)

  // re-enable the default draggability of the underlying map
  // when dragging has completed
  map.addEventListener('dragend', function (ev) {
    var target = ev.target
    // eslint-disable-next-line
    if (target instanceof mapsjs.map.Marker) {
      behavior.enable()
    }
  }, false)

  // Listen to the drag event and move the position of the marker
  // as necessary
  map.addEventListener('drag', function (ev) {
    var target = ev.target, pointer = ev.currentPointer
    // eslint-disable-next-line
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
      ui: {}
    }
  },
  props: {
    appId: String,
    appCode: String,
    lat: String,
    lng: String,
    width: String,
    height: String
  },
  created () {
    // eslint-disable-next-line
    this.platform = new H.service.Platform({
      'app_id': this.appId,
      'app_code': this.appCode,
      useHTTPS: true
    })
  },
  mounted () {
    // eslint-disable-next-line
    this.map = new H.Map(
      this.$refs.map,
      this.platform.createDefaultLayers().normal.map,
      {
        zoom: 15,
        center: { lng: this.lng, lat: this.lat }
      }
    )
    // eslint-disable-next-line
    this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map))
    // eslint-disable-next-line
    this.ui = H.ui.UI.createDefault(this.map, this.platform.createDefaultLayers())
    // eslint-disable-next-line
    let marker = new H.map.Marker({lat:this.lat, lng:this.lng})
    marker.draggable = true
    // eslint-disable-next-line
    this.map.addObject(marker)
    // eslint-disable-next-line
    // addDraggableMarker(this.map, marker, this.behavior)
  }
}
</script>
