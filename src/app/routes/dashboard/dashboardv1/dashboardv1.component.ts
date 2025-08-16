import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ColorsService } from "../../../shared/colors/colors.service";
import { ChartDataSets, ChartOptions } from "chart.js";
import { ChartsModule as Ng2ChartsModule } from "ng2-charts";
import { CONST } from "../../../constant/constant";
import { Router } from "@angular/router";

@Component({
  selector: "app-dashboardv1",
  templateUrl: "./dashboardv1.component.html",
  styleUrls: ["./dashboardv1.component.scss"],
})
export class Dashboardv1Component implements OnInit {
  sparkValues = [1, 3, 4, 7, 5, 9, 4, 4, 7, 5, 9, 6, 4];

  barData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        data: [
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
        ],
      },
      {
        data: [
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
          this.rFactor(),
        ],
      },
    ],
  };

  barColors = [
    {
      backgroundColor: this.colors.byName("info"),
      borderColor: this.colors.byName("info"),
      pointHoverBackgroundColor: this.colors.byName("info"),
      pointHoverBorderColor: this.colors.byName("info"),
    },
    {
      backgroundColor: this.colors.byName("primary"),
      borderColor: this.colors.byName("primary"),
      pointHoverBackgroundColor: this.colors.byName("primary"),
      pointHoverBorderColor: this.colors.byName("primary"),
    },
  ];

  barOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
  };

  easyPiePercent: number = 70;
  pieOptions = {
    animate: {
      duration: 800,
      enabled: true,
    },
    barColor: this.colors.byName("info"),
    trackColor: "rgba(200,200,200,0.4)",
    scaleColor: false,
    lineWidth: 10,
    lineCap: "round",
    size: 145,
  };

  sparkOptions1 = {
    barColor: this.colors.byName("info"),
    height: 30,
    barWidth: "5",
    barSpacing: "2",
  };

  sparkOptions2 = {
    type: "line",
    height: 80,
    width: "100%",
    lineWidth: 2,
    lineColor: this.colors.byName("purple"),
    spotColor: "#888",
    minSpotColor: this.colors.byName("purple"),
    maxSpotColor: this.colors.byName("purple"),
    fillColor: "",
    highlightLineColor: "#fff",
    spotRadius: 3,
    resize: true,
  };

  splineHeight = 280;
  splineData: any;
  splineOptions = {
    series: {
      lines: {
        show: false,
      },
      points: {
        show: true,
        radius: 4,
      },
      splines: {
        show: true,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.5,
      },
    },
    grid: {
      borderColor: "#eee",
      borderWidth: 1,
      hoverable: true,
      backgroundColor: "#fcfcfc",
    },
    tooltip: true,
    tooltipOpts: {
      content: (label, x, y) => {
        return x + " : " + y;
      },
    },
    xaxis: {
      tickColor: "#fcfcfc",
      mode: "categories",
    },
    yaxis: {
      min: 0,
      max: 150, // optional: use it for a clear represetation
      tickColor: "#eee",
      // position: ($scope.app.layout.isRTL ? 'right' : 'left'),
      tickFormatter: (v) => {
        return v /* + ' visitors'*/;
      },
    },
    shadowSize: 0,
  };

  constructor(
    public colors: ColorsService,
    public http: HttpClient,
    private router: Router
  ) {
    http
      .get("assets/server/chart/spline.json")
      .subscribe((data) => (this.splineData = data));
  }

  ngOnInit() {}

  colorByName(name) {
    return this.colors.byName(name);
  }

  // random values for demo
  rFactor() {
    return Math.round(Math.random() * 100);
  }
  goToListPlan() {
    this.router.navigate([CONST.ROUTE.ECOMMERCE]);
  }
  
  goToFileManager() {
    this.router.navigate([CONST.ROUTE.FILE_MANAGER]);
  }
}
