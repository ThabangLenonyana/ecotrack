import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderNavComponent } from './header-nav.component';

describe('HeaderNavComponent', () => {
  let component: HeaderNavComponent;
  let fixture: ComponentFixture<HeaderNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderNavComponent, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderNavComponent);
    component = fixture.componentInstance;
    
    // Set some test data
    component.navItems = [
      { href: '/test', icon: 'fas fa-test', label: 'Test' }
    ];
    component.pageDescriptions = {
      'test': 'Test description'
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should render title', () => {
    component.title = 'Test Title';
    fixture.detectChanges();
    const titleElement = fixture.nativeElement.querySelector('.page-info h2');
    expect(titleElement.textContent).toContain('Test Title');
  });
  
  it('should render navigation items', () => {
    const navElement = fixture.nativeElement.querySelector('nav a');
    expect(navElement.textContent).toContain('Test');
  });
  
  it('should show/hide profile buttons based on input', () => {
    component.showProfileButtons = true;
    fixture.detectChanges();
    let profileSection = fixture.nativeElement.querySelector('.user-section');
    expect(profileSection).toBeTruthy();
    
    component.showProfileButtons = false;
    fixture.detectChanges();
    profileSection = fixture.nativeElement.querySelector('.user-section');
    expect(profileSection).toBeFalsy();
  });
});
