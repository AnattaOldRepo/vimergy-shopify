<template>
  <section v-if="displayCharges" class="c-thankYouBlock">
    <div class="c-thankYouBlock__inner">
      <div class="c-thankYouBlock__top">
        <div class="c-thankYouBlock__logoWrap">
          <store-logo class="c-logo" />
        </div>

        <h1 class="c-orderThankyou__title"
          >{{ atc['labels.thankYou'] || 'Thank you' }}
          {{ customerName ? customerName : '' }}!</h1
        >
        <p class="c-orderThankyou__message">
          {{
            atc['portal.thankYouNewShipmentDate'] || 'Your new shipment date is'
          }}
          {{ nextShipDate(displayCharges[0]) }}
        </p>
      </div>

      <div
        v-for="displayCharge in displayCharges"
        :key="displayCharge.id"
        class="c-thankYouBlock__bottom"
      >
        <p class="c-orderThankyou__message"
          >{{ atc['labels.subscription'] || 'Subscription' }} #{{
            displayCharge.subscription_id
          }}</p
        >
        <div class="c-thankYouBlock__items">
          <product-option
            v-for="item in displayCharge.items"
            :key="item.id"
            :product="item"
            :show-price="true"
            class="c-thankYouBlock__item"
          />
        </div>

        <div
          class="c-thankYouBlock__total c-tableContainer"
          style="display:none;"
        >
          <table class="c-table">
            <tbody>
              <tr>
                <th>{{ atc['labels.subtotal'] || 'Subtotal' }}</th>
                <td></td>
                <td></td>
                <td class="has-text-centered"
                  >{{ currencySymbol
                  }}{{
                    parseFloat(displayCharge.total_line_items_price, 2)
                  }}</td
                >
              </tr>
              <tr>
                <th
                  >{{ atc['labels.shipping'] || 'Shipping' }}
                  <span
                    v-if="
                      displayCharge &&
                        displayCharge.shipping_lines &&
                        displayCharge.shipping_lines[0].title
                    "
                    style="font-weight: normal"
                    >&nbsp;{{ displayCharge.shipping_lines[0].title }}</span
                  ></th
                >
                <td colspan="2" class="has-text-centered"></td>
                <td class="has-text-centered"
                  >{{ currencySymbol
                  }}{{
                    parseFloat(displayCharge.shipping_lines[0].price, 2)
                  }}</td
                >
              </tr>

              <tr
                v-if="
                  displayCharge.shopify_discount && displayCharge.discount_code
                "
              >
                <th
                  >{{ atc['labels.discount'] || 'Discount' }}
                  <span style="font-weight: normal"
                    >&nbsp;{{ displayCharge.discount_code }}</span
                  ></th
                >
                <td colspan="2" class="has-text-centered"></td>
                <td class="has-text-centered"
                  ><span
                    >-{{ currencySymbol
                    }}{{
                      parseFloat(displayCharge.shopify_discount).toFixed(2)
                    }}</span
                  ></td
                >
              </tr>

              <tr>
                <th>{{ atc['labels.tax'] || 'Tax' }}</th>
                <td></td>
                <td></td>

                <td class="has-text-centered"
                  >{{ currencySymbol
                  }}{{ parseFloat(displayCharge.total_tax, 2) }}</td
                >
              </tr>

              <tr>
                <th>{{ atc['labels.total'] || 'Total' }}</th>
                <td></td>
                <td></td>

                <td class="has-text-centered"
                  >{{ currencySymbol
                  }}{{ parseFloat(displayCharge.total_price, 2) }}</td
                >
              </tr>
            </tbody></table
          >
        </div>
      </div>

      <v-button
        class="c-button--auto"
        style="margin:20px auto"
        @onClick="viewUpcomingOrderDetails"
        >{{ atc['buttons.viewOrderDetails'] || 'View Order Details' }}</v-button
      >
    </div>
  </section>
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
    activeCharge: {
      type: [Object, Array],
      required: true,
    },
    // if the above two props are Arrays (muliple) or Objects (single)
    multipleOrderDisplay: {
      type: Boolean,
      default: false,
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

    displayCharges() {
      const { multipleOrderDisplay, activeCharge } = this
      if (multipleOrderDisplay && activeCharge) {
        if (Array.isArray(activeCharge)) {
          return activeCharge
        } else {
          // single put in array
          return [activeCharge]
        }
      } else if (multipleOrderDisplay) {
        return [activeCharge.next]
      } else {
        return [activeCharge]
      }
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

      return finalFirstName && finalLastName
        ? `${finalFirstName} ${finalLastName}`
        : ''
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

    nextShipDate(charge) {
      if (charge && charge.date) {
        return moment(charge.date, 'YYYYMMDD').format('MMMM Do, YYYY')
      } else {
        return false
      }
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.c-thankYouBlock {
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

.c-thankYouBlock__inner {
  width: 100%;
  max-width: 786px;
}

.c-thankYouBlock__top {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 50px 20px 8px;
  background-color: #f2f9fd;
}

.c-thankYouBlock__logoWrap {
  margin-bottom: 40px;
}

.c-thankYouBlock__logo {
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

.c-thankYouBlock__bottom {
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

.c-thankYouBlock__items {
  margin-top: 20px;
  margin-bottom: 40px;

  .c-productOption__title,
  .c-productOption__detail,
  .c-productOption__price {
    color: $color-text;
  }
}

.c-thankYouBlock__total {
  margin-bottom: 40px;
}
</style>
