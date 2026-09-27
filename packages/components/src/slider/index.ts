// slider/ —— 目录唯一公共出口：组件、composable、公共类型、常量、meta。
// 公共入口 src/index.ts 由「入口汇总」任务统一聚合，此处不做跨目录导出。
export { default as Slider } from './Slider.vue'

export { useSlider } from './useSlider'
export type { UseSliderEmit, UseSliderOptions, UseSliderReturn } from './useSlider'

export * from './Slider.types'
export * from './Slider.constants'

export { meta as sliderMeta } from './Slider.meta'

import type Slider from './Slider.vue'

/** Slider 组件实例类型（含 focus/blur 暴露）。 */
export type SliderInstance = InstanceType<typeof Slider>
