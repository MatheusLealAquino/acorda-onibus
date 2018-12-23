const mapHelper = {
  distance: function (latInicial, latFinal, longInicial, longFinal) {
    let d2r = 0.017453292519943295769236

    let dlong = (longFinal - longInicial) * d2r
    let dlat = (latFinal - latInicial) * d2r

    let tempSin = Math.sin(dlat / 2.0)
    let tempCos = Math.cos(latInicial * d2r)
    let tempSin2 = Math.sin(dlong / 2.0)

    let a = (tempSin * tempSin) + (tempCos * tempCos) * (tempSin2 * tempSin2)
    let c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a))

    return 6368.1 * c
  }
}

export default ({ Vue }) => {
  // for use inside Vue files through this.$axios
  Vue.prototype.$mapHelper = mapHelper
}

export { mapHelper }
