import * as am4core from "@amcharts/amcharts4/core"
// import * as am4charts from "@amcharts/amcharts4/charts"

export default function springTheme(target) {
  if (target instanceof am4core.InterfaceColorSet) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      target.setFor("text", am4core.color("#fff"));
    } else {
      target.setFor("text", am4core.color("#122462"));
    }
  }
}