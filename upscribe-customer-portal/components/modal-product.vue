<template>
  <modal-mobile-wrap
    :show="show"
    :with-close-icon="false"
    :progress-bar-status="status"
    :progress-bar-message="statusText"
    :close-animation="closeAnimation"
    @close="closeModal"
    >
    <div v-if="product && !needUpdating">
      <transition :name="transitionComp" mode="out-in">
        <div v-if="!wantToLearnMore" :key="1">
          <div class="c-modalProduct c-modalMobile__wrapper">
            <img
              :src="product.image_url
                  .replace('.png', '_320x.png')
                  .replace('.jpg', '_320x.jpg')"
              alt=''
              class="c-modalProduct__image"
              />

            <div class="c-modalProduct__info">
              <h2 class="c-modalProduct__title">{{ product.title }}</h2>
              <!-- eslint-disable -->
              <p v-if="product.description" class="c-modalProduct__description" v-html="product.description"></p>

              <v-button
                v-if="product.full_description"
                class="c-modalProduct__learnMoreButton c-button--transparent"
                @onClick="handleLearnMore"
                >Learn more
              </v-button>
            </div>
          </div>

          <div class="c-modalProduct__buttonContain">
            <v-button
              class="c-modalProduct__swapButton c-button--transparent"
              :disabled="status === 'updating'"
              @onClick="$emit('swapSubscription', {title: 'swap', product: product})"
              >
              Swap
            </v-button>

            <div class="c-modalProduct__quantityControl">
              <v-button
                v-if="product.quantity > 1"
                class="c-modalProduct__quantityBox"
                aria-label="minus icon"
                :disabled="status === 'updating'"
                @onClick="quantityChange('decrease')"
                >
                <minus-icon />
              </v-button>

              <v-button
                v-else
                class="c-modalProduct__quantityBox"
                aria-label="trash icon"
                :disabled="status === 'updating'"
                @onClick="quantityChange('decrease')"
                >
                <trash-icon/>
              </v-button>

              <span class="c-modalProduct__quantityBox c-modalProduct__quantity" >{{ product.quantity }}</span>

              <v-button
                class="c-modalProduct__quantityBox"
                aria-label="plus icon"
                :disabled="status === 'updating'"
                @onClick="quantityChange('increase')"
                >
                <plus-icon />
              </v-button>
            </div>
          </div>
        </div>

        <div v-else class="c-modalProduct__fullDescriptionContainer" :key="2">
            <div class="c-modalProduct__fullDescription--top">
              <h2 class="c-modalProduct__fullDescriptionTitle">{{ product.title }}</h2>
              <span class="c-modalProduct__fullDescriptionBackArrow" @click="handleLearnMore">
                 <IconChevronRight class="c-modalProduct__fullDescriptionBackArrowIcon" />
              </span>
            </div>

            <div class="c-modalProduct__fullDescription--bottom" v-html="product.full_description" >
            </div>
        </div>
      </transition>
    </div>

    <div v-else-if="needUpdating" class="c-modalProduct__shippingRequire">
      <modal-shipping-require
        @updateStatus="updateStatus"
      />
    </div>
  </modal-mobile-wrap>
</template>

<script>
import ModalMobileWrap from '@components/modal-wrap-mobile.vue'
import VButton from '@components/v-button'
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
import MinusIcon from '@components/Icon/minus-icon'
import PlusIcon from '@components/Icon/plus-icon'
import TrashIcon from '@components/Icon/trash-icon'
import productChangeRequest from '@utils/product-change-request.js'
import { buildNewCheckoutUpdatePayload } from '@utils/newCheckoutUpdateHelpers'
import ModalShippingRequire from '@components/modal-shipping-require.vue'
import IconChevronRight from '@components/icon-chevron-right.vue'

