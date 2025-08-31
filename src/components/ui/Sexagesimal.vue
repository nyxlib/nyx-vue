<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, watch, computed} from 'vue';

/*--------------------------------------------------------------------------------------------------------------------*/
/* VARIABLES                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    format: {
        type: String,
        required: true,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    modelValue: {
        type: String,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const emit = defineEmits(['update:modelValue']);

/*--------------------------------------------------------------------------------------------------------------------*/

const deg = ref('');
const min = ref('');
const sec = ref('');

/*--------------------------------------------------------------------------------------------------------------------*/

const fmt = computed(() => {

    const m = /^%(\d+)\.(\d+)m$/.exec(props.format ?? '');

    if(m)
    {
        const w = parseInt(m[1], 10);
        const f = parseInt(m[2], 10);

        if(!(f === 3 || f === 5 || f === 6 || f === 8 || f === 9))
        {
            return {w: w, f: f};
        }
    }

    return {w: 0, f: 9};
});

/*--------------------------------------------------------------------------------------------------------------------*/

const hasSec = computed(() => fmt.value.f === 6 || fmt.value.f === 8 || fmt.value.f === 9);

/*--------------------------------------------------------------------------------------------------------------------*/

const minDec = computed(() => fmt.value.f === 5 ? 1 : 0);
const secDec = computed(() => fmt.value.f === 8 ? 1 : (fmt.value.f === 9 ? 2 : 0));

const minMax = computed(() => minDec.value ? 59.9 : 59);
const secMax = computed(() => secDec.value === 2 ? 59.99 : (secDec.value === 1 ? 59.9 : 59));

const minStep = computed(() => minDec.value ? 0.1 : 1);
const secStep = computed(() => secDec.value === 2 ? 0.01 : (secDec.value === 1 ? 0.1 : 1));

/*--------------------------------------------------------------------------------------------------------------------*/
/* FUNCTIONS                                                                                                          */
/*--------------------------------------------------------------------------------------------------------------------*/

const parseIn = (s) => {

    const t = (s ?? '').trim();

    if(t)
    {
        const parts = t.split(':').map(x => x.trim());

        /**/ if(parts.length === 3)
        {
            deg.value = parts[0];
            min.value = parts[1];
            sec.value = parts[2];
        }
        else if(parts.length === 2)
        {
            deg.value = parts[0];
            min.value = parts[1];
            sec.value = '';
        }
        else
        {
            deg.value = '';
            min.value = '';
            sec.value = '';
        }
    }
    else
    {
        deg.value = '';
        min.value = '';
        sec.value = '';
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const pad2 = (i) => {

    const s = String(Math.trunc(Math.abs(i)));

    return s.length < 2 ? ('0' + s) : s;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const formatM = (value, f) => {

    const sgn = value < 0 ? '-' : '';

    let v = Math.abs(value);
    let d = Math.floor(v);
    let frac = v - d;

    /**/ if(f === 3)
    {
        let mm = Math.round(frac * 60.0);
        if(mm >= 60) { mm = 0; d++; }
        return `${sgn}${d}:${pad2(mm)}`;
    }
    else if(f === 5)
    {
        let m10 = Math.round(frac * 600.0);
        let mm = Math.trunc(m10 / 10);
        let mt1 = m10 % 10;
        if(mm >= 60) { mm = 0; d++; }
        return `${sgn}${d}:${pad2(mm)}.${mt1}`;
    }
    else if(f === 6)
    {
        let s1 = Math.round(frac * 3600.0);
        let mm = Math.trunc(s1 / 60);
        let ss = s1 % 60;
        if(mm >= 60) { mm = 0; d++; }
        return `${sgn}${d}:${pad2(mm)}:${pad2(ss)}`;
    }
    else if(f === 8)
    {
        let s10 = Math.round(frac * 36000.0);
        let mm = Math.trunc(s10 / 600);
        let ss = Math.trunc((s10 % 600) / 10);
        let st1 = s10 % 10;
        if(mm >= 60) { mm = 0; d++; }
        return `${sgn}${d}:${pad2(mm)}:${pad2(ss)}.${st1}`;
    }
    else /* f === 9 */
    {
        let s100 = Math.round(frac * 360000.0);
        let mm = Math.trunc(s100 / 6000);
        let ss = Math.trunc((s100 % 6000) / 100);
        let st2 = s100 % 100;
        if(mm >= 60) { mm = 0; d++; }
        return `${sgn}${d}:${pad2(mm)}:${pad2(ss)}.${st2.toString().padStart(2, '0')}`;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const toNumber = (s, def = 0) => {

    const number = Number(String(s ?? '').replace(',', '.'));

    return Number.isFinite(number) ? number : def;
};

/*--------------------------------------------------------------------------------------------------------------------*/

const formatOut = () => {

    const _deg = toNumber(deg.value, 0.0);
    const _min = toNumber(min.value, 0.0);
    const _sec = toNumber(sec.value, 0.0);

    const d = Math.max(0.0, Math.trunc(Math.abs(_deg)));
    const m = Math.max(0.0, /*--------------*/  _min  );
    const s = Math.max(0.0, /*--------------*/  _sec  );

    const val = (_deg < 0.0 ? -1.0 : +1.0) * (d + (m / 60.0) + (s / 3600.0));

    return formatM(val, fmt.value.f).padStart(fmt.value.w || 0, ' ');
};

/*--------------------------------------------------------------------------------------------------------------------*/

function onInput()
{
    emit('update:modelValue', formatOut());
}

/*--------------------------------------------------------------------------------------------------------------------*/

watch(() => props.modelValue, parseIn, {immediate: true});

watch(() => props.format, () => {
    onInput();
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

        <input class="form-control text-center"
               :type="readonly ? 'text' : 'number'" inputmode="decimal"
               step="1"
               :readonly="readonly"
               :placeholder="'D'"
               v-model="deg"
               @input="onInput"
        />

        <span class="input-group-text px-2">°</span>

        <input class="form-control text-center"
               :type="readonly ? 'text' : 'number'" :inputmode="minDec ? 'decimal' : 'numeric'"
               :min="0" :max="minMax" :step="minStep"
               :readonly="readonly"
               :placeholder="minDec ? 'MM.m' : 'MM'"
               v-model="min"
               @input="onInput"
        />

        <span class="input-group-text px-2">'</span>

        <template v-if="hasSec">

            <input class="form-control text-center"
                   :type="readonly ? 'text' : 'number'" :inputmode="secDec ? 'decimal' : 'numeric'"
                   :min="0" :max="secMax" :step="secStep"
                   :readonly="readonly"
                   :placeholder="secDec ? 'SS.s' : 'SS'"
                   v-model="sec"
                   @input="onInput"
            />

            <span class="input-group-text px-2">''</span>

        </template>

    <!-- *********************************************************************************************************** -->

</template>
