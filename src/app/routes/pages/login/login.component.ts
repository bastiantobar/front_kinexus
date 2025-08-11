import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../core/settings/settings.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { LoginService } from '../../../core/login/login.service'; // Asegúrate de la ruta correcta
import { Router } from '@angular/router'; // Importa el Router

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    valForm: FormGroup;
    loginError: boolean = false; // Variable para mostrar errores en la plantilla

    constructor(
      public settings: SettingsService,
      fb: FormBuilder,
      private loginService: LoginService, // Inyecta tu servicio aquí
      private router: Router // Inyecta el Router
    ) {
        this.valForm = fb.group({
            'email': [null, Validators.compose([Validators.required, CustomValidators.email])],
            'password': [null, Validators.required]
        });
    }

    submitForm($ev, value: any) {
        this.router.navigate(['/dashboard/v2']);
        /*$ev.preventDefault();
        this.loginError = false; // Reinicia el estado del error
        for (let c in this.valForm.controls) {
            this.valForm.controls[c].markAsTouched();
        }
        
        if (this.valForm.valid) {
            this.loginService.login(value).subscribe({
                next: (response) => {
                    console.log('Login exitoso!', response);
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    console.error('Login fallido:', err);
                    this.loginError = true; // Establece el error para mostrarlo en la vista
                }
            });
        }*/
    }

    ngOnInit() {
        // En tu ngOnInit, puedes verificar si ya hay un token y redirigir
        // if (localStorage.getItem('token')) {
        //   this.router.navigate(['/dashboard']);
        // }
    }
}