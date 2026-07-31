import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TownhouseContextService } from '../../../core/townhouse/townhouse-context.service';

interface NavigationItem {
    readonly label: string;
    readonly icon: string;
    readonly badge?: number;
    readonly segment?: string;
}

@Component({
    selector: 'app-bottom-bar',
    imports: [MatBadgeModule, MatIconModule, MatRippleModule, RouterLink, RouterLinkActive],
    templateUrl: './bottom-bar.html',
    styleUrl: './bottom-bar.scss',
})
export class BottomBar {
    readonly townhouseContext = inject(TownhouseContextService);
    readonly navigationItems: readonly NavigationItem[] = [
        { label: 'Início', icon: 'home', segment: '' },
        { label: 'Contribuições', icon: 'notifications', badge: 3 },
        { label: 'Comprovantes', icon: 'receipt' },
        { label: 'Serviços', icon: 'folder' },
    ];
}
