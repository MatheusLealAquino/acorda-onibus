<template>
  <q-page>
    <div class="row justify-center">
      <div class="col-md-12 q-pr-xl q-pl-xl q-pt-md">
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
            :range="rangeLocation"
            :actualLocation="actualLocation"
            width='100%'
            height='300px' />
        </div>

        <div v-if="$q.platform.is.mobile">
          <HereMap appId='b1ohlJ28nDfyMW9AYATo'
            appCode='11WTT8oQltE8VNuMbzptnw'
            :lat="place.latitude.toString()"
            :lng="place.longitude.toString()"
            :range="rangeLocation"
            :actualLocation="actualLocation"
            width='100vw'
            height='200px' />
        </div>
      </div>
    </div>

    <div class="row q-pt-sm justify-center" v-if="drawComponent">
      <div class="col-md-12 q-pr-md q-pl-sm">
        <q-field
          icon="map"
          label="Distância em metros da área de detecção"
          helper="Distância anterior ao ponto desejado para iniciar alarme"
        >
          <q-slider v-model="rangeLocation" ref="rangeLocation" :min="40" :max="250" label-always color="faded"/>
        </q-field>
      </div>

      <div class="q-pt-md q-pb-sm"> <q-btn icon="add_location" label="Iniciar Viagem" @click="beginTravel" /> </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import HereMap from '../components/HereMap.vue'
import mapHelper from '../helper/mapHelper.js'

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
      place: {latitude: 0, longitude: 0},
      actualLocation: {latitude: 0, longitude: 0},
      drawComponent: false,
      rangeLocation: 50,
      locationObject: undefined,
      playAudio: true
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
      if (this.locationObject !== undefined) {
        navigator.geolocation.clearWatch(this.locationObject)
      }
    },
    successWatchPostion (pos) {
      let position = pos.coords
      this.actualLocation.latitude = position.latitude
      this.actualLocation.longitude = position.longitude
      // Get distance between destine and actual localtion
      let distance = mapHelper.mapHelper.distance(position.latitude, this.place.latitude, position.longitude, this.place.longitude)
      // Initialize audio object
      let audio = new Audio('statics/audios/alarm1.mp3')
      audio.pause()
      // Verify if is in range and audio is not playing
      if (distance <= this.rangeLocation && this.playAudio) {
        audio.play()
        this.playAudio = false

        if (this.$q.platform.is.cordova) {
          navigator.vibrate(5000)
          navigator.notification.confirm('Desativar alarme ?', buttonIndex => {
            if (buttonIndex === 1) {
              this.playAudio = true
              audio.pause()
              navigator.vibrate(0)
              cordova.plugins.foregroundService.stop()
              navigator.geolocation.clearWatch(this.locationObject)
            }
          }, 'Finalizar alarme', ['Sim', 'Não'])
        } else {
          this.playAudio = true
          navigator.geolocation.clearWatch(this.locationObject)
        }
      }
    },
    error (err) {
      console.warn('ERRO(' + err.code + '): ' + err.message)
    },
    beginTravel () {
      if (this.$q.platform.is.cordova) {
        cordova.plugins.foregroundService.start('GPS Running', 'Background Service', 'departure_board')
      }
      if (this.locationObject !== undefined) {
        navigator.geolocation.clearWatch(this.locationObject)
      }

      let options = {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      }

      this.locationObject = navigator.geolocation.watchPosition(this.successWatchPostion, this.error, options)
    }
  },
  mounted () {
    if (this.$q.platform.is.cordova) {
      cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
        if (!enabled) {
          navigator.notification.confirm('Ativar GPS ?', buttonIndex => {
            if (buttonIndex === 1) cordova.plugins.diagnostic.switchToLocationSettings()
          }, 'Para utlizar a aplicação é necessário ter o GPS ativo', ['Ativar', 'Não Ativar'])
        }
      }, function (error) {
        console.error('The following error occurred: ' + error)
      })
    }
  }
}
</script>
