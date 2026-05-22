import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarangayComponent } from './barangay.component';

describe('BarangayComponent', () => {
  let component: BarangayComponent;
  let fixture: ComponentFixture<BarangayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarangayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarangayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
