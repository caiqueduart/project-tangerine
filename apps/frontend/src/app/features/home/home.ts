import { Component, computed, inject } from '@angular/core';
import { AuthSessionService } from '../../core/auth/services/auth-session.service';

@Component({
    selector: 'app-home',
    imports: [],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    private readonly _authSession = inject(AuthSessionService);

    readonly userName = computed(() => {
        return this._authSession.session()?.user.firstName;
    });
}
