import Vue from 'vue'
import moment from 'moment'

Vue.filter('prettyDate', (date) => {
  if (!date) return 'N/A'
  return moment(date).format('MMM D, YYYY')
})
