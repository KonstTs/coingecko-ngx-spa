import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, forwardRef, HostBinding, Injector, Input, NgModule, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgModel } from '@angular/forms';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PfInputBase } from '../input-base';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule, MatInput} from '@angular/material/input';
import {MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import { PfButtonComponent, PfButtonConfig } from '../../structure/button/button.component';


const VALUE_ACCESSOR = { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PfTextComponent), multi: true };
const PF_INPUT_BASE = { provide: PfInputBase, useExisting: forwardRef(() => PfTextComponent) };


@UntilDestroy()
@Component({
	selector: 'pf-text',
	standalone: true,
	imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule, MatInputModule, MatFormFieldModule, PfButtonComponent],
	templateUrl: './text.component.html',
	styleUrls: ['./text.component.scss'],
	providers: [VALUE_ACCESSOR, PF_INPUT_BASE],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PfTextComponent extends PfInputBase implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
	@ViewChild(NgModel) model: NgModel;
	@ViewChild('matInput') input: MatInput;
	static nextId = 0;
	searchType = 'string';
	clearBtn: PfButtonConfig;

	@HostBinding() id = `pf-text-${PfTextComponent.nextId++}`;

	@Input() clearable?: boolean;
	@Input() disabled = false;
	@Input() readonly = false;
	@Input() tooltip?: string;
	@Input() tooltipEvent = 'focus';
	@Input() tooltipPosition = 'top';
	@Input() iconClass?: string;
	@Input() iconSize?: string;
	@Input() iconColor?: string;
	@Input() styles?: any;
	@Input() cssClass = '';
	@Input() searchFn$: (e: any) => Observable<any[]>;
	@Input() blurFn: (e: any) => void;
	@Input() searchQuerySize = 3;

	constructor(injector: Injector) {
		super(injector); 
		this.clearBtn = {icon:'close',styleClass:"pf-valign"}
	}

	onBlur(self: PfTextComponent) {
		if (this.blurFn) this.blurFn(self);
	}

	search(e: any) {
		if (this.searchFn$) {
			const count = e.target.value.length;

			let srchto = setTimeout(() => {
				clearTimeout(srchto);
				if (count === 0 || count >= this.searchQuerySize) this.searchFn$(e.target.value).pipe(take(1), untilDestroyed(this)).subscribe();
			}, 400);
		}
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngAfterViewInit(): void {
		super.ngAfterViewInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}
}





