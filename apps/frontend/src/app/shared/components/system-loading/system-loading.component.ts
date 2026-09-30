import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-system-loading',
    imports: [MatButtonModule],
    templateUrl: './system-loading.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemLoadingComponent {
    readonly failed = input(false);
    readonly retry = output<void>();
}
