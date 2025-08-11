import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importa el servicio Router

@Component({
    selector: 'app-init',
    templateUrl: './init.component.html',
    styleUrls: ['./init.component.scss']
})
export class InitComponent implements OnInit {

    // Inyecta el Router en el constructor del componente
    constructor(private router: Router) { }

    ngOnInit() {
    }

    /**
     * Este método se encarga de la redirección a la ruta /dashboard/v3.
     */
    goToListPlan() {
        // Utiliza el método navigate() del router para redirigir
        // Se usa un array para la URL por si se necesitan pasar parámetros
        this.router.navigate(['/login']);
    }
}
