import { AfterViewInit, booleanAttribute, Component, HostBinding, HostListener, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PfDashboardViewModelService } from './dashboard-viewmodel.service';
// import { DASHBOARD_CONFIG as dbc, constructBarChartDataset, PF_DASHBOARD_COLUMNS as dbc, IPF_DASHBOARD_MODE, IPfDashboardLayoutType, PF_DASHBOARD_LAYOUT_MODES as pflm } from './dashboard-config';
import { DASHBOARD_CONFIG as dbc, IPF_DASHBOARD_MODE, IPfDashboardLayoutType } from './dashboard-config';

import { IPfTableBaseColdef, PfTableComponent } from '../../shared/structure/table/table.component';
import { CommonModule } from '@angular/common';
import { merge, Observable, of, Subscription, switchMap, take, tap } from 'rxjs';
import { PfCoin } from '../../models/coins/coin-global-type';
import { PF_TABLE_COLDEFS_TOKEN } from '../../shared/structure/table/table-viewmodel.service';
import { IPfSelectOptions, PfSelectComponent } from '../../shared/input/select/select.component';
import { SelectMapperService } from '../../services/select-mapper.service';
import { PF_DASHBOARD_FILTERS, PF_TABLE_FILTER_MODEL_TOKEN } from '../../config/filter-defs';
import { FormsModule } from '@angular/forms';
import { LOCALSTORAGE_CACHE_TOKEN, SESSIONSTORAGE_CACHE, PfCacheService, LOCALSTORAGE_CACHE } from '../../config/cache';
import { PfHorizontalScrollerDirective } from '../../directives/horizontal-scroll.directive';
import { PfChartComponent } from '../../shared/structure/charts/pf-chart.component';
import { PF_CELL_FORMATTER_TOKEN, PfCellRenderer } from '../../shared/structure/table/table-cell-renderers';
import { EChartsCoreOption } from 'echarts';
import { PfTextComponent } from '../../shared/input/text/text.component';
import { PfButtonConfig } from '../../shared/structure/button/button.component';
import { PfChartWidgetHeaderComponent } from './dashboard-chart-widget-header.component';
import { PfNotificationService } from '../../services/notification.service';
import { PfBrowserCacheService } from '../../services/browser-cache.service';
import { MatTableDataSource } from '@angular/material/table';
import { IpfSwipeEvent, pfSwipeDirective } from '../../directives/swipe.directive';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PfDeviceService } from '../../services/device.service';
import { PF_CHART_MOBILE_OPTIONS, PF_CHART_OPTIONS } from '../../config/chart-base-options';
@UntilDestroy()
@Component({
	standalone: true,
	imports: [
		PfTableComponent,
		CommonModule, PfSelectComponent,
		FormsModule, PfChartComponent,
		PfTextComponent,
		PfChartWidgetHeaderComponent,
		pfSwipeDirective
	],
	providers: [
		PfNotificationService,
		PfDashboardViewModelService,
		SelectMapperService,
		PfDeviceService,
		SESSIONSTORAGE_CACHE,
		LOCALSTORAGE_CACHE,
		{ provide: PF_CELL_FORMATTER_TOKEN, useFactory: PfCellRenderer },
		{ provide: PF_TABLE_FILTER_MODEL_TOKEN, useValue: PF_DASHBOARD_FILTERS },
		{ provide: PF_TABLE_COLDEFS_TOKEN, useValue: dbc.columns }
	],
	styleUrls: ['./dashboard.component.scss'],
	template: `
		<div class="dashboard --docked" [ngClass]="layout['hostClass']">
			<section class="widget --coins">
				<div class="_header --bg-blue" (click)="(layout['hostClass']==='--max') && provideLayout('default')">
					<div class="pf-ai-jc-center-flex --title">
						<h2 class="pf-mrgr10 pf-ai-jc-center-flex pf-animation-slide-in-right --text-white">
							<span class="pf-icon material-symbols-outlined">paid</span>
							<span class="--text-white">{{ titleCoins }}</span>
						</h2>
						<pf-text
							class="--not-max _filter-txt"
							[iconClass]="'filter_alt'" 
							[iconColor]="'#d5d5d5'" 
							[cssClass]="'pf-table-filter-input'" 
							[clearable]="true" 
							(keyup)="PfTable.onFilter($event)"
						></pf-text>
					</div>
					<div class="pf-ai-jc-center-flex --filters --not-max">
						<pf-select
							class="_filter-coloumns"
							[label]="'Columns'" 
							[options]="columnsMap" 
							[multiple]="true" 
							[(ngModel)]="VM.displayedColumns"
						></pf-select>

						<pf-select
							class="_filter-order"
							[label]="'Order'" 
							[options]="orderOptions" 
							[(ngModel)]="VM.filterModel.order" 
							(ngModelChange)="search$($event)"
						></pf-select>
					</div>
				</div>
				<pf-table 
					[VM]="VM"
					[filterable]="true" 
					[sticky]="true" 
					[pagination]="true"
					[pagesize]="50"
					[pagerClass]="'--not-max'"
				></pf-table>
			</section>

			@if(bootstrapForMobile){
				<section
					#drawer
					id="drawer"
					class="widget --dock __drawer pf-motion-fast"
					[ngClass]="{'pf-invisible pf-user-select-none': (!showDrawer)}"
					swipe='vertical'
					[swipeoptions]="{
						mode:'drawer',
						status: 'closed',
						onSwipeCssClass: '__moving',
						state:{
							closed: { min: -80, max: -80, x:0, y: -90 },
							open: { min:70, max:70, x:0, y: 0 }
						}
					}"
					(onSwipe)="drawerSwiped($event)"
				>

					
				@if(showDrawerTip){
					<div class="pf-swipe-tip pf-animation-fade-out pf-motion-delay-2">
						<div class="pf-swipe-vertical-img pf-swipe-vertical-motion _animation pf-shadow"></div>
					</div>
				}
				
				<pf-chart-widget-header
					[title]="titleCharts"
					[titleIcon]="'bar_chart_4_bars'"
					[actions]="chartActions"
					[headerClass]="'--bg-blue'"
					[stackData]="stackData"
				></pf-chart-widget-header>

				<div class="_charts pf-motion pf-animation-fade-in">
					<pf-chart [options]="chartMobile" [merge]="chartDataM" [sizer]="'._charts'"></pf-chart>
				</div>
			</section>
			}
			@if(!bootstrapForMobile){
				<section class="widget --dock">
					<pf-chart-widget-header
						[title]="titleCharts"
						[titleIcon]="'bar_chart_4_bars'"
						[actions]="chartActions"
						[headerClass]="'--bg-blue'"
						[stackData]="stackData"
					></pf-chart-widget-header>

					<div class="_charts pf-motion pf-animation-fade-in">
						<pf-chart [options]="chartDesktop" [merge]="chartDataD" [sizer]="'._charts'"></pf-chart>
					</div>
				</section>
			}
		</div>
	`
})
export class PfDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

	@ViewChild(PfTableComponent) PfTable: PfTableComponent;
	@ViewChild(PfChartComponent) PFChart: PfChartComponent;
	@ViewChild('drawer', { read: pfSwipeDirective }) drawer: pfSwipeDirective;
	@HostBinding('class.mobile') get mobile() { 
		return this.bootstrapForMobile
	}

	titleCoins = 'Coins';
	titleCharts = 'Charts';

	searchLabel = '';
	columns: IPfTableBaseColdef[];
	columnsMap: any;
	displayedColumns: string[];
	orderOptions: IPfSelectOptions[];
	
	modes: IPF_DASHBOARD_MODE;
	layout: IPfDashboardLayoutType;
	
	chartActions: PfButtonConfig[];
	chartMobile = PF_CHART_MOBILE_OPTIONS;
	chartDesktop = PF_CHART_OPTIONS;
	chartDataD: EChartsCoreOption;
	chartDataM: EChartsCoreOption;
	stackData: EChartsCoreOption;
	
	drawerOpen = false;
	showDrawerTip;
	showDrawer = true;
	userSwipes = false;

	bootstrapForMobile: boolean;

	search$: (e: any) => any;
	currencies$: () => Observable<string[]>;
	 

	constructor(
		public VM: PfDashboardViewModelService,
		private _renderer: Renderer2,
		@Inject(PfDeviceService) private _deviceSvc:PfDeviceService,
		@Inject(SelectMapperService) private _selectMapperSvc: SelectMapperService,
		@Inject(LOCALSTORAGE_CACHE_TOKEN) private _localStorage: PfCacheService,
	) {
		const { layouts, ordering, provideLayoutActionsFor, provideChartData } = dbc;

		this._deviceSvc.isMobile$().subscribe(res => {
			this.bootstrapForMobile = res; 
		})
		
		this.modes = layouts;
		this.orderOptions = ordering;
		this.columnsMap = this.VM.columns.map((c, i) => ({ label: c.header, value: c.columnDef }));
		this.provideLayout('default');

		this.VM.barchart$.subscribe(([d, v]) => { 
			this.chartActions = provideLayoutActionsFor(layouts, this.provideLayout.bind(this));
			const { desktop, mobile, stack } = provideChartData([d, v], this.VM);
			
			this.chartDataD = desktop;
			this.chartDataM = mobile;
			this.stackData = stack;
		});

		this.search$ = (e) => {
			this.PfTable.paginator.pageIndex = this.VM.filterModel.page = 1
			return this.VM.getRows$(this.VM.filterModel).subscribe(res => {
				if (res) this.VM.tableDataSource = new MatTableDataSource(res)
			})
		};

		this.currencies$ = () => {
			return this._selectMapperSvc.currencies() as any;
		};
	}

	provideLayout(type: string) {
		if (this.layout?.id === type) return;
		this.chartActions?.forEach(a => (a.active = a.id === type))
		this.layout = (<any>this.modes)[type];
	}

	drawerSwiped(e:IpfSwipeEvent){
		const {element:{status, state}} = e;
		const limitUp = state[status].max;
		const limitDown = state[status].min;
	
		if (e.incrY <= limitUp) {
			this.provideLayout('default');
		  	e.element.reset();
		  	e.element.status = 'open';
			this.drawerOpen = true;
		}
		if (e.incrY > limitDown) {
			this.provideLayout('min')
			this._renderer.setStyle(e.element.nativeEl, 'transform', `translateY(0)`);
			e.element.status = 'closed';
			e.element.rect.y = 0; 
			this.drawerOpen = false;
		};
		if (e.element.status === 'closed' && e.incrY <= limitDown) { 
			this._renderer.setStyle(e.element.nativeEl, 'transform', `translateY(0)`);
		}
	}

	private cacheDrawerTip(){
		this._localStorage.set('pf-drawer-tip-disable', 'true');
	}
	
	private deCacheDrawerTip$() {
		return this._localStorage.get('pf-drawer-tip-disable')
	}
	

	ngOnInit(): void {
		
	}

	ngAfterViewInit(): void {
		this.deCacheDrawerTip$()
			.pipe(untilDestroyed(this))
			.subscribe(res => { 
				this.showDrawerTip = !res;
				this.cacheDrawerTip();
			});
		
		setTimeout(_ => { 
			this.drawer?.setStatus('open');
			this.drawerOpen = true;
			this.provideLayout('default');
		})
	}

	ngOnDestroy(): void {}
}
