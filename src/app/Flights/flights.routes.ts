import { Route, Routes } from "@angular/router";
import { accessServiceGuard } from "../guards/access-service-guard";

export const FLIGHT_ROUTES:Routes=[
    {path:'',redirectTo:'flightsForm',pathMatch:"full"},
    {path:'flightsForm',loadComponent:()=>import('./flight-form/flight-form').then(r=>r.FlightForm)},
    {path:'searchedflights',loadComponent:()=>import('./flight-serched/flight-serched').then(r=>r.FlightSerched)},
    {path:'flightsdetails/:id',loadComponent:()=>import('./sel-flight-details/sel-flight-details').then(r=>r.SelFlightDetails),canActivate:[accessServiceGuard]},
    {path:'flightssummary',loadComponent:()=>import('./sel-flight-Booked-info/sel-flight-info').then(r=>r.SelFlightInfo)},
] 