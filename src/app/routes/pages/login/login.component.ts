import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../core/settings/settings.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service'; // Ajusta la ruta según tu proyecto

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  valForm: FormGroup;
  loginError: boolean = false; // Para mostrar errores en la vista

  constructor(
    public settings: SettingsService,
    fb: FormBuilder,
    private authService: AuthService, // Nuevo servicio
    private router: Router
  ) {
    this.valForm = fb.group({
      email: [null, Validators.compose([Validators.required, CustomValidators.email])],
      password: [null, Validators.required],
    });
  }

  submitForm($event: Event, value: any) {
    $event.preventDefault();
    this.loginError = false;

    // Marca todos los campos como "tocados"
    for (let c in this.valForm.controls) {
      this.valForm.controls[c].markAsTouched();
    }

    if (this.valForm.valid) {
      const { email, password } = value;

      this.authService.login(email, password).subscribe({
        next: (res) => {
          console.log('Login exitoso', res);
          this.router.navigate(['/dashboard/v2']); // Ruta post-login
        },
        error: (err) => {
          console.error('Error en login', err);
          this.loginError = true; // Activar mensaje de error
        },
      });
    }
  }

  ngOnInit() {
    // Si ya existe un token, redirige automáticamente
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard/v2']);
    }
  }
}
