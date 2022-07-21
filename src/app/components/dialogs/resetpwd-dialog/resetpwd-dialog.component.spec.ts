import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetpwdDialogComponent } from './resetpwd-dialog.component';

describe('ResetpwdDialogComponent', () => {
  let component: ResetpwdDialogComponent;
  let fixture: ComponentFixture<ResetpwdDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetpwdDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetpwdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
