<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
var Pikaday = null

if (process.browser) {
  Pikaday = require('pikaday')
}

export default {
  name: 'DrawerEditShipDate',

  props: {
    saved: {
      type: Boolean,
      default: false,
    },
    isInPage: {
      type: Boolean,
      default: false,
    },
  },

  data: function() {
    return {
      date: null,
      dateOutsideRestriction: false,
      defaultPreviousMonth: 'Previous Month',
      defaultNextMonth: 'Next Month',
      defaultMonths: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      defaultDays: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      defaultDaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    }
  },

  computed: {
    ...mapState('translations', ['atc', 'activeLanguageCode']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextDate',
    ]),

    nextShipDate() {
      const { activeSubscriptionNextDate } = this
      if (!activeSubscriptionNextDate) return false
      return moment(activeSubscriptionNextDate, 'YYYYMMDD').format('YYYY-MM-DD')
    },
  },

  watch: {
    activeLanguageCode: {
      immediate: true,
      handler: function(newVal) {
        moment.locale(newVal)
      },
    },
  },

  mounted() {
    const { nextShipDate, atc, defaultPreviousMonth, defaultNextMonth, defaultMonths, defaultDays, defaultDaysShort } = this

    const previousMonthText = atc['date-time.previousMonth'] || defaultPreviousMonth
    const nextMonthText = atc['date-time.nextMonth'] || defaultNextMonth
    const monthsArray = atc['date-time.months'] ? atc['date-time.months'].split(',') : defaultMonths
    const daysArray = atc['date-time.days'] ? atc['date-time.days'].split(',') : defaultDays
    const daysShortArray = atc['date-time.daysShort'] ? atc['date-time.daysShort'].split(',') : defaultDaysShort

    this.date = nextShipDate
    // console.log({
    //   previousMonthText,
    //   nextMonthText,
    //   monthsArray,
    //   daysArray,
    //   daysShortArray,
    // })

    this.$nextTick(() => {
      const picker = new Pikaday({
        field: document.getElementById('datepicker-input'),
        format: 'YYYY-MM-DD',
        bound: false,
        onSelect: () => {
          this.date = picker.toString()
          this.$emit('changeShipmentDate', picker.toString())
        },
        minDate: moment()
          .add(1, 'days')
          .toDate(),

        showDaysInNextAndPreviousMonths: true,
        enableSelectionDaysInNextAndPreviousMonths: false,

        i18n: {
          previousMonth: previousMonthText,
          nextMonth: nextMonthText,
          months: monthsArray,
          weekdays: daysArray,
          weekdaysShort: daysShortArray,
        },
      })
    })
  },
}
</script>

<template>
  <div class="c-datePicker">
    <input
      v-if="date"
      id="datepicker-input"
      class="c-datePicker__hiddenInput"
      :value="date"
    />
  </div>
</template>

<style lang="scss">
@import '@design';

.c-datePicker__hiddenInput {
  width: 0 !important;
  height: 0 !important;
  padding: 0 !important;
  color: $color-white !important;
  background-color: transparent !important;
  border: none !important;
}

.pika-single {
  position: relative;
  z-index: 9999;
  display: block;
  width: 100%;
  height: 351px;
  margin: 0 auto;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
  background: #fff;
  border: none;
  box-shadow: none;

  @media (min-width: 325px){
    width: 90%;
  }

  @media (min-width: 420px){
    width: 100%;
  }

  @include bp(tablet){
    width: 352px;
  }
}

.pika-single:before,
.pika-single:after {
  display: table;
  content: ' ';
}
.pika-single:after {
  clear: both;
}
.pika-single {
  *zoom: 1;
}

.pika-single.is-hidden {
  display: none;
}

.pika-single.is-bound {
  position: absolute;
  box-shadow: 0 5px 15px -5px rgba(0, 0, 0, 0.5);
}

.pika-lendar {
  height: 100%;
  padding: 8px 0px 0px 15px;
  @include bp(tablet){
    border: 1px solid $color-blue-light-border;
    padding: 8px 22px;
  }
}

