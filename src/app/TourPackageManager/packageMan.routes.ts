import { Routes } from "@angular/router";

export const PACKAGE_MANAGER:Routes=[
    {path:'',redirectTo:'packageManDash',pathMatch:'full'},
    {path:'packageManDash',loadComponent:()=>import('./tour-package-man-dashboard/tour-package-man-dashboard').then(r=>r.TourPackageManDashboard),children:[

        {path:'',redirectTo:'stats',pathMatch:'full'},
        {path:'stats',loadComponent:()=>import('./stats/stats').then(r=>r.Stats)},
        {path:'createPackage',loadComponent:()=>import('./create-package/create-package').then(r=>r.CreatePackage)},
        {path:'myTours',loadComponent:()=>import('./my-tours/my-tours').then(r=>r.MyTours)},
        {path:'customers',loadComponent:()=>import('./customers/customers').then(r=>r.Customers)},
        {path:'profile',loadComponent:()=>import('../Traveller/profile/profile').then(r=>r.Profile)}

    ]},
]