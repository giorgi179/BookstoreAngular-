import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bookstore } from './bookstore';

describe('Bookstore', () => {
  let component: Bookstore;
  let fixture: ComponentFixture<Bookstore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bookstore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bookstore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
