import { Routes } from "@angular/router";
import { accessServiceGuard } from "../guards/access-service-guard";

export const TOUR_PACKAGES_ROUTES:Routes=[
    {path:'',redirectTo:'tourPackagesForm',pathMatch:'full'},
    {path:'tourPackagesForm',loadComponent:()=>import('./tour-packages-form/tour-packages-form').then(r=>r.TourPackagesForm)},
    {path:'searchedtourPackages',loadComponent:()=>import('./tour-packages-searched/tour-packages-searched').then(r=>r.TourPackagesSearched)},
    {path:'tourPackagesinfo/:pid',loadComponent:()=>import('./sel-tour-packages-info/sel-tour-packages-info').then(r=>r.SelTourPackagesInfo),  canActivate:[accessServiceGuard]},
    {path:'popularPakages',loadComponent:()=>import('./popular-packages/popular-packages').then(r=>r.PopularPackages)},
]