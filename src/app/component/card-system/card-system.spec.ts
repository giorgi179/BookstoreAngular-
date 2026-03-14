import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSystem } from './card-system';

describe('CardSystem', () => {
  let component: CardSystem;
  let fixture: ComponentFixture<CardSystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardSystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSystem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
