import { Routes } from "@angular/router";
import { LayoutComponent } from "../layout/layout.component";

import { LoginComponent } from "./pages/login/login.component";
import { InitComponent } from "./pages/init/init.component";
import { RegisterComponent } from "./pages/register/register.component";
import { RecoverComponent } from "./pages/recover/recover.component";
import { LockComponent } from "./pages/lock/lock.component";
import { MaintenanceComponent } from "./pages/maintenance/maintenance.component";
import { Error404Component } from "./pages/error404/error404.component";
import { Error500Component } from "./pages/error500/error500.component";
import { HomeComponent } from "./home/home/home.component";

export const routes: Routes = [
  // Redirige la ruta vacía (raíz) a la página de presentación
  {
    path: "",
    redirectTo: "presentation",
    pathMatch: "full",
  },

  // Not lazy-loaded routes (deja estas rutas como están)
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "recover", component: RecoverComponent },
  { path: "lock", component: LockComponent },
  { path: "maintenance", component: MaintenanceComponent },
  { path: "404", component: Error404Component },
  { path: "500", component: Error500Component },
  { path: "home", component: HomeComponent },
  // Rutas protegidas que usarán el LayoutComponent
  {
    path: "",
    component: LayoutComponent,
    children: [
      { path: "", redirectTo: "home", pathMatch: "full" },
      {
        path: "home",
        loadChildren: () =>
          import("./home/home.module").then((m) => m.HomeModule),
      },
      {
        path: "dashboard",
        loadChildren: () =>
          import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
      },
      {
        path: "widgets",
        loadChildren: () =>
          import("./widgets/widgets.module").then((m) => m.WidgetsModule),
      },
      {
        path: "elements",
        loadChildren: () =>
          import("./elements/elements.module").then((m) => m.ElementsModule),
      },
      {
        path: "forms",
        loadChildren: () =>
          import("./forms/forms.module").then((m) => m.FormsModule),
      },
      {
        path: "charts",
        loadChildren: () =>
          import("./charts/charts.module").then((m) => m.ChartsModule),
      },
      {
        path: "tables",
        loadChildren: () =>
          import("./tables/tables.module").then((m) => m.TablesModule),
      },
      {
        path: "maps",
        loadChildren: () =>
          import("./maps/maps.module").then((m) => m.MapsModule),
      },
      {
        path: "blog",
        loadChildren: () =>
          import("./blog/blog.module").then((m) => m.BlogModule),
      },
      {
        path: "ecommerce",
        loadChildren: () =>
          import("./ecommerce/ecommerce.module").then((m) => m.EcommerceModule),
      },
      {
        path: "extras",
        loadChildren: () =>
          import("./extras/extras.module").then((m) => m.ExtrasModule),
      },
    ],
  },

  // Ruta de presentación fuera del layout
  {
    path: "presentation",
    loadChildren: () =>
      import("./presentation/presentation.module").then((m) => m.PresentationModule),
  },

  // Not found (asegúrate de que esto sea lo último)
  { path: "**", redirectTo: "404" },
];
