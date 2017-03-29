import {Component} from "@angular/core";
import {Store} from "../../model/store";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CommonService} from "../../common/common.service";
import {Stock} from "../../model/stock";
import {ActivatedRoute, Router} from "@angular/router";
import {api} from "../../constants/api";
@Component({
    selector: 'store-update-component',
    templateUrl: './store-update.component.html'
})
export class StoreUpdateComponent {
    storeForm: FormGroup;
    loading: boolean = false;
    store: Store;
    availableStocks: Stock[] = [];
    selectedStocks: Stock[] = [];

    constructor(private storeService: CommonService, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.createEmptyForm();
        this.fillForm();
    }

    private createEmptyForm(): void {
        this.storeForm = new FormGroup({
            name: new FormControl('', Validators.required),
        });
    }

    private fillForm(): void {
        this.storeService.loadById(api.STORE, this.route.snapshot.params['id'])
            .subscribe(store => {
                this.store = store;
                this.selectedStocks = this.store.stockList;
                this.loadStocks();
                this.storeForm.setValue({
                    name: this.store.name
                });
            });
    }

    private loadStocks(): void {
        this.storeService.loadAll(api.STOCK)
            .subscribe(stockList => this.availableStocks = this.cleanAvailableStocks(stockList))
    }

    private cleanAvailableStocks(stockList: Stock[]): Stock[] {
        for (let stock = 0; stock < stockList.length; stock++)
            for (let selectedStock = 0; selectedStock < this.selectedStocks.length; selectedStock++)
                if (stockList[stock].id === this.selectedStocks[selectedStock].id)
                    stockList.splice(stockList.indexOf(stockList[stock]), 1);
        return stockList;
    }

    onSubmit(): void {
        this.loading = true;
        this.store.name = this.storeForm.value.name;
        this.store.stockList = this.selectedStocks;
        this.storeService.update(api.STORE, this.store)
            .subscribe(result => result ? this.router.navigate(['store/store-content']) : this.errorMsg);
    }

    addStockToSelected(stock: Stock): void {
        this.availableStocks.splice(this.availableStocks.indexOf(stock), 1);
        this.selectedStocks.push(stock);
    }

    deleteStockFromSelected(stock: Stock): void {
        this.selectedStocks.splice(this.selectedStocks.indexOf(stock), 1);
        this.availableStocks.push(stock);
    }

    private errorMsg(): void {
        this.loading = false;
        alert("Error!");
    }
}