export default {
  components: {
    ModalMobileWrap,
    MinusIcon,
    PlusIcon,
    TrashIcon,
    ModalShippingRequire,
    VButton,
    IconChevronRight,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
    closeModal: {
      type: Function,
      default: () => 1,
    },
    closeAnimation:{
      type: Boolean,
      default: false,
    },
  },

  data(){
    return {
      status: '',
      statusText: '',
      needUpdating: false,
      updating: false,
      wantToLearnMore: false,
      transitionComp: 'modal-modal-slideOutIn',
    }
  },

  computed: {
    ...mapState('editMode', ['editNextOrder']),

    ...mapGetters('activeSubscription', [
      'activeSubscription',
      'activeSubscriptionNextOrder',
      'activeQueue',
    ]),

    ...mapGetters('products', ['product']),
  },

  methods: {
    ...mapMutations('subscriptions', ['setSavedProductUpdatePayload']),

    ...mapMutations('shippingMethods', ['SET_SHIPPING_METHODS']),

    ...mapMutations('newCheckoutUpdates', ['setSavedNewCheckoutUpdate']),


    ...mapActions('subscriptions', [
      'UPDATE_SUBSCRIPTION',
      'UPDATE_NEXT_ORDER',
    ]),

    ...mapActions('upscribeAnalytics', ['triggerAnalyticsEvent']),

    handleLearnMore(){
      this.wantToLearnMore = !this.wantToLearnMore
      if(this.wantToLearnMore){
        this.transitionComp = 'modal-slideOutIn'
      } else {
        this.transitionComp = 'modal-slideInOut'
      }
    },

    updateStatus(payload){
      const { status, statusText, needUpdating } = payload
      this.status = status
      this.statusText = statusText
      if(needUpdating === 'stop'){
        this.needUpdating = false
      }
    },

    handleNewCheckoutUpdate(updateArray) {
      console.log('handleNewCheckoutUpdate')
      this.status = 'updating'
      this.statusText = 'Saving'
      return new Promise((resolve, reject) => {

        let updateCount = updateArray.length
        let updatesFinished = 0

          // for each update
          updateArray.forEach(async (update) => {
            console.log({update})
            this.updating = true
            try {
              await update.updateAction
              this.status = 'success'
              this.statusText = 'saved successfully'
            } catch (e) {
              this.handleNewCheckoutUpdateError(e, update)
            } finally {
              updatesFinished += 1
              this.updating = false
            }

            if (updatesFinished === updateCount) {
              resolve(true)
            }
          })
      })
    },

    handleNewCheckoutUpdateError(e, handleNewCheckoutUpdatePayload) {
      console.log('e', e)
      if (
        e &&
        e.data &&
        e.data.shipping_update_required
      ) {
        this.SET_SHIPPING_METHODS(e.data.rates)
        this.setSavedNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
        this.needUpdating = true
        this.status = 'rejected'
        this.statusText = e.message
      } else {
        console.log('subscription/UPDATE_SUBSCRIPTION error: ', e)
      }
    },

    quantityChange(type) {
      const { product } = this
      const quantity = product.quantity

      if (type === 'decrease') {
        if (quantity === 1) return this.handleRemove(product)

        this.handleQuantityChange({
          type: 'decrease',
          quantity: quantity - 1,
          id: product.id,
          variant_id: product.variant_id,
          product,
        })
      } else if (type === 'increase') {
        this.handleQuantityChange({
          type: 'increase',
          quantity: quantity + 1,
          id: product.id,
          variant_id: product.variant_id,
          product,
        })
      }
    },

    async handleQuantityChange({ type, id, quantity, variant_id, product }) {
      if (this.updating) return

      const {
        editNextOrder,
        activeSubscription,
      } = this


      const {
        increasePayload: nextIncreaseItemPayload,
        decreasePayload: nextDecreaseItemPayload,
      } = productChangeRequest({
        variantId: variant_id,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const {
        increasePayload: subscriptionIncreaseItemPayload,
        decreasePayload: subscriptionDecreaseItemPayload,
      } = productChangeRequest({
        variantId: variant_id,
        editNextOrder: false,
        subscription: activeSubscription,
      })

      console.log({nextIncreaseItemPayload, nextDecreaseItemPayload})
      console.log({subscriptionIncreaseItemPayload, subscriptionDecreaseItemPayload})

      // determine increase or decrease payload by the type param
      // coming from the quantity change event
      const subscriptionItemPayload = type === 'increase' ? subscriptionIncreaseItemPayload : subscriptionDecreaseItemPayload
      const nextItemPayload = type === 'increase' ? nextIncreaseItemPayload : nextDecreaseItemPayload


      const updateSubscriptionPayload = {
        requestPayload: {
          items: subscriptionItemPayload ? [subscriptionItemPayload] : undefined,
        },
      }

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextItemPayload ? [nextItemPayload] : undefined,
        },
      }


      let analyticsEventName, handleNewCheckoutUpdatePayload
      let analyticsPayload = {
        quantity,
        ...product,
      }

      if (analyticsPayload.product) {
        analyticsPayload.product.quantity = quantity
      }

      if (editNextOrder) {
        analyticsEventName = 'Upscribe Next Order Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Quantity updated to ${quantity} on next order.`
          ),
        ]

      } else {
        analyticsEventName = 'Upscribe Subscription Product Quantity Change'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Quantity updated to ${quantity} on next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Quantity updated to ${quantity} on subscription.`,
          ),
        ]
      }

      // hande everything in handleNewCheckoutUpdate function
      await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
      this.triggerAnalyticsEvent({
        event: analyticsEventName,
        payload: analyticsPayload,
      })
    },


    async handleRemove(product) {
      if (this.updating) return

      console.log('Triggering me')
      const {
        activeSubscription,
        activeQueue,
        // products,
        editNextOrder,
      } = this

      const itemCount = editNextOrder
        ? activeQueue.items.length
        : activeSubscription.items.length

      if (itemCount <= 1) {
        this.$router.push({
          name: 'cancel',
        })
      }

      const {
        removePayload: nextRemoveItemPayload,
      } = productChangeRequest({
        variantId: product.variant_id,
        editNextOrder: true,
        subscription: activeSubscription,
      })

      const {
        removePayload: subscriptionRemoveItemPayload,
      } = productChangeRequest({
        variantId: product.variant_id,
        editNextOrder: false,
        subscription: activeSubscription,
      })

      console.log({nextRemoveItemPayload})
      console.log({subscriptionRemoveItemPayload})

      const updateSubscriptionPayload = {
        requestPayload: {
          items: subscriptionRemoveItemPayload ? [subscriptionRemoveItemPayload] : undefined,
        },
      }

      const nextOrderUpdatePayload = {
        requestPayload: {
          items: nextRemoveItemPayload ? [nextRemoveItemPayload] : undefined,
        },
      }

      let analyticsEventName, handleNewCheckoutUpdatePayload

      let itemsToCheck = editNextOrder
        ? activeSubscription.next.items
        : activeSubscription.items

      let editItem = [...itemsToCheck].filter((item) => {
        return item.id === product.id
      })[0]

      let analyticsPayload = {
        product: { ...editItem },
      }

      if (editNextOrder) {
        analyticsEventName = 'Upscribe Next Order Product Remove'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product removed from next order.`
          ),
        ]

      } else {
        analyticsEventName = 'Upscribe Subscription Product Remove'

        handleNewCheckoutUpdatePayload = [
          buildNewCheckoutUpdatePayload(
            this.UPDATE_NEXT_ORDER(nextOrderUpdatePayload),
            nextOrderUpdatePayload,
            'subscriptions',
            'UPDATE_NEXT_ORDER',
            `Product removed from next order.`
          ),
          buildNewCheckoutUpdatePayload(
            this.UPDATE_SUBSCRIPTION(updateSubscriptionPayload),
            updateSubscriptionPayload,
            'subscriptions',
            'UPDATE_SUBSCRIPTION',
            `Product removed from subscription`,
          ),
        ]
      }

      // hande everything in handleNewCheckoutUpdate function
      try{
        await this.handleNewCheckoutUpdate(handleNewCheckoutUpdatePayload)
      } catch(e){
        console.log(e)
      }

      this.triggerAnalyticsEvent({
        event: analyticsEventName,
        payload: analyticsPayload,
      })
    },
  },
}
</script>

