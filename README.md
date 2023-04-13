# vue-masked-input

Simple masked Input for VueJs

<img width="599" alt="image" src="https://user-images.githubusercontent.com/92580505/182828046-989095ca-f6bf-420e-92fc-98fb99dab25e.png">


## install
```sh
npm i @wsofter/vue-masked-input
```


## Props
  Interface:
  ```ts
  interface Props {
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
 }
  ```

 Default values:
 ```js
 {
  value: "", // like '22997000000', ${dialCode}${nationalNumber}
  label: "",
  hasError: false,
  hasSuccess: false,
  successMessage: "",
  errorMessage: "",
  placeholder: "",
  name: "",
  required: false,
  defaultCountry: "CI",
  arrow: true,
  listHeight: 150,
  allowed: () => ["BJ", "CI"],
 }
 ```

 ## Slots

 ### arrow
 ```html
 <!-- to change arrow icon-->
 <masked-input>
  <template #arrow><icon /><template>
 </masked-input>
 ```

 use global slot to append content at the end of the component.
 ```html
 <masked-input>
   <div>Hello</div>
 </masked-input>
 ```


## Use
 main.ts :
 ```js
  import { maskedInput } from '@wsofter/vue-masked-input';

  // register as global component
  app.component('maskedInput', maskedInput);
 ```
 App.vue :
 ```js
 // import component style
 import '@wsofter/vue-masked-input/style';
 ```

 use component:
 ```html
    <masked-input
      @masked="masked = $event"
      @country="country = $event"
      @maskedData="maskedData = $event"
      name="cmasked"
      label="Entrer votre télémasked"
      required
      :allowed="[]"
      :value="'22997788842'"
    />
 ```
 <img width="675" alt="image" src="https://user-images.githubusercontent.com/92580505/182823223-6be9aa4c-b4d8-4835-aaae-8b79052c0caf.png">

 ```js
  console.log(masked) : 22997788842
  console.log(country) : BJ
  console.log(maskedData) : { "country": "BJ", "dialCode": "229", "nationalNumber": "97788842", "number": "+22997788842", "isValid": true }
 ```

 ## Use it with Vee-validate

 Sample wrapper code:

 ```html
 <template>
  <masked-input
    :has-error="hasError"
    :errorMessage="errorMessage"
    @maskedData="validateMasked"
    ref="maskedInput"
  />
</template>
```
```ts
<script lang="ts">
import { useField } from 'vee-validate';
import { computed, onMounted, getCurrentInstance } from 'vue';

interface IMaskedData {
  country?: string;
  dialCode?: string;
  nationalNumber?: string;
  number?: string;
  isValid?: boolean;
}

export default {
  setup(props: any, context: any) {
    const that: ComponentInternalInstance | null = getCurrentInstance();

    const {
      value: inputValue,
      errorMessage,
      handleBlur,
      handleChange,
      meta,
    } = useField(context.attrs.name, undefined, {
      initialValue: context.attrs.value ? context.attrs.value : '',
      validateOnValueUpdate: false,
    });

    // compute error from vee-validate
    const hasError = computed((): boolean => {
      return errorMessage.value !== undefined;
    });

    const validateMasked = (data: IMaskedData) => {
      handleChange(data.nationalNumber, false);
      context.emit('inputData', data);
    };

    onMounted(() => {
      if (that?.refs.maskedInput.masked) {
        handleChange(that.refs.maskedInput.masked);
      }
    });

    return {
      hasError,
      errorMessage,
      validateMasked,
    };
  },
};
</script>
```

