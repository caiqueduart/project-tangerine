import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type LabelTheme = 'blue' | 'green' | 'opaque' | 'orange' | 'red';

@Component({
    selector: 'app-label',
    imports: [MatIconModule],
    templateUrl: './label.component.html',
    styleUrl: './label.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
    readonly text = input.required<string>();
    readonly theme = input<LabelTheme>('opaque');
    readonly icon = input<string>();
}
