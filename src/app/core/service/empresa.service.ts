import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators"; // Se mantiene tap por si se necesita más adelante
//import { Empresa } from "./empresa.model"; // Importamos el modelo

@Injectable({
  providedIn: "root",
})
export class EmpresaService {
  private apiUrl = "/api/empresas";

  constructor(private http: HttpClient, private router: Router) {}

  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "/planes");
  }
}
