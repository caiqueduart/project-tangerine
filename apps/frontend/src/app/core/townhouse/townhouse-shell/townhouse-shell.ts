import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TownhouseContextService } from '../townhouse-context.service';

@Component({
    selector: 'app-townhouse-shell',
    imports: [RouterOutlet],
    templateUrl: './townhouse-shell.html',
})
export class TownhouseShell {
    readonly townhouseContext = inject(TownhouseContextService);
}
