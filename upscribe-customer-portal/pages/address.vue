<template>
  <div class="o-container o-container--mobile">
    <h1
      v-if="customerShopify && customerShopify.addresses"
      class="c-all__title u-mt-3 u-ml-3"
    >
      {{ atc['portal.address'] || 'Addresses' }}
    </h1>
    <h1 v-else class="c-all__title u-mt-3 u-ml-3">No Addresses Available</h1>

    <div class="u-mt-3">
      <div
        v-for="address in customerShopify && customerShopify.addresses"
        :key="address.id"
        class="c-address u-mb-4 u-pa-8 u-bgColor--white "
      >
        <div class="c-address__header">
          <h2>{{ address.first_name }} {{ address.last_name }}</h2>
          <div class="c-address__ctaContainer">
            <v-button @onClick="editAddress(address)">{{
              atc['buttons.editAddress'] || 'Edit'
            }}</v-button>

            <v-button class="u-ml-3" @onClick="removeAddress(address)"
              >{{ atc['buttons.deleteAddress'] || 'Delete' }}
            </v-button>
          </div>
        </div>
        <hr class="c-address__divider" />
        <p v-show="address.company">
          {{ address.company }}
        </p>
        <p>
          {{ address.address1 }}
        </p>
        <p v-show="address.address2">
          {{ address.address2 }}
        </p>
        <p> {{ address.city }}, {{ address.province_code }} </p>
        <p> {{ address.country }}, {{ address.zip }} </p>
      </div>
      <v-button
        class="c-address__addNewCTA"
        @onClick="openAddNewAddress = true"
      >
        {{ atc['buttons.addNewAddress'] || 'Add New Address' }}
      </v-button>
    </div>

    <portal to="addNewAddress"> </portal>
    <portal to="editAddress"> </portal>
    <portal to="deleteAddress"> </portal>

    <portal-target v-if="openEditAddress" name="editAddress">
      <drawer-address
        :show="openEditAddress"
        initial-mode="edit"
        @close="openEditAddress = false"
      />
    </portal-target>
    <portal-target v-if="openDeleteAddress" name="deleteAddress">
      <drawer-address
        :show="openDeleteAddress"
        initial-mode="remove"
        @close="openDeleteAddress = false"
      />
    </portal-target>
    <portal-target v-if="openAddNewAddress" name="addNewAddress">
      <drawer-address
        :show="openAddNewAddress"
        initial-mode="add"
        @close="openAddNewAddress = false"
      />
    </portal-target>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import VButton from '@components/v-button.vue'
import DrawerAddress from '@components/drawer-addresses.vue'

export default {
  components: {
    VButton,
    DrawerAddress,
  },
  computed: {
    ...mapState('customer', ['customerShopify']),
    ...mapState('subscriptions', ['subscriptions']),
    ...mapState('translations', ['atc']),
  },
  mounted() {
    const activeSubscriptionId = Object.keys(this.subscriptions).find(
      (item) => this.subscriptions[item].active
    )
    this.setActiveSubscriptionId(activeSubscriptionId)
  },
  data() {
    return {
      openEditAddress: false,
      openDeleteAddress: false,
      openAddNewAddress: false,
    }
  },
  methods: {
    ...mapMutations('activeSubscription', ['setActiveSubscriptionId']),

    editAddress(address) {
      this.$store.commit('addresses/setActiveEditAddress', address)
      this.openEditAddress = true
    },
    removeAddress(address) {
      this.$store.commit('addresses/setActiveEditAddress', address)
      this.openDeleteAddress = true
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

.c-address {
  .c-address__header {
    display: flex;
    @include bp(mobile-large-max) {
      display: block;
    }
    h2 {
      color: $color-secondary;
      flex: 1;
    }
    .c-address__ctaContainer {
      display: flex;
      @include bp(mobile-large-max) {
        margin-top: 20px;
      }
    }
  }
  .c-address__divider {
    display: block;
    height: 1px;
    margin: 30px 0;
    border: 0;
    border-top: 1px solid $color-light;
  }
  p {
    color: $color-secondary;
    margin: 5px;
  }
}
.c-address__addNewCTA {
  display: block;
  margin: 30px auto;
  max-width: 300px;
}
</style>