<style lang="scss">
@import '@design/_colors';
.c-modalProduct__fullDescription--top{
  display: flex;
  border-bottom: 1px solid $color-blue-light-border;
  padding: 0 16px 17px;
  position: relative;
  align-items: center;
  justify-content: center;
}

.c-modalProduct__fullDescription--bottom{
    padding: 17px 16px;
}

.c-modalProduct{
  display: flex;
  margin-bottom: 10px;
}

.c-modalProduct__image{
  min-width: 105px;
  height: 105px;
  margin-right: 12px;
  object-fit: contain;
  width: 50%;

  @media (min-width: 425px){
    min-width: 125px;
    height: 125px;
  }
}

.c-modalProduct__info{
  width: 100%;
  padding-top: 10px;
}

.c-modalProduct__title,
.c-modalProduct__description{
  text-transform: capitalize;
  font-style: normal;
}

.c-modalProduct__title{
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
}

.c-modalProduct__description{
  color: $color-blue-secondary;
  font-size: 14px;
  line-height: 18px;
  margin-bottom: 0;
  p{
    margin-bottom: 0;
  }
}

.c-modalProduct__quantityControl{
  height: 48px;
  width: auto;
  box-shadow: 0px 2px 1px 2px rgba(1, 1, 1, 0.1);
  display: inline-flex;
  border-radius: 4px;
}

