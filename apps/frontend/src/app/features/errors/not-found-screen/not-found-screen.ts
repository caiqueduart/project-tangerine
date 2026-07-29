import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-not-found-screen',
    imports: [MatButtonModule, MatCardModule, MatIconModule],
    templateUrl: './not-found-screen.html',
    styleUrl: './not-found-screen.scss',
})
export class NotFoundScreen {
    private readonly location = inject(Location);

    goBack(): void {
        this.location.back();
    }
}
