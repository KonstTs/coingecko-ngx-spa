import { EChartsCoreOption } from "echarts/core";
import { interval } from "rxjs";

export const PF_CHART_OPTIONS: EChartsCoreOption = {
  legend: {},
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  yAxis: { type: 'value'},
  xAxis: { type: 'category', axisLabel: { interval: 0, width:50, overflow: 'truncate' }, axisTick: { alignWithLabel: true } },
  series: [],
  animationEasing: 'elasticOut'
};
  

// formatter: function(d) {
//         return d.name + ' ' + d.data;
//       }