.c-modalProduct__quantityBox{
  width: 48px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $color-white;
  min-width: 0;
  border: 0px;

  &:hover,
  &:focus{
    background-color: $color-white;
  }
}

.c-modalProduct__quantity{
  font-weight: bold;
}

.c-modalProduct__swapButton{
  display: inline-block;
  width: 158px;
}

.c-modalProduct__buttonContain{
  display: flex;
  justify-content: center;
}

.c-modalProduct__swapButton{
  margin-right: 25px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.8px;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 4px;
  color: $color-black;
  border: none;
  background-color: $color-white;
  box-shadow: 0px 2px 1px 2px rgba(1, 1, 1, 0.1);
}

.c-modalProduct__shippingRequire{
  padding: 0 16px;
}

.c-modalProduct__learnMoreButton{
  border: none;
  width: auto;
  padding: 0;
  margin: 5px 0 5px;
  min-width: none;
  font-weight: bold;
  font-size: 13px;
  line-height: 19px;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: $color-primary;
}

.c-modalProduct__fullDescriptionTitle{
  line-height: 21px;
  font-size: 16px;
  text-align: center;
  color: #171725;
  max-width: 150px;
  font-weight: 500;
  text-transform: capitalize;
}

.c-modalProduct__fullDescriptionBackArrow{
  position: absolute;
  left: 16px;
}

.c-modalProduct__fullDescriptionBackArrowIcon{
  width: 16px;
  height: 16px;
  transform: rotateZ(180deg);
}

.modal-slideOutIn-enter-active {
  width: 100%;
  animation: moveIn 0.5s linear both;
}

.modal-slideOutIn-leave-active {
  width: 100%;
  animation: leaveOut 0.5s linear both;
}

@-webkit-keyframes moveIn {
  0% {
    -webkit-transform: translate3d(100%, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(0, 0, 0);
  }
}

@keyframes moveIn {
  0% {
    transform: translate3d(100%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@-webkit-keyframes leaveOut {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(-100%, 0, 0);
  }
}

@keyframes leaveOut {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-100%, 0, 0);
  }
}

.modal-slideInOut-enter-active {
  animation: acrossIn 0.5s linear both;
}

.modal-slideInOut-leave-active {
  animation: acrossOut 0.5s linear both;
}

@-webkit-keyframes acrossIn {
  0% {
    -webkit-transform: translate3d(-100%, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(0, 0, 0);
  }
}

@keyframes acrossIn {
  0% {
    transform: translate3d(-100%, 0, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}

@-webkit-keyframes acrossOut {
  0% {
    -webkit-transform: translate3d(0, 0, 0);
  }
  100% {
    -webkit-transform: translate3d(100%, 0, 0);
  }
}

@keyframes acrossOut {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(100%, 0, 0);
  }
}
</style>
