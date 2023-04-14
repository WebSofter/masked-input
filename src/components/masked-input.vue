<template>
  <div
    ref="selectMasked"
    data-widget-item="baseinput"
    class="flex flex-col relative"
    data-wsofter-maskedinput="component"
  >
    <!--masked-input core-->
    <div data-children="core" class="w-full flex flex-col relative">
      <!---->
      <label
        v-if="label"
        class="cursor-pointer baseinput-label text-sm text-left leading-1dt125 tracking-n0dt1 opacity-80 text-black font-semibold mb-2 select-none"
        :for="name"
        data-children="label"
      >
        <span data-children="labelText">{{ label }}</span>
        <!---->
        <span
          v-if="required"
          data-children="requiredStar"
          class="text-left text-DA1414 font-semibold opacity-80 text-xs"
          >&thinsp;*</span
        >
      </label>
      <!--input-->
      <div
        data-children="inputcore"
        ref="selectMaskedButton"
        class="bg-white baseinput-core border w-full border-purple rounded-sm py-3 px-4 flex flex-shrink flex-nowrap items-center space-x-2"
        :class="{ error: hasError, success: hasSuccess }"
      >
        <span
          @click="toggleSelect()"
          class="inline-flex flex-nowrap items-center space-x-2 cursor-pointer"
          ref="baseMaskedArrow"
          data-children="arrowGroup"
        >
          <img class="mi-select-icon-selected" v-if="icon" :src="icon"/>
          <template v-if="arrow">
            <span v-if="$slots.arrow" class="inline-flex flex-shrink-0">
              <slot name="arrow" />
            </span>
            <span v-else class="inline-flex flex-shrink-0">
              <Down />
            </span>
          </template>
          <span
            class="opacity-50 select-none inline-flex flex-whrink-0 font-semibold text-black text-left text-sm leading-1dt125"
          >
            {{ `+${defaultSelected.dialCode}` }}
          </span>
        </span>
        <!---->
        <input
          data-children="htmlInput"
          :placeholder="placeholder"
          class="border-0 outline-none appearance-none flex-shrink w-full bg-transparent"
          type="text"
          ref="inputBase"
          :name="name"
          :id="name"
          :value="maskedValue"
          @input="onMaskedInput($event)"
          :autocomplete="'off'"
          spellcheck="false"
          v-typing="{
            finish: emitMaskedData,
            timing: 100,
          }"
          v-maska 
          :data-maska="maska"
        />
      </div>
      <!--select option-->
      <div
        ref="selectOptions"
        class="w-full rounded border border-DADEE3 bg-white absolute z-one lbgm-masked-scrll"
        v-if="openSelect"
        data-children="countriesList"
        :class="{
          'bottom-0': popupPos === 'top',
          'mt-mt0dt281 top-full': popupPos === 'bottom',
        }"
        :style="{
          maxHeight: `${listHeight}px`,
        }"
      >
        <div
          class="w-full py-2 px-4 cursor-pointer text-left hover:bg-217-242-236-dt5 mi-option-item"
          v-for="(country, index) in allowedCountries"
          @click="choose(country)"
          :key="index"
          :data-country="country.iso2"
        >
        <!--v-if="icons.map(c => c[country.iso2])[0]" -->
          <img class="mi-select-icon" v-if="icons.filter(c => c[country.iso2])[0][country.iso2]" :src="icons.filter(c => c[country.iso2])[0][country.iso2]"/>
          <span class="font-semibold text-xs text-394452">
            {{ country.name }}
          </span>
        </div>
      </div>
    <!-- end core-->
    </div>

    <!-- messages -->

    <!-- error message -->
    <div
      v-if="hasError"
      data-children="error"
      class="rounded-lg w-full bg-danger-light flex flex-row space-x-1 py-0dt375 px-2 mt-2 items-center select-none"
    >
      <span class="inline-flex flex-shrink-0">
        <Red />
      </span>
      <span class="text-xs text-danger font-medium">{{
        errorMessage ?? ""
      }}</span>
    </div>

    <!-- success message -->
    <div
      v-if="hasSuccess"
      data-children="success"
      class="rounded-lg w-full bg-primary-light flex flex-row space-x-1 py-0dt375 px-2 mt-2 items-center select-none"
    >
      <span class="inline-flex flexshrink-0">
        <Green />
      </span>
      <span class="text-xs text-primary font-medium">{{
        successMessage ?? ""
      }}</span>
    </div>

    <!-- any slot -->
    <slot />
  </div>
</template>

<script setup lang="ts">
export interface Props {
  value?: string;
  label?: string;
  hasError?: boolean;
  hasSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  defaultCountry?: string;
  arrow?: boolean;
  listHeight?: number;
  allowed?: string[];
  icons?: any[];
  maska?: string;
  popupPos?: string;
}

import {
  computed,
  toRef,
  ref,
  onMounted,
  getCurrentInstance,
  watch,
type ComponentInternalInstance,
type Ref,
} from "vue";

import Down from "./icons/chevron-down.vue";
import Red from "./icons/red-info.vue";
import Green from "./icons/green-info.vue";

import countries, { type Country } from "./parts/all-countries";
import parsePhoneNumber from "libphonenumber-js";
import { typing } from "../assets/directives";

const vTyping = { ...typing };

const props = withDefaults(defineProps<Props>(), {
  value: "",
  label: "",
  hasError: false,
  hasSuccess: false,
  successMessage: "",
  errorMessage: "",
  placeholder: "",
  name: "",
  required: false,
  defaultCountry: "RU",
  arrow: true,
  listHeight: 150,
  maska: "",
  popupPos: "bottom",
  allowed: () => [],
  icons: () => [],
});

