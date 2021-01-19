<script>
import * as icons from '@state/cardIcons.js'
// import EditIcon from '@components/Icon/edit-icon.vue'
// import TrashIcon from '@components/Icon/trash-icon.vue'
import CreditCardIcon from '@components/Icon/credit-card-icon.vue'
import LockIcon from '@components/Icon/lock-icon.vue'
import { mapState, mapActions, mapMutations } from 'vuex'
import { windowSizes } from '@mixins/windowSizes'

export default {
  components: {
    LockIcon,
    CreditCardIcon,
  },

  mixins: [windowSizes],

  props: {
    card: {
      type: Object,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    noEdit: {
      type: Boolean,
      default: false,
    },
    isEditingCard: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState('cards', ['activeEditCard']),

    ...mapState('mobileGlobalManagement', ['status']),

    ...mapState('translations', ['atc']),

    ...mapState('route', ['storeDomain', 'customerId']),

    paymentMethodName() {
      const { card } = this
      if (card.type.includes('card')) {
        return card.name || card.brand
      } else if (card.type === 'stripe_sepa_direct_debit') {
        return 'SEPA Direct Debit'
      } else if (card.type === 'braintree_paypal') {
        return 'PayPal'
      } else {
        return false
      }
    },

    paymentMethodDetailText() {
      const { card } = this
      if (card.type.includes('card')) {
        return `*${card.last4} ${card.exp_month}/${card.exp_year} ${
          card.zipcode ? '<br>Zip: ' + card.zipcode : ''
        }`
      } else if (card.type === 'braintree_paypal') {
        return `Account Email: ${card.email ||
          'No email available for account'}`
      } else if (card.type === 'stripe_sepa_direct_debit') {
        return `Acct *${card.last4} / Bank ${card.bank_code}`
      } else {
        return false
      }
    },

    cardSvg() {
      const { card } = this
      if (card && card.brand) {
        return icons[this.card.brand.toLowerCase().replace(' ', '')]
      } else {
        return false
      }
    },
  },
  methods: {
    ...mapMutations('cards', ['setActiveEditCard']),

    ...mapActions('cards', ['REMOVE_PAYMENT_METHOD']),

    handleEditCardMobile(card) {
      this.setActiveEditCard(card)
    },
  },
}
</script>

<template>
  <div>
    <div v-if="card" class="c-cardItem">
      <div class="c-cardItem__inner" @click="$emit('selectCard')">
        <div
          v-if="card.status === 'void'"
          class="tag is-warning c-cardItem__voidWarning"
          >{{
            atc['errors.invalidPaymentMethodTag'] || 'Invalid Payment Method'
          }}</div
        >

        <span v-if="noEdit" class="c-cardItem__lock"><lock-icon /></span>

        <div class="c-cardItem__left">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div
            v-if="card.type.includes('card') && cardSvg"
            class="c-cardItem__cardIcon"
            v-html="cardSvg"
          ></div>

          <div class="c-cardItem__info">
            <span v-if="paymentMethodName" class="c-cardItem__name">{{
              paymentMethodName
            }}</span>

            <div class="c-cardItem__editText">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span
                v-if="paymentMethodDetailText"
                class="c-cardItem__editTextInner"
                v-html="paymentMethodDetailText"
              />
            </div>
          </div>
        </div>

        <div v-if="!noEdit" class="c-option__action">
          <div
            class="c-option__select"
            :class="{ 'c-option__select--picked': isSelected }"
          >
            <span class="c-option__inner"></span>
          </div>
          <div class="c-action__items">
            <a @click="$emit('editPaymentMethod')">{{
              atc['actions.editActionText'] || 'EDIT'
            }}</a>
            <a
              class="c-action__items--delete"
              @click.prevent="$emit('removePaymentMethod')"
            >
              {{ atc['actions.removeActionText'] || 'DELETE' }}</a
            >
          </div>
        </div>
      </div>
    </div>

    <div v-else class="c-cardItem">
      <div
        class="c-cardItem__inner"
        :class="{
          'c-cardItem__inner--updating': status === 'updating',
        }"
        @click="$emit('selectCard')"
      >
        <div class="c-cardItem__left">
          <credit-card-icon class="c-cardItem__card--mobile" />

          <div class="c-cardItem__info">
            <span v-if="paymentMethodName" class="c-cardItem__name">{{
              paymentMethodName
            }}</span>

            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              v-if="paymentMethodDetailText"
              class="c-cardItem__editText c-cardItem__editText--mobile"
              v-html="paymentMethodDetailText"
            />

            <div
              v-if="card.status === 'void'"
              class="tag is-warning c-cardItem__voidWarning u-mt-1"
              >{{
                atc['errors.invalidPaymentMethodTag'] ||
                  'Invalid Payment Method'
              }}</div
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-cardItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.c-cardItem__edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 80px;
  padding: 0 10px 0 20px;
  cursor: pointer;

  &:hover {
    .c-cardItem__editIcon {
      fill: $color-text;
    }
    .c-cardItem__editText {
      color: $color-text;
    }
  }
}

.c-cardItem__editText--mobile {
  color: $color-text;
  text-align: left;
  max-width: 200px;

  br {
    display: none;
  }
}

.c-cardItem__editIcon {
  width: 16px;
  height: 16px;
  transition: all 0.2s ease;
  margin-right: 5px;
}

.c-cardItem__editText {
  display: block;
  font-size: 14px;
  color: $color-blue-secondary;
  text-align: center;
  transition: all 0.2s ease;
  margin-right: 8px;
}

.c-cardItem__editTextInner {
  text-align: left;
}

.c-cardItem__inner {
  position: relative;
  width: 100%;
  padding: 16px 18px 15px;
  font-size: 16px;
  line-height: 21px;
  color: $color-text;
  background-color: $color-white;
  border: 1px solid $color-blue-light-border;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;

  &--updating {
    pointer-events: none;
  }
  .c-option__action {
    display: flex;
    flex-direction: column;
    width: 25%;

    justify-content: space-between;
    .c-option__select {
      align-self: flex-end;
    }
    .c-action__items {
      display: flex;
      justify-content: space-between;
      a {
        text-decoration: underline;
        font-size: 14px;
        @include bp(mobile-large-max) {
          font-size: 12px;
          margin-right: 5px;
        }
      }
      .c-action__items--delete {
        color: $color-red;
      }
    }
  }
}

.c-cardItem__info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
}

.c-cardItem__name {
  display: block;
  margin-bottom: 4px;
  text-transform: capitalize;
  color: $color-black;
}

.c-cardItem__editText {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: $color-blue-secondary;

  &--mobile {
    color: $color-black;
  }
}

.c-option__editing {
  display: flex;
  align-items: center;
}

.c-option__selectEdit {
  margin-right: 10px;
  font-size: 11px;
  line-height: 15px;
  text-decoration: none;
  color: $color-blue-brand;
}

.c-cardItem__cardIcon {
  margin-right: 10px;
  svg {
    width: 30px;
  }
}

.c-cardItem__left {
  display: flex;
  width: 75%;
  align-items: center;
}

.c-cardItem__lock {
  position: absolute;
  top: 50%;
  right: 20px;
  cursor: default;
  transform: translateY(-50%);
}

.c-cardItem__card--mobile {
  margin-right: 12px;
}
</style>
