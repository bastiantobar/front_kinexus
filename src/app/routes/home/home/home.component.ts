import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router"; // Importa el servicio Router
import { ColorsService } from "../../../shared/colors/colors.service";
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  sparkOptionsInfo = {
    type: "pie",
    sliceColors: [
      this.colors.byName("gray-lighter"),
      this.colors.byName("info"),
    ],
    height: 24,
  };

  sparkOptionsWarning = {
    type: "pie",
    sliceColors: [
      this.colors.byName("gray-lighter"),
      this.colors.byName("warning"),
    ],
    height: 24,
  };

  sparkOptionsSuccess = {
    type: "pie",
    sliceColors: [
      this.colors.byName("gray-lighter"),
      this.colors.byName("success"),
    ],
    height: 24,
  };

  constructor(private router: Router, public colors: ColorsService) {}

  ngOnInit() {}

  goToListPlan() {
    this.router.navigate(["/login"]);
  }
}