const emit = defineEmits(["maskedValue", "country", "maskedData"]);

const openSelect: Ref<boolean> = ref(false);
const defaultSelected: Ref<Record<string, string>> = ref<Record<string, string>>({});
const defaultCountry: Ref<string> = toRef(props, "defaultCountry");
const filterCountries: Ref<string[]> = toRef(props, "allowed");
const baseMaskedArrow: Ref<HTMLElement | null> = ref(null);
const maskedValue: Ref<string> = ref("");
const inputBase: Ref<HTMLInputElement | null> = ref(null);

const maska: Ref<string> = toRef(props, "maska"); 
const icon: Ref<string> = ref('');
const popupPos = toRef(props, "popupPos");
const icons = toRef(props, "icons");
const listHeight = toRef(props, "listHeight");
const that: ComponentInternalInstance | null = getCurrentInstance();

/**
 * used to send custom Event: usable in case of scroll turning off when popup is under
 */
const cev_dash_select = () => {
  const event = new CustomEvent("CEV_SELECT_POPUP", {
    detail: { opened: openSelect.value, target: that?.refs.selectMasked },
  });
  document.body.dispatchEvent(event);
};

/**
 * filt allowedCountries from props
 */
const allowedCountries = computed((): Country[] => {
  const tbl: Country[] = filterCountries.value.length !== 0 ? countries.filter((o: Country) => filterCountries.value.includes(o.iso2)) : countries;
  return tbl;
});

/**
 * ToggleSelect
 * to open countries list
 */
const toggleSelect = () => {
  openSelect.value = !openSelect.value;

  // calculate popup position: top or bottom
  const selectRect = (that?.refs.selectMasked as HTMLElement).getBoundingClientRect();
  // y
  popupPos.value = selectRect.bottom < listHeight.value ? "top" : "bottom";
};

/**
 * formatMaskedInput
 * used to format Masked Input
 * @param val
 */
const formatMaskedInput = (val: string): Record<any, any> | undefined => {
  const maskedNumber: any = parsePhoneNumber(`+${val}`);
  if (maskedNumber) {
    maskedValue.value = maskedNumber.nationalNumber;

    return {
      iso2: maskedNumber.country,
      dialCode: maskedNumber.countryCallingCode,
      name: function () {
        return (
          Array.from(countries).find((o: {iso2: string}) => o.iso2 === this.iso2) as unknown as { name: string }
        ).name;
      },
    };
  }
  // else
  return {
    ...Array.from(countries).find((o: {iso2: string}) => o.iso2 === defaultCountry.value),
  };
};

/**
 * emitMasked
 * used to emit masked in internationalFormat
 */
const emitMasked = (): void => {
  icon.value = icons.value.filter(c => c[defaultSelected.value.iso2])[0][defaultSelected.value.iso2]
  if (maskedValue.value) emit("maskedValue", `${defaultSelected.value.dialCode}${maskedValue.value}`);
  else emit("maskedValue", "");
};

/**
 * emitMaskedData
 * Used to emit maskedData as an object
 * @returns {}
 */
const emitMaskedData = (): void => {
  const ph = parsePhoneNumber(
    `+${defaultSelected.value.dialCode}${maskedValue.value}`
  );
  emit("maskedData", {
    icon: icon.value,
    country: ph?.country,
    dialCode: ph?.countryCallingCode,
    nationalNumber: ph?.nationalNumber,
    number: ph?.number,
    isValid: ph?.isValid(),
  });
};

/**
 * emitAll
 * used to emit all event
 */
const emitAll = () :void => {
  emit("country", defaultSelected.value.iso2);
  emitMasked();
  emitMaskedData();
}

/**
 * to select any country
 * @param country
 */
const choose = (country: Country) => {
  defaultSelected.value = country as unknown as Record<string, string>;
  openSelect.value = false;
  emitAll();
};


/**
 * bind on input
 * @param event
 */
const onMaskedInput = (event: any) => {
  event.target.value = maskedValue.value = String(event.target.value) //.replace(/\D/g, "");
  emitMasked();
};

watch(openSelect, () => {
  // dispatch custom HTML event
  cev_dash_select();
});

onMounted(() => {
  // initialize default country selected
  defaultSelected.value = formatMaskedInput(props.value) as Record<any, any>;
  emitAll();

  // outside
  document.addEventListener("click", (event) => {
    if (
      baseMaskedArrow.value &&
      !(baseMaskedArrow.value as HTMLElement).contains(event.target as Node)
    ) {
      openSelect.value = false;
    }
  });
});
</script>

<style scoped lang="scss">
@import '../assets/tailwind.scss';
.mi-select-icon, .mi-select-icon-selected {
  float: left;
  height: 20px;
  width: auto;
  margin-right:3px;
}
.mi-select-icon-selected {
  position: absolute;
}
.mi-option-item {
  line-height: 1;
}
[data-children="countriesList"] {
  overflow-y: auto;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.15));
}

[data-children="inputcore"] {
  input {
    &::placeholder {
      color: gray;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  &.error {
    background: #feefef;
    border: 1px solid #da1414;

    input {
      -webkit-box-shadow: 0 0 0px 1000px #feefef inset !important;
    }
  }

  &.success {
    background: #edf9f0;
    border: 1px solid #5F63F2;

    input {
      -webkit-box-shadow: 0 0 0px 1000px #edf9f0 inset !important;
    }
  }
}
</style>
