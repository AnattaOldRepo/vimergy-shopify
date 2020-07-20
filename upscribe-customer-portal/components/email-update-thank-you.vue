<template>
  <div v-if="activeSubscription">
    <section class="c-emailUpdateThankYou">
      <div class="c-emailUpdateThankYou__inner">
        <div class="c-emailUpdateThankYou__top">
          <div class="c-emailUpdateThankYou__logoWrap">
            <store-logo class="c-logo" />
          </div>

          <h1 class="c-orderThankyou__title"
            >{{ atc['labels.thankYou'] || 'Thank you' }} {{ customerName ? ` ${customerName}` : '' }}!</h1
          >
          <p class="c-orderThankyou__message">
            {{ atc['portal.emailReactivateSubscriptionThankYouMessage'] || 'Your subscription has been reactivated.'}}
          </p>
        </div>

        <div class="c-emailUpdateThankYou__bottom">
          <div class="c-emailUpdateThankYou__items">
            <product-option
              v-for="item in activeSubscription.next.items"
              :key="item.id"
              :product="item"
              :show-price="true"
              class="c-emailUpdateThankYou__item"
            />
          </div>

          <div class="c-emailUpdateThankYou__total c-tableContainer">
            <table class="c-table">
              <tbody>
                <tr>
                  <th>{{ atc['labels.subtotal'] || 'Subtotal' }}</th>
                  <td></td>
                  <td></td>
                  <td class="has-text-centered"
                    >{{ currencySymbol }}{{
                      parseFloat(activeCharge.total_line_items_price, 2)
                    }}</td
                  >
                </tr>
                <tr>
                  <th
                    >{{ atc['labels.shipping'] || 'Shipping' }}
                    <span
                      v-if="
                        activeCharge &&
                          activeCharge.shipping_lines &&
                          activeCharge.shipping_lines[0].title
                      "
                      style="font-weight: normal"
                      >&nbsp;{{ activeCharge.shipping_lines[0].title }}</span
                    ></th
                  >
                  <td colspan="2" class="has-text-centered"></td>
                  <td class="has-text-centered"
                    >{{ currencySymbol }}{{
                      parseFloat(activeCharge.shipping_lines[0].price, 2)
                    }}</td
                  >
                </tr>

                <tr v-if="discountAmount && discountCode">
                  <th
                    >{{ atc['labels.discount'] || 'Discount' }}
                    <span
                      v-if="discountAmount && discountCode"
                      style="font-weight: normal"
                      >&nbsp;{{ discountCode }}</span
                    ></th
                  >
                  <td colspan="2" class="has-text-centered"></td>
                  <td class="has-text-centered"
                    ><span v-if="discountAmount"
                      >-{{ currencySymbol }}{{ discountAmount }}</span
                    ></td
                  >
                </tr>

                <tr>
                  <th>{{ atc['labels.tax'] || 'Tax' }}</th>
                  <td></td>
                  <td></td>

                  <td class="has-text-centered"
                    >{{ currencySymbol }}{{ parseFloat(activeCharge.total_tax, 2) }}</td
                  >
                </tr>

                <tr>
                  <th>{{ atc['labels.total'] || 'Total' }}</th>
                  <td></td>
                  <td></td>

                  <td class="has-text-centered"
                    >{{ currencySymbol }}{{ parseFloat(activeCharge.total_price, 2) }}</td
                  >
                </tr>
              </tbody></table
            >
          </div>

          <v-button class="c-button--auto" @onClick="viewUpcomingOrderDetails"
            >{{ atc['portal.viewOrderDetails'] || 'View Upcoming Order Details' }}</v-button
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'
import StoreLogo from '@components/store-logo.vue'
import ProductOption from '@components/product-option.vue'

import VButton from '@components/v-button.vue'

export default {
  components: {
    VButton,
    StoreLogo,
    ProductOption,
  },

  props: {
    activeSubscription: {
      type: Object,
      required: true,
    },
  },

  data: () => {
    return {
      displayOrderData: null,
      previewCheckout: false,
      customSuccessPage: false,
    }
  },

  computed: {
    ...mapState('translations', ['atc', 'activeLanguageCode']),
    ...mapState('order', ['getOrderPending', 'orderData', 'orderLoaded']),
    ...mapState('checkout', ['shopData', 'store']),
    ...mapState('customer', ['customerShopify']),
    ...mapState('shop', ['currencySymbol']),

    nextShipDate() {
      const { activeSubscription } = this
      if (
        !activeSubscription &&
        activeSubscription.next &&
        activeSubscription.next.date
      )
        return false
      return moment(activeSubscription.next.date, 'YYYYMMDD').format(
        'MMMM Do, YYYY'
      )
    },

    activeCharge() {
      return this.activeSubscription.next
    },

    customerName() {
      const { customerShopify } = this
      if (!customerShopify) return ''

      const { first_name, last_name } = customerShopify

      let finalFirstName = false
      let finalLastName = false

      if (!first_name && !last_name) {
        finalFirstName = customerShopify.default_address.first_name
        finalLastName = customerShopify.default_address.last_name
      } else if (first_name && last_name) {
        finalFirstName = first_name
        finalLastName = last_name
      }

      return (finalFirstName && finalLastName) ? `${finalFirstName} ${finalLastName}` : ''
    },

    discountAmount() {
      const { activeCharge } = this
      if (activeCharge.shopify_discount) {
        return parseFloat(activeCharge.shopify_discount).toFixed(2)
      } else {
        return false
      }
    },

    discountCode() {
      const { activeCharge } = this
      return activeCharge && activeCharge.discount_code
        ? activeCharge.discount_code
        : false
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

  methods: {
    viewUpcomingOrderDetails() {
      this.$router.push({ name: 'index' })
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-emailUpdateThankYou {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 0 auto;
  min-height: calc(100vh - 100px);
  width: 100%;
  background-color: #f4f4f4;
  width: 100%;
  max-width: 786px;
}

.c-emailUpdateThankYou__inner {
  width: 100%;
  max-width: 786px;
}

.c-emailUpdateThankYou__top {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 50px 20px 8px;
  background-color: #f2f9fd;
}

.c-emailUpdateThankYou__logoWrap {
  margin-bottom: 40px;
}

.c-emailUpdateThankYou__logo {
  margin-bottom: 22px;
}

.c-orderThankyou__title {
  margin-bottom: 21px;
  font-size: 26px;
  text-align: center;

  @include bp(mobile-large) {
    font-size: 34px;
  }
}

.c-orderThankyou__message {
  max-width: 480px;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
}

.c-emailUpdateThankYou__bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 32px 20px;
  background-color: $color-white;

  @include bp(mobile-large) {
    // align-items: flex-start;
  }
}

.c-emailUpdateThankYou__items {
  margin-top: 20px;
  margin-bottom: 40px;

  .c-productOption__title,
  .c-productOption__detail,
  .c-productOption__price {
    color: $color-text;
  }
}

.c-emailUpdateThankYou__total {
  margin-bottom: 40px;
}
</style>
