import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://places.cit.api.here.com/places/v1/discover/search'
})

export default ({ Vue }) => {
  // for use inside Vue files through this.$axios
  Vue.prototype.$axios = axiosInstance
}

// Here we define a named export
// that we can later use inside .js files:
export { axiosInstance }
