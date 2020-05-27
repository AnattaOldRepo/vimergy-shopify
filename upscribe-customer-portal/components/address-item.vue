<script>
import { mapState } from 'vuex'

export default {
  props: {
    address: {
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
  },
  computed: {
    ...mapState('translations', ['atc']),

    formattedAddress() {
      const { address } = this

      if (!address || this.isEmptyObject(address)) {
        return false
      }
      let string = ''
      string += address.first_name ? `${address.first_name} ` : ''
      string += address.last_name ? `${address.last_name} ` : ''
      string += '<br>'
      string += address.company ? `${address.company}, ` : ''
      string += address.address1 ? `${address.address1}<br> ` : ''
      string += address.address2 ? `${address.address2}, ` : ''
      string += address.city ? `${address.city}, ` : ''
      string += address.province_code ? `${address.province_code} ` : ''
      string += address.zip ? `${address.zip} ` : ''
      // string += address.country ? `<br>${address.country} ` : ''
      return string
    },
    isDefaultAddress() {
      return this.address.default
    },
  },
  methods: {
    editAddress() {
      this.$emit('editAddress', this.address)
    },
  },
}
</script>

<template>
  <div
    v-if="address"
    class="c-addressItem"
    :class="{ 'c-addressItem--selected': isSelected }"
  >
    <div class="c-addressItem__inner" @click="$emit('selectAddress')">
      <div class="c-addressItem__info">
        <span v-if="isDefaultAddress" class="c-addressItem__default"
          >{{ atc['labels.default'] || 'Default'}}</span
        >
        <!-- eslint-disable -->
        <p
          v-if="formattedAddress"
          class="c-addressItem__address"
          v-html="formattedAddress"
        ></p>
        <!-- eslint-enable -->
      </div>
    </div>

    <div v-if="!noEdit" class="c-addressItem__edit" @click="editAddress">
      <svg
        class="c-addressItem__editIcon"
        height="401pt"
        viewBox="0 -1 401.52289 401"
        width="401pt"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m370.589844 250.972656c-5.523438 0-10 4.476563-10 10v88.789063c-.019532 16.5625-13.4375 29.984375-30 30h-280.589844c-16.5625-.015625-29.980469-13.4375-30-30v-260.589844c.019531-16.558594 13.4375-29.980469 30-30h88.789062c5.523438 0 10-4.476563 10-10 0-5.519531-4.476562-10-10-10h-88.789062c-27.601562.03125-49.96875 22.398437-50 50v260.59375c.03125 27.601563 22.398438 49.96875 50 50h280.589844c27.601562-.03125 49.96875-22.398437 50-50v-88.792969c0-5.523437-4.476563-10-10-10zm0 0"
        />
        <path
          d="m376.628906 13.441406c-17.574218-17.574218-46.066406-17.574218-63.640625 0l-178.40625 178.40625c-1.222656 1.222656-2.105469 2.738282-2.566406 4.402344l-23.460937 84.699219c-.964844 3.472656.015624 7.191406 2.5625 9.742187 2.550781 2.546875 6.269531 3.527344 9.742187 2.566406l84.699219-23.464843c1.664062-.460938 3.179687-1.34375 4.402344-2.566407l178.402343-178.410156c17.546875-17.585937 17.546875-46.054687 0-63.640625zm-220.257812 184.90625 146.011718-146.015625 47.089844 47.089844-146.015625 146.015625zm-9.40625 18.875 37.621094 37.625-52.039063 14.417969zm227.257812-142.546875-10.605468 10.605469-47.09375-47.09375 10.609374-10.605469c9.761719-9.761719 25.589844-9.761719 35.351563 0l11.738281 11.734375c9.746094 9.773438 9.746094 25.589844 0 35.359375zm0 0"
        />
      </svg>
      <span class="c-addressItem__editText">{{ atc['actions.editActionText'] || 'Edit'}}</span>
    </div>
  </div>
</template>

<style lang="scss">
@import '@design';

.c-addressItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
}

.c-addressItem__edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0 10px 0 20px;
  cursor: pointer;

  &:hover {
    .c-addressItem__editIcon {
      fill: $color-text;
    }
    .c-addressItem__editText {
      color: $color-text;
    }
  }
}

.c-addressItem__editIcon {
  width: 20px;
  height: 20px;
  margin-bottom: 7px;
  fill: $color-text-light;
  transition: all 0.2s ease;
}

.c-addressItem__editText {
  display: block;
  font-size: 11px;
  color: $color-text-light;
  text-align: center;
  transition: all 0.2s ease;
}

.c-addressItem__inner {
  position: relative;
  width: 100%;
  padding: 18px 18px 15px;
  font-size: 14px;
  color: $color-text;
  background-color: $color-white;
  border: 2px solid transparent;
  border-radius: 5px;

  .c-addressItem--selected & {
    border-color: $color-primary;
  }
}

.c-addressItem__info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.c-addressItem__default {
  display: block;
  margin-bottom: 4px;
  color: $color-gray-500;
}

.c-addressItem__name {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
}

.c-addressItem__address {
  display: block;
  margin: 0;
}

.c-addressItem__addressIcon {
  position: absolute;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);

  svg {
    width: 30px;
  }
}
</style>
