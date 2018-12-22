<template>
  <q-page padding>

    <div class="row justify-center">
      <div class="col-md-12">
        <q-search icon="place" v-model="location" float-label="Onde devo te acordar?">
            <q-autocomplete
              separator
              @search="searchPlace"
              @selected="selected"
            />
        </q-search>
      </div>
      <div v-if="drawComponent" class="col-md-12">
        <div v-if="$q.platform.is.desktop">
          <HereMap appId='b1ohlJ28nDfyMW9AYATo'
            appCode='11WTT8oQltE8VNuMbzptnw'
            :lat="place.latitude.toString()"
            :lng="place.longitude.toString()"
            width='100%'
            height='300px' />
        </div>

        <div v-if="$q.platform.is.mobile">
          <HereMap appId='b1ohlJ28nDfyMW9AYATo'
            appCode='11WTT8oQltE8VNuMbzptnw'
            :lat="place.latitude.toString()"
            :lng="place.longitude.toString()"
            width='100vw'
            height='300px' />
        </div>
      </div>
    </div>

  </q-page>
</template>

<style>
</style>

<script>
import HereMap from '../components/HereMap.vue'

function createPlaces (items) {
  let places = []

  items.forEach(placeApi => {
    places.push({
      label: `${placeApi.title} - ${placeApi.vicinity}`,
      value: `${placeApi.title} - ${placeApi.vicinity}`.replace(new RegExp('<br/>', 'g'), ' - '),
      latitude: placeApi.position[0],
      longitude: placeApi.position[1]
    })
  })

  return places
}

export default {
  name: 'PageIndex',
  components: {
    HereMap
  },
  data () {
    return {
      location: '',
      place: '',
      drawComponent: false,
      actualLocation: ''
    }
  },
  methods: {
    searchPlace (terms, done) {
      this.$axios.get(`/`, { params: {at: '-9.2803,-57.8881', q: terms, app_id: 'b1ohlJ28nDfyMW9AYATo', app_code: '11WTT8oQltE8VNuMbzptnw'} })
        .then(response => {
          this.drawComponent = false
          done(createPlaces(response.data.results.items))
        })
    },
    selected (place) {
      this.place = place
      this.drawComponent = true
      if (typeof cordova !== 'undefined') {
        cordova.plugins.foregroundService.start('GPS Running', 'Background Service')
      }
    },
    successWatchPostion (pos) {
      let position = pos.coords
      let audio = new Audio('statics/audios/alarm1.mp3')
      audio.pause()

      if (this.place.latitude === position.latitude && this.place.longitude === position.longitude) {
        audio.play()
        navigator.geolocation.clearWatch(this.actualLocation)
        if (typeof cordova !== 'undefined') {
          cordova.plugins.foregroundService.stop()
        }
      }
    },
    error (err) {
      console.warn('ERRO(' + err.code + '): ' + err.message)
    }
  },
  mounted () {
    let options = {
      enableHighAccuracy: true,
      timeout: 3000,
      maximumAge: 0
    }

    this.actualLocation = navigator.geolocation.watchPosition(this.successWatchPostion, this.error, options)
  }
}
</script>
