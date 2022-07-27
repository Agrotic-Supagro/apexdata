import { NgModule } from '@angular/core';
import { NoPreloading, PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './components/account/account.component';
import { ExportComponent } from './components/export/export.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { MapComponent } from './components/map/map.component';
import { ParcelleDetailComponent } from './components/parcelle-detail/parcelle-detail.component';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [{
    path: '',
    redirectTo: 'home/map',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'home/map',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component : LoginComponent,
  },
  {
    path: 'home',
    component : HomeComponent,
    children: [
      {
        path: 'parcelle-detail/:parcellename',
        component: ParcelleDetailComponent,
      },
      {
          path: 'map',
          component: MapComponent,
      },
      {
        path: 'export',
        component: ExportComponent
      },
      {
          path: 'account',
          component: AccountComponent
      }
    ],
    canActivate: [AuthGuardService]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
