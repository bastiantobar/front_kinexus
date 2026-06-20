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
import { QrComponent } from "./pages/qr/qr.component";

// ✅ importa el guard
import { AuthGuard } from "../core/guards/auth.guard";

export const routes: Routes = [
  // Redirige la ruta vacía (raíz) a la página de presentación
  {
    path: "",
    redirectTo: "presentation",
    pathMatch: "full",
  },

  // Rutas públicas (sin layout)
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "recover", component: RecoverComponent },
  { path: "lock", component: LockComponent },
  { path: "maintenance", component: MaintenanceComponent },
  { path: "404", component: Error404Component },
  { path: "500", component: Error500Component },
  { path: "qr", component: QrComponent },

  // Rutas con layout
  {
    path: "",
    component: LayoutComponent,
    children: [
      { path: "", redirectTo: "home", pathMatch: "full" },

      // 👇 Home SIEMPRE accesible
      {
        path: "home",
        loadChildren: () =>
          import("./home/home.module").then((m) => m.HomeModule),
      },

      // 👇 Rutas protegidas (requieren login)
      {
        path: "dashboard",
        loadChildren: () =>
          import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
        canActivate: [AuthGuard],
      },
      {
        path: "widgets",
        loadChildren: () =>
          import("./widgets/widgets.module").then((m) => m.WidgetsModule),
        canActivate: [AuthGuard],
      },
      {
        path: "elements",
        loadChildren: () =>
          import("./elements/elements.module").then((m) => m.ElementsModule),
        canActivate: [AuthGuard],
      },
      {
        path: "forms",
        loadChildren: () =>
          import("./forms/forms.module").then((m) => m.FormsModule),
        canActivate: [AuthGuard],
      },
      {
        path: "charts",
        loadChildren: () =>
          import("./charts/charts.module").then((m) => m.ChartsModule),
        canActivate: [AuthGuard],
      },
      {
        path: "tables",
        loadChildren: () =>
          import("./tables/tables.module").then((m) => m.TablesModule),
        canActivate: [AuthGuard],
      },
      {
        path: "maps",
        loadChildren: () =>
          import("./maps/maps.module").then((m) => m.MapsModule),
        canActivate: [AuthGuard],
      },
      {
        path: "blog",
        loadChildren: () =>
          import("./blog/blog.module").then((m) => m.BlogModule),
        canActivate: [AuthGuard],
      },
      {
        path: "ecommerce",
        loadChildren: () =>
          import("./ecommerce/ecommerce.module").then((m) => m.EcommerceModule),
        canActivate: [AuthGuard],
      },
      {
        path: "extras",
        loadChildren: () =>
          import("./extras/extras.module").then((m) => m.ExtrasModule),
        canActivate: [AuthGuard],
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
