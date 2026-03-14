import { Component } from '@angular/core';
import { SeoService } from '../../service/seo-service';
@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {

  constructor(
    private seo: SeoService
  ) {}


ngOnInit() {
  this.seo.setAboutPage();
  
}
}
