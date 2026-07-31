import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomBar } from '../components/bottom-bar/bottom-bar';
import { TopBar } from '../components/top-bar/top-bar';

@Component({
    selector: 'app-main-layout',
    imports: [BottomBar, RouterOutlet, TopBar],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
})
export class MainLayout {}