.pika-title {
  display: flex;
  padding: 11px 4px 3px;
  margin-bottom: 6px;
  text-align: center;
}

.pika-label {
  display: inline-block;
  font-family: $font-primary-medium;
  font-weight: 500;
  font-size: 22px;
  position: relative;

  &:nth-child(1) {
    margin-right: 7px;
    color: $color-black;
  }

  &:nth-child(2) {
    margin-right: 10px;
    color: $color-blue-secondary;
  }
}

.pika-prev,
.pika-next {
  position: relative;
  *position: absolute;
  *top: 0;
  display: inline-block;
  width: 20px;
  height: 30px;
  padding: 0;
  overflow: hidden;
  text-indent: 20px;
  white-space: nowrap;
  cursor: pointer;
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: center center;
  border: 0;
  outline: none;
  opacity: 0.5;
}

.pika-prev:hover,
.pika-next:hover {
  opacity: 1;
}

.pika-prev,
.is-rtl .pika-next {
  background-image: url('data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAYAAAAsEj5rAAAAUklEQVR42u3VMQoAIBADQf8Pgj+OD9hG2CtONJB2ymQkKe0HbwAP0xucDiQWARITIDEBEnMgMQ8S8+AqBIl6kKgHiXqQqAeJepBo/z38J/U0uAHlaBkBl9I4GwAAAABJRU5ErkJggg==');
}

.pika-next,
.is-rtl .pika-prev {
  background-image: url('data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAeCAYAAAAsEj5rAAAAU0lEQVR42u3VOwoAMAgE0dwfAnNjU26bYkBCFGwfiL9VVWoO+BJ4Gf3gtsEKKoFBNTCoCAYVwaAiGNQGMUHMkjGbgjk2mIONuXo0nC8XnCf1JXgArVIZAQh5TKYAAAAASUVORK5CYII=');
}

.pika-prev.is-disabled,
.pika-next.is-disabled {
  cursor: default;
  opacity: 0.2;
}

.pika-title select {
  position: absolute;
  top: 5px;
  left: 0;
  z-index: 9998;
  margin: 0;
  cursor: pointer;
  filter: alpha(opacity=0);
  opacity: 0;
}

.pika-select {
  display: inline-block;
  *display: inline;
}

.pika-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  border: 0;
  height: 80%;
}

.pika-table th,
.pika-table td {
  width: 14.285714285714286%;
  padding: 0;
  border: none;
}

.pika-table th {
  padding: 7px;
  font-family: $font-primary-regular;
  font-size: 11px;
  color: $color-text-light;
  text-align: left;
  text-decoration: none;
}

.pika-button {
  -moz-box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 7px;
  margin: 0;
  font-family: $font-primary-regular;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  background: $color-white;
  border: 0;
  outline: none;
}

.pika-week {
  font-size: 11px;
  color: $color-text-light;
}

.is-today .pika-button {
  font-family: $font-primary-medium;
  font-weight: 500;
  color: $color-primary;
}

.is-selected .pika-button,
.has-event .pika-button {
  color: $color-white;
  background: $color-primary;
  border-radius: 50px;

  .pikaday-hideaway & {
    color: $color-black;
    background: $color-white;
  }
}

.is-disabled .pika-button,
.is-inrange .pika-button {
  background: #F7F9FB;
  font-weight: bold;
}

.is-startrange .pika-button {
  color: $color-white;
  background: $color-green;
  border-radius: 3px;
  box-shadow: none;
}

.is-endrange .pika-button {
  color: $color-white;
  background: $color-primary;
  border-radius: 3px;
  box-shadow: none;
}

.is-disabled .pika-button {
  color: $color-blue-secondary;
  pointer-events: none;
  cursor: default;
  opacity: 0.3;
}

.is-outside-current-month .pika-button {
  color: $color-blue-secondary;
  opacity: 0.3;
}

.is-selection-disabled {
  pointer-events: none;
  cursor: default;
}

.pika-table abbr {
  font-size: 11px;
  font-family: $font-primary-regular;
  text-decoration: none;
  border-bottom: none;
  cursor: default;
}
</style>
