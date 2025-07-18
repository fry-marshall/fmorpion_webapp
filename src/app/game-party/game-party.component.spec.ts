import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePartyComponent } from './game-party.component';

describe('GamePartyComponent', () => {
  let component: GamePartyComponent;
  let fixture: ComponentFixture<GamePartyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePartyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamePartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
