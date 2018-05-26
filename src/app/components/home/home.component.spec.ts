import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { reducers } from '../../reducers/reducers';
import { AppState } from '../../reducers/app.states';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let injector: TestBed;
  let fixture: ComponentFixture<HomeComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers),
      ],
    })
      .compileComponents();
    injector = getTestBed();
    store = injector.get(Store);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
